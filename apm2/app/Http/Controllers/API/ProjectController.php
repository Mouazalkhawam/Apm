<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\Group;
use App\Models\Student;
use App\Models\Supervisor;
use App\Models\GroupSupervisor;
use App\Models\GroupStudent;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

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
        $user = User::findOrFail($request->user_id);
    
        // تحديث حالة الطالب
        if ($student = Student::where('userId', $user->userId)->first()) {
            GroupStudent::where('groupid', $group->groupid)
                ->where('studentId', $student->studentId)
                ->update(['status' => 'approved']);
        }
    
        // تحديث حالة المشرف
        if ($supervisor = Supervisor::where('userId', $user->userId)->first()) {
            GroupSupervisor::where('groupid', $group->groupid)
                ->where('supervisorId', $supervisor->supervisorId)
                ->update(['status' => 'approved']);
        }
    
        return response()->json(['success' => true]);
    }
    public function getRecommendations(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string',
            'top_n' => 'nullable|integer|min:1|max:20'
        ]);
    
        $students = Student::with(['skills', 'user'])->get()->map(function ($student) {
            return [
                'student_id' => $student->studentId,
                'name' => $student->user->name,
                'skills' => $student->skills->pluck('name')->join(','),
                'experience' => $student->experience,
                'gpa' => $student->gpa
            ];
        });
    
        $response = Http::post('http://localhost:5001/recommend', [
            'students' => $students,
            'query' => $validated['query'] ?? null,
            'top_n' => $validated['top_n'] ?? 10
        ]);
    
        return $response->json();
    }
    
}