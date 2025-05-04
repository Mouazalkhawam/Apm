<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Group;
use App\Models\Student;
use App\Models\Supervisor;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    public function createProject(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'startdate' => 'required|date',
            'enddate' => 'required|date',
            'students' => 'required|array',
            'supervisors' => 'required|array',
        ]);

        // إنشاء المشروع
        $project = Project::create([
            'title' => $request->title,
            'description' => $request->description,
            'startdate' => $request->startdate,
            'enddate' => $request->enddate,
            'headid' => Auth::user()->userId,
        ]);

        // إنشاء الفريق المرتبط بالمشروع
        $group = Group::create([
            'projectid' => $project->projectid,
            'name' => $request->title,
        ]);

        // ربط الطلاب بالفريق مع إضافة حالة الموافقة
        $group->students()->attach($request->students, ['status' => 'pending']);

        // ربط المشرفين بالفريق مع إضافة حالة الموافقة
        $group->supervisors()->attach($request->supervisors, ['status' => 'pending']);

        // إرسال إشعارات للطلاب
        Student::whereIn('studentId', $request->students)->get()->each(function ($student) {
            NotificationService::sendRealTime($student->userId, "تم اختيارك للانضمام إلى مشروع جديد، يرجى الموافقة.");
        });

        // إرسال إشعارات للمشرفين
        Supervisor::whereIn('supervisorId', $request->supervisors)->get()->each(function ($supervisor) {
            NotificationService::sendRealTime($supervisor->userId, "تم اختيارك كمشرف على مشروع جديد، يرجى الموافقة.");
        });

        return response()->json([
            'success' => true,
            'message' => 'تم إنشاء المشروع بنجاح وإرسال الإشعارات'
        ]);
    }

    public function approveMembership(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,userId',
            'group_id' => 'required|exists:groups,groupid',
        ]);

        $group = Group::findOrFail($request->group_id);

        // تحديث حالة الطالب
        $group->students()->updateExistingPivot($request->user_id, ['status' => 'approved']);

        // تحديث حالة المشرف
        $group->supervisors()->updateExistingPivot($request->user_id, ['status' => 'approved']);

        return response()->json([
            'success' => true,
            'message' => 'تمت الموافقة بنجاح'
        ]);
    }
}