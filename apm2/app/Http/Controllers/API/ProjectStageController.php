<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectStage;
use App\Models\Project;
use App\Models\Group;
use App\Models\Supervisor;
use App\Models\GroupSupervisor; // <-- أهم إضافة
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class ProjectStageController extends Controller
{
    
    public function store(Request $request, $group_id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'order' => 'nullable|integer',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
    
        try {
            // 1. التحقق من وجود المجموعة
            $group = Group::findOrFail($group_id);
    
            // 2. التحقق من وجود مشروع مرتبط بالمجموعة
            if (!$group->project) {
                return response()->json(['message' => 'لا يوجد مشروع مرتبط بهذه المجموعة.'], 404);
            }
    
            // 3. جلب المستخدم الحالي وتحقق أنه مشرف
            $user = Auth::user();
            if (!$user || !$user->isSupervisor()) {
                return response()->json(['message' => 'غير مصرح لك كمشرف.'], 403);
            }
    
            // 4. جلب سجل المشرف والتحقق من صلاحيته
            $supervisor = $user->supervisor;
            if (!$supervisor) {
                return response()->json(['message' => 'سجل المشرف غير موجود.'], 403);
            }
    
            // 5. التحقق من أن المشرف معتمد لهذه المجموعة بالذات
            $isApprovedForGroup = $supervisor->groups()
                ->where('group_supervisor.groupid', $group_id)
                ->where('group_supervisor.status', 'approved')
                ->exists();
    
            if (!$isApprovedForGroup) {
                return response()->json(['message' => 'غير مصرح لك بإدارة هذا المشروع.'], 403);
            }
    
            // 6. التحقق من عدم وجود مرحلة بنفس الترتيب لهذا المشروع
            $existingStage = ProjectStage::where('project_id', $group->project->projectid)
                ->where('order', $request->order ?? 0)
                ->first();
    
            if ($existingStage) {
                return response()->json([
                    'message' => 'يوجد بالفعل مرحلة بنفس الترتيب لهذا المشروع.',
                    'conflicting_stage' => $existingStage
                ], 409); // 409 Conflict
            }
    
            // 7. إنشاء المرحلة الجديدة
            $stage = ProjectStage::create([
                'project_id' => $group->project->projectid,
                'title' => $request->title,
                'description' => $request->description,
                'due_date' => $request->due_date,
                'order' => $request->order ?? 0,
            ]);
    
            return response()->json([
                'message' => 'تم إنشاء مرحلة المشروع بنجاح.',
                'data' => $stage
            ], 201);
    
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'المجموعة غير موجودة.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'حدث خطأ أثناء معالجة الطلب: ' . $e->getMessage()], 500);
        }
    }
    // عرض مراحل المشروع
    public function getByProject($project_id)
    {
        $stages = ProjectStage::where('project_id', $project_id)
            ->orderBy('order')
            ->get();

        return response()->json(['data' => $stages]);
    }

    // حذف مرحلة
    public function destroy($id)
    {
        $stage = ProjectStage::findOrFail($id);

        // التحقق من صلاحية المشرف
        $project = Project::find($stage->project_id);
        $group = Group::where('projectid', $project->projectid)->first();
        $supervisor = Supervisor::where('userId', Auth::id())->first();

        $isAuthorized = GroupSupervisor::where('groupid', $group->groupid)
            ->where('supervisorId', $supervisor->supervisorId)
            ->where('status', 'approved')
            ->exists();

        if (!$isAuthorized) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        $stage->delete();

        return response()->json(['message' => 'Project stage deleted successfully.']);
    }
    /**
 * الحصول على مراحل المشروع بناءً على معرف المجموعة
 *
 * @param int $group_id
 * @return \Illuminate\Http\JsonResponse
 */
    public function getByGroup($group_id)
    {
        // البحث عن المجموعة
        $group = Group::find($group_id);
        
        if (!$group) {
            return response()->json(['message' => 'Group not found.'], 404);
        }

        // التحقق من وجود مشروع مرتبط بالمجموعة
        if (!$group->project) {
            return response()->json(['message' => 'No project associated with this group.'], 404);
        }

        // جلب مراحل المشروع مرتبة
        $stages = ProjectStage::where('project_id', $group->project->projectid)
            ->orderBy('order')
            ->get();

        return response()->json([
            'message' => 'Stages retrieved successfully.',
            'data' => $stages
        ]);
    }
}