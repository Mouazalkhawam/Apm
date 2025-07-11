<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PendingTask;
use App\Models\Supervisor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PendingTaskController extends Controller
{
    // الحصول على المهام المعلقة للمشرف الحالي
    public function index()
{
    $user = Auth::user();
    
    \Log::info('PendingTaskController accessed', [
        'user_id' => $user->userId,
        'role' => $user->role,
        'is_supervisor' => $user->isSupervisor(),
        'is_coordinator' => $user->isCoordinator()
    ]);

    if (!$user->isSupervisor() && !$user->isCoordinator()) {
        return response()->json(['message' => 'غير مصرح - فقط المشرفون أو منسقو المشاريع يمكنهم عرض المهام المعلقة'], 403);
    }

    try {
        $query = $user->isSupervisor() 
            ? $user->supervisor->pendingTasks()
            : PendingTask::query();

        $tasks = $query->with([
                'supervisor.user' => function($q) {
                    $q->select('userId', 'name', 'email');
                },
                'group' => function($q) {
                    $q->select('groupId', 'name');
                },
                'task' => function($q) {
                    $q->select('id', 'title');
                }
            ])
            ->pending()
            ->latest()
            ->get();

        $pendingTasksCount = $user->isSupervisor() 
            ? $user->supervisor->pendingTasks()->count()
            : PendingTask::count();

        $formattedTasks = [];
        foreach ($tasks as $task) {
            try {
                $relatedData = null;
                $groupData = null;
                
                if ($task->related_type && $task->related_id) {
                    try {
                        $relatedModel = $task->related_type::find($task->related_id);
                        
                        if ($relatedModel instanceof \App\Models\GroupSupervisor) {
                            $relatedModel->load('group.project');
                            $relatedData = [
                                'group_id' => $relatedModel->groupid ?? null,
                                'project_title' => $relatedModel->group->project->title ?? null
                            ];
                        }
                    } catch (\Exception $e) {
                        \Log::warning('Error loading related model', [
                            'task_id' => $task->id,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                // جلب بيانات المجموعة من العلاقة المباشرة
                if ($task->group) {
                    $groupData = [
                        'group_id' => $task->group->groupId,
                        'group_name' => $task->group->name
                    ];
                }

                $formattedTasks[] = [
                    'id' => $task->id,
                    'type' => $task->type,
                    'status' => $task->status,
                    'created_at' => $task->created_at,
                    'notes' => $task->notes,
                    'supervisor' => $task->supervisor->user->only(['name', 'email']),
                    'related_data' => $relatedData,
                    'group_data' => $groupData,
                    'task_data' => $task->task ? $task->task->only(['id', 'title']) : null
                ];

            } catch (\Exception $e) {
                \Log::error('Error processing task', [
                    'task_id' => $task->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'tasks' => $formattedTasks,
                'pending_tasks_count' => $pendingTasksCount
            ],
            'message' => 'تم جلب المهام المعلقة بنجاح'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error in PendingTaskController', [
            'error' => $e->getMessage()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب المهام المعلقة',
            'error_details' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}
    // معالجة المهمة المعلقة (قبول/رفض)
    public function processTask(Request $request, $taskId)
    {
        $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string'
        ]);

        $task = PendingTask::findOrFail($taskId);
        $user = Auth::user();

        // التحقق من أن المشرف الحالي هو صاحب المهمة
        if ($task->supervisor_id != $user->supervisor->supervisorId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($task, $request) {
            $task->update([
                'status' => $request->action == 'approve' ? 'approved' : 'rejected',
                'notes' => $request->notes
            ]);

            // معالجة العنصر المرتبط بناءً على نوع المهمة
            switch ($task->type) {
                case 'membership':
                    $this->processMembership($task);
                    break;
                case 'task_evaluation':
                    $this->processTaskEvaluation($task);
                    break;
                case 'stage_evaluation':
                    $this->processStageEvaluation($task);
                    break;
            }
        });

        return response()->json(['message' => 'Task processed successfully']);
    }

    protected function processMembership($task)
    {
        $groupSupervisor = $task->related;
        
        if ($task->status == 'approved') {
            $groupSupervisor->update(['status' => 'approved']);
            
            // إرسال إشعار بالموافقة
            NotificationService::sendRealTime(
                $groupSupervisor->supervisor->user->userId,
                "تم قبول عضويتك كمشرف على المشروع",
                ['type' => 'SUPERVISOR_MEMBERSHIP_APPROVED']
            );
            
            // حذف المهمة المعلقة بعد اكتمالها
            $task->delete();
        } else {
            $groupSupervisor->update(['status' => 'rejected']);
            
            // إرسال إشعار بالرفض
            NotificationService::sendRealTime(
                $groupSupervisor->supervisor->user->userId,
                "تم رفض عضويتك كمشرف على المشروع",
                ['type' => 'SUPERVISOR_MEMBERSHIP_REJECTED']
            );
            
            // حذف المهمة المعلقة
            $task->delete();
        }
    }
    protected function processTaskEvaluation($task)
    {
        // معالجة تقييم المهمة
        $taskSubmission = $task->related;
        
        if ($task->status == 'approved') {
            // تحديث حالة المهمة كمعتمدة
            $taskSubmission->task->update(['status' => 'approved']);
        }
        
        // يمكنك إضافة المزيد من المنطق هنا
    }

    protected function processStageEvaluation($task)
    {
        // معالجة تقييم المرحلة
        $stageSubmission = $task->related;
        
        if ($task->status == 'approved') {
            // تحديث حالة المرحلة كمعتمدة
            $stageSubmission->update(['status' => 'approved']);
        }
    }

    /**
 * الحصول على المهام المعلقة للمنسق الحالي
 */
/**
 * الحصول على المهام المعلقة للمنسق الحالي
 */
public function getCoordinatorTasks()
{
    $user = Auth::user();
    
    if (!$user->isCoordinator()) {
        return response()->json(['message' => 'غير مصرح - فقط منسقو المشاريع يمكنهم عرض هذه المهام'], 403);
    }

    try {
        $tasks = PendingTask::with([
                'coordinator.user',
                'group',
                'resource',
                'proposal.group'
            ])
            ->forCoordinator($user->coordinator->coordinatorId)
            ->whereIn('type', ['proposal_approval', 'resource_approval']) // فقط هذه الأنواع
            ->pending()
            ->latest()
            ->get();

        $formattedTasks = $tasks->map(function ($task) {
            $taskDetails = [
                'id' => $task->id,
                'type' => $task->type,
                'status' => $task->status,
                'created_at' => $task->created_at->format('Y-m-d H:i'),
                'notes' => $task->notes,
                'coordinator' => $task->coordinator->user->only(['name', 'email']),
            ];

            // إضافة تفاصيل حسب نوع المهمة
            switch ($task->type) {
                case 'proposal_approval':
                    $taskDetails['proposal'] = $task->proposal ? [
                        'id' => $task->proposal->proposalId,
                        'title' => $task->proposal->title,
                        'group' => $task->proposal->group->only(['groupId', 'name'])
                    ] : null;
                    break;

                case 'resource_approval':
                    $taskDetails['resource'] = $task->resource ? [
                        'id' => $task->resource->resourceId,
                        'title' => $task->resource->title,
                        'type' => $task->resource->type
                    ] : null;
                    break;
            }

            return $taskDetails;
        });

        return response()->json([
            'success' => true,
            'count' => $tasks->count(),
            'data' => $formattedTasks,
            'message' => 'تم جلب مهام المنسق المعلقة بنجاح'
        ]);

    } catch (\Exception $e) {
        \Log::error('Error getting coordinator tasks: ' . $e->getMessage());
        
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب المهام المعلقة',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}
    
}