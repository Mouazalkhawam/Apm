<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectStage;
use App\Models\StageSubmission;
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

    public function submitStage(Request $request, $stage_id)
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:pdf,doc,docx,jpg,jpeg,png,zip,rar|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 1. التحقق من وجود المرحلة
            $stage = ProjectStage::findOrFail($stage_id);
            
            // 2. التحقق من وجود مشروع مرتبط بالمرحلة
            $project = $stage->project;
            if (!$project) {
                return response()->json(['message' => 'لا يوجد مشروع مرتبط بهذه المرحلة.'], 404);
            }
            
            // 3. التحقق من وجود مجموعة مرتبطة بالمشروع
            $group = $project->group;
            if (!$group) {
                return response()->json(['message' => 'لا يوجد مجموعة مرتبطة بهذا المشروع.'], 404);
            }
            
            // 4. التحقق من أن المستخدم الحالي هو قائد الفريق
            $user = Auth::user();
            if (!$user || !$user->isTeamLeader($group->groupId)) {
                return response()->json(['message' => 'غير مصرح لك بتسليم هذه المرحلة.'], 403);
            }
            
            // 5. التحقق من عدم وجود تسليم سابق لهذه المرحلة
            $existingSubmission = StageSubmission::where('project_stage_id', $stage_id)->first();
            if ($existingSubmission) {
                return response()->json([
                    'message' => 'تم تسليم هذه المرحلة مسبقاً.',
                    'submission' => $existingSubmission
                ], 409);
            }
            
            // 6. إنشاء تسليم جديد للمرحلة
            $submission = StageSubmission::create([
                'project_stage_id' => $stage_id,
                'submitted_at' => now(),
                'status' => 'submitted',
                'notes' => $request->notes,
            ]);
            
            // 7. حفظ المرفقات إذا وجدت
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('stage_submissions');
                    
                    // يمكنك هنا حفظ معلومات المرفقات في جدول منفصل إذا لزم الأمر
                    // مثلاً: Attachment::create([...]);
                }
            }
            
            return response()->json([
                'message' => 'تم تسليم المرحلة بنجاح.',
                'data' => $submission
            ], 201);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'المرحلة غير موجودة.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'حدث خطأ أثناء معالجة الطلب: ' . $e->getMessage()], 500);
        }
    }

    public function evaluateStage(Request $request, $stage_id)
    {
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string',
            'status' => 'required|in:reviewed',
        ]);

        if ($validator->fails()) {
            \Log::error('Validation failed', ['errors' => $validator->errors(), 'stage_id' => $stage_id]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // 1. جلب المرحلة مع تحميل العلاقات بشكل صريح
            \Log::info('Fetching stage with relations', ['stage_id' => $stage_id]);
            $stage = ProjectStage::with([
                'project' => function($query) {
                    $query->with(['group.groupSupervisors']);
                }
            ])->findOrFail($stage_id);

            // 2. التحقق من وجود المشروع والمجموعة بشكل صريح
            if (!$stage->project) {
                \Log::error('Project not found', ['stage_id' => $stage_id]);
                return response()->json(['message' => 'المشروع غير موجود.'], 404);
            }

            if (!$stage->project->group) {
                \Log::error('Group not found', ['project_id' => $stage->project->projectid]);
                return response()->json(['message' => 'المجموعة غير موجودة.'], 404);
            }

            $group = $stage->project->group;
            \Log::debug('Group loaded', ['group_id' => $group->groupId ?? null]);

            // 3. جلب تسليم المرحلة
            $submission = $stage->submissions()->first();
            if (!$submission) {
                \Log::error('No submission found', ['stage_id' => $stage_id]);
                return response()->json(['message' => 'لا يوجد تسليم لهذه المرحلة.'], 404);
            }

            // 4. التحقق من صلاحيات المشرف
            $user = Auth::user();
            if (!$user || !$user->supervisor) {
                \Log::error('User not authorized', ['user_id' => $user ? $user->id : null]);
                return response()->json(['message' => 'غير مصرح لك بتقييم هذه المرحلة.'], 403);
            }

            // 5. طريقة بديلة للتحقق من صلاحية المشرف
            $supervisorCheck = $group->groupSupervisors()
                ->where('supervisorId', $user->supervisor->supervisorId)
                ->where('status', 'approved')
                ->exists();

            \Log::info('Supervisor authorization check', [
                'group_id' => $group->groupId,
                'supervisor_id' => $user->supervisor->supervisorId,
                'is_approved' => $supervisorCheck,
                'all_supervisors' => $group->groupSupervisors->pluck('supervisorId')
            ]);

            if (!$supervisorCheck) {
                \Log::error('Supervisor authorization failed', [
                    'group_id' => $group->groupId,
                    'supervisor_id' => $user->supervisor->supervisorId,
                    'db_records' => GroupSupervisor::where('groupid', $group->groupId)->get()->toArray()
                ]);
                return response()->json(['message' => 'غير مصرح لك بتقييم هذه المرحلة.'], 403);
            }

            // 6. تحديث التقييم
            $submission->update([
                'grade' => $request->grade,
                'feedback' => $request->feedback,
                'status' => $request->status,
                'reviewed_by' => $user->userId,
                'reviewed_at' => now(),
            ]);

            \Log::info('Stage evaluation successful', [
                'stage_id' => $stage_id,
                'reviewed_by' => $user->userId
            ]);

            return response()->json([
                'message' => 'تم تقييم المرحلة بنجاح.',
                'data' => $submission
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            \Log::error('Model not found', [
                'error' => $e->getMessage(),
                'stage_id' => $stage_id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'المرحلة غير موجودة.'], 404);
        } catch (\Exception $e) {
            \Log::error('Evaluation error', [
                'error' => $e->getMessage(),
                'stage_id' => $stage_id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'حدث خطأ غير متوقع: ' . $e->getMessage()], 500);
        }
    }
    public function getStageSubmission($stage_id)
    {
        try {
            $stage = ProjectStage::findOrFail($stage_id);
            $submission = $stage->submissions()->first();
            
            if (!$submission) {
                return response()->json(['message' => 'لا يوجد تسليم لهذه المرحلة.'], 404);
            }
            
            return response()->json([
                'message' => 'تم جلب تسليم المرحلة بنجاح.',
                'data' => $submission
            ]);
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'المرحلة غير موجودة.'], 404);
        } catch (\Exception $e) {
            return response()->json(['message' => 'حدث خطأ أثناء معالجة الطلب: ' . $e->getMessage()], 500);
        }
    }
}