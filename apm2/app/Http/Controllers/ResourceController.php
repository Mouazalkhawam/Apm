<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use App\Models\PendingTask;
use App\Models\ProjectCoordinator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ResourceController extends Controller
{
    // عرض الموارد مع تصفية حسب الصلاحيات
    public function index(Request $request)
    {
        $query = Resource::with(['creator', 'reviewer'])
            ->orderBy('created_at', 'desc');

        // تصفية الموارد للطلاب لعرض المعتمدة فقط
        if (Auth::user()->role === 'student') {
            $query->where('status', 'approved');
        }

        // نظام البحث
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->search}%")
                  ->orWhere('description', 'LIKE', "%{$request->search}%");
            });
        }

        // التصفية حسب النوع
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // التصفية حسب الحالة
        if ($request->has('status') && Auth::user()->role !== 'student') {
            $query->where('status', $request->status);
        }

        return $query->paginate(15);
    }

    // عرض مورد معين
    public function show($resourceId)
    {
        $resource = Resource::with(['creator', 'reviewer'])
            ->where('resourceId', $resourceId)
            ->firstOrFail();

        // تحقق من الصلاحية للطلاب
        if (Auth::user()->role === 'student' && $resource->status !== 'approved') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }
            
        return response()->json($resource);
    }

    // إنشاء مورد جديد
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|max:255',
            'type' => 'required|in:tool,reference,article',
            'file' => 'nullable|file|max:10240',
            'link' => 'nullable|url'
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        DB::beginTransaction();
        try {
            $filePath = $request->hasFile('file') ? 
                $request->file('file')->store('resources', 'public') : 
                null;
    
            $status = in_array(Auth::user()->role, ['supervisor', 'coordinator']) 
                ? 'approved' 
                : 'pending';
    
            $resource = Resource::create([
                'title' => $request->title,
                'description' => $request->description,
                'type' => $request->type,
                'filePath' => $filePath,
                'link' => $request->link,
                'status' => $status,
                'created_by' => Auth::id()
            ]);
    
            // إنشاء مهمة معلقة للمنسق إذا كان المورد غير معتمد
            if ($status === 'pending') {
                PendingTask::create([
                    'type' => 'resource_approval',
                    'resource_id' => $resource->resourceId,
                    'coordinator_id' => $this->getCoordinatorId(),
                    'status' => 'pending',
                    'notes' => 'مورد جديد يحتاج إلى مراجعة: ' . $resource->title,
                    'related_type' => 'App\Models\Resource',
                    'related_id' => $resource->resourceId
                ]);
            }
    
            DB::commit();
            return response()->json($resource, 201);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'حدث خطأ أثناء إنشاء المورد',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // دالة مساعدة للحصول على أي دي المنسق
    protected function getCoordinatorId()
    {
        $coordinator = ProjectCoordinator::first();
        return $coordinator ? $coordinator->coordinatorId : null;
    }
    // تحديث المورد (المنشئ أو المنسق فقط)
    public function update(Request $request, $resourceId)
    {
        $resource = Resource::where('resourceId', $resourceId)->firstOrFail();

        // الطلاب يمكنهم التعديل فقط إذا كان المورد معلق
        if (Auth::user()->role === 'student' && $resource->status !== 'pending') {
            return response()->json(['message' => 'لا يمكن التعديل بعد الموافقة'], 403);
        }

        if (Auth::id() !== $resource->created_by && Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|max:255',
            'type' => 'sometimes|in:tool,reference,article',
            'file' => 'nullable|file|max:10240',
            'link' => 'nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->only(['title', 'description', 'type', 'link']);

        if ($request->hasFile('file')) {
            Storage::disk('public')->delete($resource->filePath);
            $data['filePath'] = $request->file('file')->store('resources', 'public');
        }

        $resource->update($data);

        return response()->json($resource);
    }

    // تحديث حالة المورد (المنسق فقط)
    public function updateStatus(Request $request, $resourceId)
    {
        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }
    
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);
    
        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }
    
        DB::beginTransaction();
        try {
            $resource = Resource::where('resourceId', $resourceId)->firstOrFail();
            
            $resource->update([
                'status' => $request->status,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes' => $request->notes
            ]);
    
            // حذف المهمة المعلقة إذا تمت الموافقة
            if ($request->status === 'approved') {
                PendingTask::where('resource_id', $resourceId)
                    ->where('type', 'resource_approval')
                    ->delete();
            }
    
            DB::commit();
            return response()->json($resource);
    
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث حالة المورد',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // حذف المورد (المنسق فقط)
    public function destroy($resourceId)
    {
        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح'], 403);
        }

        $resource = Resource::where('resourceId', $resourceId)->firstOrFail();

        if ($resource->filePath) {
            Storage::disk('public')->delete($resource->filePath);
        }

        $resource->delete();

        return response()->json(['message' => 'تم الحذف بنجاح']);
    }

    public function getUserResources(Request $request)
{
    try {
        $query = Resource::with(['creator', 'reviewer'])
            ->where('created_by', Auth::id())
            ->orderBy('created_at', 'desc');

        // نظام البحث
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->search}%")
                  ->orWhere('description', 'LIKE', "%{$request->search}%");
            });
        }

        // التصفية حسب النوع
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // التصفية حسب الحالة
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $resources = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $resources
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب الموارد',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * جلب الموارد المعلقة للمراجعة (للمنسقين فقط)
 */
public function getPendingResources(Request $request)
{
    // التحقق من صلاحية المنسق
    if (Auth::user()->role !== 'coordinator') {
        return response()->json(['message' => 'غير مصرح'], 403);
    }

    try {
        $query = Resource::with(['creator'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc');

        // نظام البحث
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->search}%")
                  ->orWhere('description', 'LIKE', "%{$request->search}%");
            });
        }

        // التصفية حسب النوع
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $resources = $query->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $resources
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب الموارد المعلقة',
            'error' => $e->getMessage()
        ], 500);
    }
}

/**
 * جلب الموارد المعتمدة
 */
public function getApprovedResources(Request $request)
{
    try {
        $query = Resource::with(['creator', 'reviewer'])
            ->where('status', 'approved')
            ->orderBy('created_at', 'desc');

        // نظام البحث
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('title', 'LIKE', "%{$request->search}%")
                  ->orWhere('description', 'LIKE', "%{$request->search}%");
            });
        }

        // التصفية حسب النوع
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // للطلاب والمشرفين والمنسقين
        return $query->paginate(15);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب الموارد المعتمدة',
            'error' => $e->getMessage()
        ], 500);
    }
}
}