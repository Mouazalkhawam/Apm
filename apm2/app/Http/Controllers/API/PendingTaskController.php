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
        
        if (!$user->supervisor) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $tasks = PendingTask::with(['related', 'supervisor.user'])
            ->forSupervisor($user->supervisor->supervisorId)
            ->pending()
            ->get();

        return response()->json(['data' => $tasks]);
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
        $related = $task->related;
        
        if ($task->status == 'approved') {
            $related->update(['status' => 'approved']);
            
            // إرسال إشعار بالموافقة
            NotificationService::sendRealTime(
                $related->user->userId,
                "تم قبول عضويتك في المشروع",
                ['type' => 'MEMBERSHIP_APPROVED']
            );
        } else {
            $related->update(['status' => 'rejected']);
            
            // إرسال إشعار بالرفض
            NotificationService::sendRealTime(
                $related->user->userId,
                "تم رفض عضويتك في المشروع",
                ['type' => 'MEMBERSHIP_REJECTED']
            );
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
}