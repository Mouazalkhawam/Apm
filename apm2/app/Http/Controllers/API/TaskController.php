<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\ProjectStage;
use App\Models\Student;
use App\Models\TaskSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TaskController extends Controller
{
    // إنشاء مهمة جديدة
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_stage_id' => 'required|exists:project_stages,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'assigned_to' => 'required|exists:students,studentId',
            'due_date' => 'required|date',
            'priority' => 'required|in:low,medium,high',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = Auth::user();
        $stage = ProjectStage::with(['project.group'])->findOrFail($request->project_stage_id);
        $group = $stage->project->group;

        // التحقق من الصلاحيات
        $isSupervisorApproved = $user->supervisor && $group->isSupervisorApproved($user->supervisor->supervisorId);
        $isTeamLeader = $user->student && $group->isTeamLeader($user->student->studentId);

        if (!$isSupervisorApproved && !$isTeamLeader) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // التحقق من أن الطالب المعين معتمد في المجموعة
        if (!$group->isStudentApproved($request->assigned_to)) {
            return response()->json(['message' => 'The assigned student is not approved in this group'], 403);
        }

        return DB::transaction(function () use ($request, $user, $group) {
            $task = Task::create([
                'project_stage_id' => $request->project_stage_id,
                'title' => $request->title,
                'description' => $request->description,
                'assigned_to' => $request->assigned_to,
                'status' => 'pending',
                'priority' => $request->priority,
                'due_date' => $request->due_date,
                'assigned_by' => $user->userId,
            ]);

            // إنشاء مهام معلقة للمشرفين لتقييم المهمة
            foreach ($group->approvedSupervisors as $supervisor) {
                PendingTask::create([
                    'type' => 'task_evaluation',
                    'related_id' => $task->id,
                    'related_type' => Task::class,
                    'supervisor_id' => $supervisor->supervisorId,
                    'status' => 'pending'
                ]);
            }

            return response()->json($task, 201);
        });
    }
        // عرض مهام مرحلة معينة
        public function getStageTasks($stage_id)
        {
            $tasks = Task::with(['assignee.user', 'assigner', 'submissions'])
                ->where('project_stage_id', $stage_id)
                ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
                ->get();
        
            return response()->json($tasks);
        }

    // تحديث حالة المهمة
    public function updateStatus(Request $request, $task_id)
    {
        $task = Task::findOrFail($task_id);
        
        // التحقق من صلاحيات المستخدم (المعيّن أو المشرف)
        $user = Auth::user();
        if ($user->userId != $task->assigned_to && !$user->isSupervisor()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,in_progress,completed'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $task->update(['status' => $request->status]);
        return response()->json($task);
    }

    // تقديم حل للمهمة
    // ... (بقية الدوال كما هي)

// تقديم حل للمهمة مع إمكانية رفع ملف
public function submitTask(Request $request, $task_id)
{
    $validator = Validator::make($request->all(), [
        'content' => 'required|string|min:20',
        'github_repo' => 'required|string',
        'github_commit_url' => 'required|url',
        'commit_description' => 'required|string|max:500',
        'attachment' => 'nullable|file|max:10240',
    ], [
        'content.min' => 'يجب أن يحتوي وصف التسليم على الأقل 20 حرفًا'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    try {
        $task = Task::with('stage.project.group')->findOrFail($task_id);
        $user = Auth::user();

        if ($user->student->studentId != $task->assigned_to) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتسليم هذه المهمة'
            ], 403);
        }

        return DB::transaction(function () use ($request, $task, $user) {
            $data = [
                'task_id' => $task->id,
                'studentId' => $user->student->studentId,
                'content' => $request->content,
                'github_repo' => $request->github_repo,
                'github_commit_url' => $request->github_commit_url,
                'commit_description' => $request->commit_description,
            ];

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('task_attachments', $fileName, 'public');

                $data['attachment_path'] = $filePath;
                $data['attachment_name'] = $file->getClientOriginalName();
                $data['attachment_size'] = $file->getSize();
            }

            $submission = TaskSubmission::create($data);
            $task->update(['status' => 'submitted']);

            $group = $task->stage->project->group;

            // إنشاء مهام معلقة لتقييم التسليم
            foreach ($group->approvedSupervisors as $supervisor) {
                PendingTask::create([
                    'type' => 'task_evaluation',
                    'related_id' => $submission->id,
                    'related_type' => TaskSubmission::class,
                    'supervisor_id' => $supervisor->supervisorId,
                    'status' => 'pending',
                    'due_date' => now()->addDays(3)
                ]);

                NotificationService::sendRealTime(
                    $supervisor->user->userId,
                    "تم تسليم المهمة: {$task->title}",
                    [
                        'type' => 'TASK_SUBMITTED',
                        'task_id' => $task->id,
                        'submission_id' => $submission->id
                    ]
                );
            }

            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'تم تسليم المهمة بنجاح وتم إخطار المشرفين'
            ], 201);
        });

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء تسليم المهمة: ' . $e->getMessage()
        ], 500);
    }
}

