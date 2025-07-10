<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\ProjectStage;
use App\Models\Student;
use App\Models\TaskSubmission;
use App\Models\PendingTask;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Services\NotificationService;

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
   /**
 * تقديم حل للمهمة مع إنشاء مهام معلقة للمشرفين
 */
/**
 * تقديم حل للمهمة مع إنشاء مهام معلقة للمشرفين
 */
/**
 * تقديم حل للمهمة مع إنشاء مهام معلقة للمشرفين (النسخة المعدلة)
 */
/**
 * تقديم حل للمهمة مع الاستعلامات المتسلسلة المطلوبة
/**
 * تقديم حل للمهمة مع طباعة جميع الـ IDs في مسار الاستعلام
 */
/**
 * تقديم حل للمهمة - النسخة النهائية الكاملة
 */
/**
 * تقديم حل للمهمة - النسخة النهائية الكاملة مع طباعة group_id
 */
/**
 * تقديم حل للمهمة - النسخة النهائية مع استخدام groupId
 */
/**
 * تقديم حل للمهمة مع شرح مفصل لمسار groupId
 */
public function submitTask(Request $request, $task_id)
{
    \Log::info('🚀 بدء عملية تسليم المهمة', ['task_id' => $task_id, 'user' => Auth::id()]);

    // التحقق من صحة البيانات المدخلة
    $validator = Validator::make($request->all(), [
        'content' => 'required|string|min:20',
        'github_repo' => 'required|string',
        'github_commit_url' => 'required|url',
        'commit_description' => 'required|string|max:500',
        'attachment' => 'nullable|file|max:10240',
    ]);

    if ($validator->fails()) {
        \Log::error('❌ فشل التحقق من البيانات', $validator->errors()->toArray());
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // ==================== [1] جلب المهمة ====================
        \Log::debug('🔍 جلب بيانات المهمة...');
        $task = DB::table('tasks')->where('id', $task_id)->first();
        
        if (!$task) {
            throw new \Exception('المهمة غير موجودة');
        }

        \Log::debug('✅ بيانات المهمة', [
            'task_id' => $task->id,
            'project_stage_id' => $task->project_stage_id,
            'assigned_to' => $task->assigned_to
        ]);

        // ==================== [2] التحقق من الصلاحيات ====================
        \Log::debug('🔐 التحقق من صلاحيات المستخدم...');
        $user = Auth::user();
        if ($user->student->studentId != $task->assigned_to) {
            throw new \Exception('غير مصرح لك بتسليم هذه المهمة');
        }

        // ==================== [3] جلب مرحلة المشروع ====================
        \Log::debug('📂 جلب مرحلة المشروع...');
        $stage = DB::table('project_stages')->where('id', $task->project_stage_id)->first();
        
        if (!$stage) {
            throw new \Exception('مرحلة المشروع غير موجودة');
        }

        \Log::debug('✅ مرحلة المشروع', [
            'stage_id' => $stage->id,
            'project_id' => $stage->project_id
        ]);

        // ==================== [4] جلب المشروع الرئيسي ====================
        \Log::debug('📁 جلب المشروع الرئيسي...');
        $project = DB::table('projects')->where('projectid', $stage->project_id)->first();
        
        if (!$project) {
            throw new \Exception('المشروع غير موجود');
        }

        \Log::debug('✅ المشروع الرئيسي', [
            'project_id' => $project->projectid,
            'project_title' => $project->title
        ]);

        // ==================== [5] جلب المجموعة باستعلام مباشر ====================
        \Log::debug('👥 البحث عن المجموعة التابعة للمشروع...');
        $group = DB::table('groups')->where('projectid', $project->projectid)->first();
        
        if (!$group) {
            \Log::critical('❌ لا توجد مجموعة لهذا المشروع', [
                'project_id' => $project->projectid,
                'available_groups' => DB::table('groups')->get()->toArray()
            ]);
            throw new \Exception('لا توجد مجموعة مسجلة لهذا المشروع');
        }

        \Log::debug('🎯 تم العثور على المجموعة', [
            'groupid' => $group->groupid,
            'group_name' => $group->name,
            'project_id_in_group' => $group->projectid
        ]);

        // ==================== [6] جلب المشرفين المعتمدين ====================
        \Log::debug('👨‍🏫 جلب المشرفين المعتمدين للمجموعة...');
        $supervisors = DB::table('group_supervisor')
            ->where('groupid', $group->groupid)
            ->where('status', 'approved')
            ->get();

        \Log::debug('📋 قائمة المشرفين المعتمدين', [
            'groupid' => $group->groupid,
            'total_supervisors' => $supervisors->count(),
            'supervisor_ids' => $supervisors->pluck('supervisorId')
        ]);

        if ($supervisors->isEmpty()) {
            throw new \Exception('لا يوجد مشرفون معتمدون لهذه المجموعة');
        }

        // ==================== [7] إنشاء تسليم المهمة ====================
        \Log::debug('📝 إنشاء تسليم المهمة...');
        $submissionData = [
            'task_id' => $task->id,
            'studentId' => $user->student->studentId,
            'content' => $request->content,
            'github_repo' => $request->github_repo,
            'github_commit_url' => $request->github_commit_url,
            'commit_description' => $request->commit_description,
            'created_at' => now(),
            'updated_at' => now()
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $fileName = time().'_'.Str::slug($file->getClientOriginalName());
            $filePath = $file->storeAs('task_attachments', $fileName, 'public');
            $submissionData['attachment_path'] = $filePath;
            $submissionData['attachment_name'] = $file->getClientOriginalName();
            \Log::debug('📎 تم رفع المرفق', ['file_name' => $fileName]);
        }

        $submissionId = DB::table('task_submissions')->insertGetId($submissionData);
        \Log::info('✅ تم إنشاء تسليم المهمة', ['submission_id' => $submissionId]);

        // ==================== [8] تحديث حالة المهمة ====================
        DB::table('tasks')
            ->where('id', $task->id)
            ->update(['status' => 'completed', 'updated_at' => now()]);
        
        \Log::debug('🔄 تم تحديث حالة المهمة', [
            'task_id' => $task->id,
            'new_status' => 'completed'
        ]);

        // ==================== [9] إنشاء مهام معلقة للمشرفين ====================
        \Log::debug('📌 إنشاء مهام معلقة للمشرفين...');
        foreach ($supervisors as $supervisor) {
            $pendingTaskId = DB::table('pending_tasks')->insertGetId([
                'type' => 'task_evaluation',
                'related_id' => $submissionId,
                'related_type' => 'App\Models\TaskSubmission',
                'supervisor_id' => $supervisor->supervisorId,
                'group_id' => $group->groupid,
                'task_id' => $task->id,
                'status' => 'pending',
                'notes' => "تقييم مهمة: {$task->title}",
                'created_at' => now(),
                'updated_at' => now()
            ]);
            
            \Log::debug('📬 تم إنشاء مهمة معلقة', [
                'pending_task_id' => $pendingTaskId,
                'for_supervisor' => $supervisor->supervisorId
            ]);
        }

        DB::commit();

        \Log::info('🎉 تم تسليم المهمة بنجاح', [
            'task_id' => $task->id,
            'submission_id' => $submissionId,
            'groupid' => $group->groupid,
            'supervisors_notified' => $supervisors->count()
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'submission_id' => $submissionId,
                'task_id' => $task->id,
                'pending_tasks' => $supervisors->count()
            ],
            'message' => 'تم تسليم المهمة بنجاح'
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        \Log::error('💥 فشل في تسليم المهمة', [
            'error' => $e->getMessage(),
            'task_id' => $task_id,
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ: ' . $e->getMessage()
        ], 500);
    }
}
    // تقييم تسليم المهمة من قبل المشرف
   /**
 * تقييم تسليم المهمة (النسخة المعدلة لتعمل مع task_id بدلاً من submission_id)
 */
/**
 * تقييم تسليم المهمة مع حذف المهام المعلقة المتعلقة بها
 */
public function gradeTaskSubmission(Request $request, $task_id)
{
    // التحقق من صحة البيانات المدخلة
    $validator = Validator::make($request->all(), [
        'grade' => 'required|numeric|min:0|max:100',
        'feedback' => 'nullable|string|max:1000',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // ======== [1] جلب المهمة والتحقق من وجودها ========
        $task = Task::with(['stage.project.group'])->find($task_id);
        
        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'المهمة غير موجودة'
            ], 404);
        }

        // ======== [2] جلب آخر تسليم للمهمة ========
        $submission = $task->latestSubmission();
        
        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'لا يوجد تسليم لهذه المهمة'
            ], 404);
        }

        // ======== [3] التحقق من صلاحيات المستخدم ========
        $user = Auth::user();
        $group = $task->stage->project->group;

        // يجب أن يكون المستخدم مشرفاً معتمداً للمجموعة
        if (!$user->isSupervisor() || !$group->isSupervisorApproved($user->supervisor->supervisorId)) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بتقييم هذه المهمة'
            ], 403);
        }

        // ======== [4] تحديث تقييم التسليم ========
        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback,
            'evaluated_at' => now(),
            'evaluated_by' => $user->userId
        ]);

        // ======== [5] حذف جميع المهام المعلقة المتعلقة بهذا التسليم ========
        $deletedPendingTasks = PendingTask::where('related_id', $submission->id)
            ->where('related_type', TaskSubmission::class)
            ->where('task_id', $task->id)
            ->delete();

        \Log::info('🗑️ تم حذف المهام المعلقة', [
            'deleted_count' => $deletedPendingTasks,
            'task_id' => $task->id,
            'submission_id' => $submission->id
        ]);

        // ======== [6] إرسال إشعار للطالب ========
        if ($submission->student && $submission->student->user) {
            NotificationService::sendRealTime(
                $submission->student->user->userId,
                "تم تقييم مهمتك: {$task->title}",
                [
                    'type' => 'TASK_GRADED',
                    'task_id' => $task->id,
                    'grade' => $request->grade,
                    'feedback' => $request->feedback
                ]
            );
        }

        DB::commit();

        return response()->json([
            'success' => true,
            'data' => [
                'task' => $task,
                'submission' => $submission,
                'pending_tasks_deleted' => $deletedPendingTasks
            ],
            'message' => 'تم تقييم المهمة بنجاح وحذف المهام المعلقة المرتبطة بها'
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
        
        if (!$user->student) {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $studentId = $user->student->studentId;

        $totalTasks = Task::where('assigned_to', $studentId)->count();

        $completedTasks = Task::where('assigned_to', $studentId)
            ->where('status', 'completed')
            ->count();

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
    public function checkTaskGrading($task_id)
    {
        try {
            // جلب المهمة مع العلاقات الأساسية
            $task = Task::with(['submissions' => function($query) {
                $query->latest()->limit(1);
            }])->findOrFail($task_id);
            
            // الحصول على آخر تسليم يدوياً
            $submission = $task->submissions->first();
            
            // التحقق من وجود تسليم
            if (!$submission) {
                return response()->json([
                    'success' => true,
                    'is_graded' => false,
                    'message' => 'لم يتم تسليم هذه المهمة بعد'
                ]);
            }
    
            // التحقق من وجود تقييم
            $isGraded = !is_null($submission->grade);
            
            return response()->json([
                'success' => true,
                'is_graded' => $isGraded,
                'grade' => $submission->grade,
                'feedback' => $submission->feedback,
                'submission_date' => $submission->created_at,
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