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
    // إنشاء مرحلة جديدة لمشروع معين
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'project_id' => 'required|exists:projects,projectid',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'required|date',
            'order' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // جلب المشروع
        $project = Project::findOrFail($request->project_id);

        // جلب المجموعة المرتبطة بالمشروع
        $group = Group::where('projectid', $project->projectid)->first();

        if (!$group) {
            return response()->json(['message' => 'Group not found for this project.'], 404);
        }

        // جلب المشرف الحالي
        $supervisor = Supervisor::where('userId', Auth::id())->first();

        if (!$supervisor) {
            return response()->json(['message' => 'You are not authorized as a supervisor.'], 403);
        }

        // التحقق من الصلاحية باستخدام الجدول الوسيط مباشرة
        $isAuthorized = GroupSupervisor::where('groupid', $group->groupid)
            ->where('supervisorId', $supervisor->supervisorId)
            ->where('status', 'approved')
            ->exists();

        if (!$isAuthorized) {
            return response()->json(['message' => 'You are not authorized to manage this project.'], 403);
        }

        // إنشاء المرحلة
        $stage = ProjectStage::create([
            'project_id' => $project->projectid,
            'title' => $request->title,
            'description' => $request->description,
            'due_date' => $request->due_date,
            'order' => $request->order ?? 0,
        ]);

        return response()->json([
            'message' => 'Project stage created successfully.',
            'data' => $stage
        ], 201);
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
}