// ... (بقية الدوال كما هي)

    // تقييم المهمة (للمشرف)
   /**
 * تقييم تسليم مهمة مع تحديث المهمة المعلقة
 *
 * @param Request $request
 * @param int $submission_id
 * @return \Illuminate\Http\JsonResponse
 */
public function gradeTask(Request $request, $submission_id)
{
    // التحقق من وجود التسليم مع تحميل العلاقات
    $submission = TaskSubmission::with([
        'task.stage.project.group',
        'student.user'
    ])->findOrFail($submission_id);

    $user = Auth::user();
    $task = $submission->task;
    $group = $task->stage->project->group;

    // التحقق من أن المستخدم مشرف معتمد في المجموعة
    if (!$user->isSupervisor() || !$group->isSupervisorApproved($user->supervisor->supervisorId)) {
        return response()->json([
            'success' => false,
            'message' => 'غير مصرح لك بتقييم هذه المهمة'
        ], 403);
    }

    // التحقق من صحة البيانات
    $validator = Validator::make($request->all(), [
        'grade' => 'required|numeric|min:0|max:100',
        'feedback' => 'nullable|string|max:1000',
        'status' => 'required|in:approved,rejected,needs_revision'
    ], [
        'grade.min' => 'يجب أن تكون الدرجة بين 0 و 100',
        'grade.max' => 'يجب أن تكون الدرجة بين 0 و 100',
        'status.in' => 'حالة التقييم غير صالحة'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // تحديث تقييم التسليم
        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
            'evaluated_at' => now(),
            'evaluated_by' => $user->userId
        ]);

        // تحديث حالة المهمة الأصلية
        $task->update(['status' => $request->status]);

        // تحديث المهمة المعلقة المرتبطة
        PendingTask::where('related_id', $submission->id)
            ->where('related_type', TaskSubmission::class)
            ->where('supervisor_id', $user->supervisor->supervisorId)
            ->update([
                'status' => $request->status,
                'completed_at' => now()
            ]);

        // إرسال إشعار للطالب
        NotificationService::sendRealTime(
            $submission->student->user->userId,
            "تم تقييم مهمتك: {$task->title}",
            [
                'type' => 'TASK_GRADED',
                'task_id' => $task->id,
                'grade' => $request->grade,
                'status' => $request->status,
                'feedback' => $request->feedback
            ]
        );

        DB::commit();

        return response()->json([
            'success' => true,
            'data' => [
                'submission' => $submission,
                'task_status' => $request->status
            ],
            'message' => 'تم تقييم المهمة بنجاح'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء تقييم المهمة: ' . $e->getMessage()
        ], 500);
    }
}

    public function getStudentTaskStats()
    {
        $user = Auth::user();
        
        // التأكد من أن المستخدم طالب
        if (!$user->student) {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $studentId = $user->student->studentId;

        // عدد المهام الكلية المسندة للطالب
        $totalTasks = Task::where('assigned_to', $studentId)->count();

        // عدد المهام المكتملة (التي لها submissions)
        $completedTasks = Task::where('assigned_to', $studentId)
            ->whereHas('submissions')
            ->count();

        // عدد المهام غير المكتملة (ليس لها submissions)
        $incompleteTasks = $totalTasks - $completedTasks;

        return response()->json([
            'total_tasks' => $totalTasks,
            'completed_tasks' => $completedTasks,
            'incomplete_tasks' => $incompleteTasks,
        ]);
    }

    public function getUserTasks()
    {
        $user = Auth::user();
        
        if ($user->student) {
            $tasks = Task::with(['stage.project', 'assignee.user', 'assigner', 'submissions'])
                ->where('assigned_to', $user->student->studentId)
                ->orderBy('due_date', 'asc')
                ->get();
                
            return response()->json([
                'success' => true,
                'data' => $tasks
            ]);
        }
        
        if ($user->supervisor) {
            $projects = $user->supervisor->groups()->with('project.stages.tasks.submissions')->get();
            
            $tasks = collect();
            foreach ($projects as $project) {
                foreach ($project->project->stages as $stage) {
                    $tasks = $tasks->merge($stage->tasks);
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $tasks
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'User is not a student or supervisor'
        ], 400);
    }
    /**
 * الحصول على مهام الطالب لمشروع معين
 */
    public function getStudentProjectTasks($projectId)
    {
        $user = Auth::user();
        
        if (!$user->student) {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $tasks = Task::with(['stage', 'assigner', 'submissions'])
            ->whereHas('stage.project.group.students', function($query) use ($user) {
                $query->where('students.studentId', $user->student->studentId)
                    ->where('group_student.status', 'approved');
            })
            ->whereHas('stage.project', function($query) use ($projectId) {
                $query->where('projectid', $projectId);
            })
            ->where('assigned_to', $user->student->studentId)
            ->orderByRaw("FIELD(priority, 'high', 'medium', 'low')")
            ->orderBy('due_date', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $tasks
        ]);
    }

    public function downloadAttachment($submission_id)
    {
        $submission = TaskSubmission::findOrFail($submission_id);
        $user = Auth::user();

        // التحقق من الصلاحيات (المشرف أو صاحب التسليم)
        $isOwner = $user->student && $user->student->studentId == $submission->studentId;
        $isSupervisor = $user->isSupervisor();

        if (!$isOwner && !$isSupervisor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (!$submission->hasAttachment()) {
            return response()->json(['message' => 'No attachment found'], 404);
        }

        $path = storage_path('app/public/' . $submission->attachment_path);
        
        return response()->download($path, $submission->attachment_name);
    }
    public function gradeTaskSubmission(Request $request, $task_id)
    {
        // 1. التحقق من وجود المهمة
        $task = Task::with('submissions')->findOrFail($task_id);
        
        // 2. التحقق من أن المستخدم مشرف
        $user = Auth::user();
        if (!$user->isSupervisor()) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح - يجب أن تكون مشرفاً لتقييم المهام'
            ], 403);
        }

        // 3. التحقق من وجود تسليم للمهمة
        if ($task->submissions->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد تسليم لهذه المهمة بعد'
            ], 404);
        }

        // 4. التحقق من صحة البيانات المدخلة
        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 5. تحديث تقييم التسليم
        try {
            // نأخذ آخر تسليم للمهمة
            $submission = $task->submissions->last();
            
            $submission->update([
                'grade' => $request->grade,
                'feedback' => $request->feedback
            ]);

            return response()->json([
                'success' => true,
                'data' => $submission,
                'message' => 'تم تقييم التسليم بنجاح'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء تقييم التسليم: ' . $e->getMessage()
            ], 500);
        }
    }
    public function checkTaskGrading($task_id)
    {
        try {
            // 1. التحقق من وجود المهمة
            $task = Task::findOrFail($task_id);
            
            // 2. التحقق من وجود تسليم للمهمة
            $submission = TaskSubmission::where('task_id', $task_id)
                ->orderBy('created_at', 'desc')
                ->first();

            if (!$submission) {
                return response()->json([
                    'success' => true,
                    'is_graded' => false,
                    'message' => 'لم يتم تسليم هذه المهمة بعد'
                ]);
            }

            // 3. التحقق من وجود تقييم للتسليم
            $isGraded = !is_null($submission->grade);

            return response()->json([
                'success' => true,
                'is_graded' => $isGraded,
                'grade' => $isGraded ? $submission->grade : null,
                'feedback' => $isGraded ? $submission->feedback : null,
                'message' => $isGraded 
                    ? 'تم تقييم هذه المهمة' 
                    : 'تم تسليم المهمة ولكن لم يتم تقييمها بعد'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التحقق من تقييم المهمة: ' . $e->getMessage()
            ], 500);
        }
    }
}