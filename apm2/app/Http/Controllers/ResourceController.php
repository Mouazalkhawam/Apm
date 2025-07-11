<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

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

        $filePath = $request->hasFile('file') ? 
            $request->file('file')->store('resources', 'public') : 
            null;

        // تحديد حالة المورد حسب دور المستخدم
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

        return response()->json($resource, 201);
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

        $resource = Resource::where('resourceId', $resourceId)->firstOrFail();

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $resource->update([
            'status' => $request->status,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes' => $request->notes
        ]);

        return response()->json($resource);
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
}