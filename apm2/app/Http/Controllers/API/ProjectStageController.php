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
            'title' => 'required|string|max:255|unique:project_stages,title,NULL,id,project_id,' . $request->project_id,
            'description' => 'nullable|string',
            'due_date' => 'required|date|after:today',
            'order' => 'nullable|integer|min:1',
        ], [
            'title.unique' => 'يوجد بالفعل مرحلة بنفس الاسم في هذا المشروع',
            'due_date.after' => 'يجب أن يكون تاريخ الاستحقاق بعد اليوم الحالي'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $group = Group::with('project')->findOrFail($group_id);
            $user = Auth::user();

            if (!$user->isSupervisor() || !$group->isSupervisorApproved($user->supervisor->supervisorId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بإنشاء مراحل في هذا المشروع'
                ], 403);
            }

            // التحقق من عدم وجود تعارض في ترتيب المراحل
            if ($request->order && ProjectStage::where('project_id', $group->project->projectid)
                ->where('order', $request->order)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'يوجد بالفعل مرحلة بنفس الترتيب في هذا المشروع'
                ], 409);
            }

            return DB::transaction(function () use ($request, $group) {
                $stage = ProjectStage::create([
                    'project_id' => $group->project->projectid,
                    'title' => $request->title,
                    'description' => $request->description,
                    'due_date' => $request->due_date,
                    'order' => $request->order ?? ProjectStage::where('project_id', $group->project->projectid)->count() + 1,
                    'status' => 'pending'
                ]);

                // إنشاء مهام معلقة لموافقة المشرفين إذا كان ذلك مطلوبًا
                foreach ($group->approvedSupervisors as $supervisor) {
                    PendingTask::create([
                        'type' => 'stage_approval',
                        'related_id' => $stage->id,
                        'related_type' => ProjectStage::class,
                        'supervisor_id' => $supervisor->supervisorId,
                        'status' => 'pending',
                        'due_date' => $request->due_date
                    ]);
                }

                return response()->json([
                    'success' => true,
                    'data' => $stage,
                    'message' => 'تم إنشاء المرحلة بنجاح'
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء إنشاء المرحلة: ' . $e->getMessage()
            ], 500);
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
            'notes' => 'required|string|min:20',
            'attachments.*' => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:5120',
        ], [
            'notes.min' => 'يجب أن يحتوي وصف التسليم على الأقل 20 حرفًا'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $stage = ProjectStage::with('project.group')->findOrFail($stage_id);
            $user = Auth::user();

            if (!$user->student || !$stage->project->group->isTeamLeader($user->student->studentId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'فقط قائد الفريق يمكنه تسليم المراحل'
                ], 403);
            }

            if ($stage->submissions()->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'تم تسليم هذه المرحلة مسبقاً'
                ], 409);
            }

            return DB::transaction(function () use ($request, $stage, $user) {
                $submission = StageSubmission::create([
                    'project_stage_id' => $stage->id,
                    'submitted_by' => $user->userId,
                    'notes' => $request->notes,
                    'status' => 'submitted',
                    'submitted_at' => now()
                ]);

                // معالجة المرفقات إذا وجدت
                if ($request->hasFile('attachments')) {
                    foreach ($request->file('attachments') as $file) {
                        $fileName = time() . '_' . $file->getClientOriginalName();
                        $filePath = $file->storeAs('stage_attachments', $fileName, 'public');
                        
                        $submission->attachments()->create([
                            'path' => $filePath,
                            'name' => $file->getClientOriginalName(),
                            'size' => $file->getSize()
                        ]);
                    }
                }

                $stage->update(['status' => 'submitted']);

                // إنشاء مهام معلقة لتقييم المرحلة
                foreach ($stage->project->group->approvedSupervisors as $supervisor) {
                    PendingTask::create([
                        'type' => 'stage_evaluation',
                        'related_id' => $submission->id,
                        'related_type' => StageSubmission::class,
                        'supervisor_id' => $supervisor->supervisorId,
                        'status' => 'pending',
                        'due_date' => $stage->due_date
                    ]);

                    NotificationService::sendRealTime(
                        $supervisor->user->userId,
                        "تم تسليم مرحلة جديدة: {$stage->title}",
                        [
                            'type' => 'STAGE_SUBMITTED',
                            'stage_id' => $stage->id,
                            'submission_id' => $submission->id
                        ]
                    );
                }

                return response()->json([
                    'success' => true,
                    'data' => $submission,
                    'message' => 'تم تسليم المرحلة بنجاح وتم إخطار المشرفين'
                ], 201);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تسليم المرحلة: ' . $e->getMessage()
            ], 500);
        }
    }

    public function evaluateStage(Request $request, $submission_id)
    {
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:1000',
            'status' => 'required|in:approved,rejected,needs_revision'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $submission = StageSubmission::with('stage.project.group')->findOrFail($submission_id);
            $user = Auth::user();

            if (!$user->isSupervisor()) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بتقييم المراحل'
                ], 403);
            }

            $group = $submission->stage->project->group;

            if (!$group->isSupervisorApproved($user->supervisor->supervisorId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بتقييم مراحل هذا المشروع'
                ], 403);
            }

            return DB::transaction(function () use ($request, $submission, $user, $group) {
                $submission->update([
                    'grade' => $request->grade,
                    'feedback' => $request->feedback,
                    'status' => $request->status,
                    'evaluated_at' => now(),
                    'evaluated_by' => $user->userId
                ]);

                $submission->stage->update(['status' => $request->status]);

                // تحديث المهمة المعلقة
                PendingTask::where('related_id', $submission->id)
                    ->where('related_type', StageSubmission::class)
                    ->where('supervisor_id', $user->supervisor->supervisorId)
                    ->update(['status' => $request->status]);

                // إرسال إشعارات لجميع أعضاء الفريق
                foreach ($group->approvedStudents as $student) {
                    NotificationService::sendRealTime(
                        $student->user->userId,
                        "تم تقييم مرحلة المشروع: {$submission->stage->title}",
                        [
                            'type' => 'STAGE_EVALUATED',
                            'stage_id' => $submission->stage->id,
                            'status' => $request->status,
                            'grade' => $request->grade
                        ]
                    );
                }

                return response()->json([
                    'success' => true,
                    'data' => $submission,
                    'message' => 'تم تقييم المرحلة بنجاح'
                ]);
            });

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تقييم المرحلة: ' . $e->getMessage()
            ], 500);
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