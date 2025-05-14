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
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // التحقق من صلاحيات المنشئ (مشرف أو قائد الفريق)
        $user = Auth::user();
        if (!$user->isSupervisor() && !$user->isTeamLeader()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $task = Task::create([
            'project_stage_id' => $request->project_stage_id,
            'title' => $request->title,
            'description' => $request->description,
            'assigned_to' => $request->assigned_to,
            'status' => 'pending',
            'due_date' => $request->due_date,
            'assigned_by' => $user->userId,
        ]);

        return response()->json($task, 201);
    }

    // عرض مهام مرحلة معينة
    public function getStageTasks($stage_id)
    {
        $tasks = Task::with(['assignee.user', 'assigner'])
            ->where('project_stage_id', $stage_id)
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
    public function submitTask(Request $request, $task_id)
    {
        $task = Task::findOrFail($task_id);
        $user = Auth::user();

        // التحقق من أن المستخدم هو المعيّن للمهمة
        if ($user->student->studentId != $task->assigned_to) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'submission_content' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $submission = TaskSubmission::create([
            'task_id' => $task_id,
            'studentId' => $user->student->studentId,
            'content' => $request->submission_content
        ]);

        return response()->json($submission, 201);
    }

    // تقييم المهمة (للمشرف)
    public function gradeTask(Request $request, $submission_id)
    {
        $submission = TaskSubmission::findOrFail($submission_id);
        $user = Auth::user();

        if (!$user->isSupervisor()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'grade' => 'required|numeric|min:0|max:100',
            'feedback' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $submission->update([
            'grade' => $request->grade,
            'feedback' => $request->feedback
        ]);

        return response()->json($submission);
    }
}