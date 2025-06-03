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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class ProjectController extends Controller
{
    public function createProject(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'startdate' => 'required|date',
            'enddate' => 'nullable|date|after:startdate',
            'students' => 'nullable|array|min:1|exists:students,studentId',
            'supervisors' => 'required|array|min:1|exists:supervisors,supervisorId'
        ]);

        return DB::transaction(function () use ($request) {
            $creator = Student::where('userId', Auth::id())->firstOrFail();
            
            // إضافة المنشئ تلقائيًا إلى قائمة الطلاب
            $studentsList = array_unique(
                array_merge($request->students, [$creator->studentId])
            );

            // إنشاء المشروع
            $project = Project::create([
                'title' => $request->title,
                'description' => $request->description,
                'startdate' => $request->startdate,
                'enddate' => $request->enddate,
                'headid' => Auth::id(),
            ]);

            // إنشاء الفريق
            $group = Group::create([
                'projectid' => $project->projectid,
                'name' => $request->title,
            ]);

            // ربط الطلاب مع تحديد القائد
            $studentsData = [];
            foreach ($studentsList as $studentId) {
                $studentsData[$studentId] = [
                    'status' => 'pending',
                    'is_leader' => ($studentId == $creator->studentId)
                ];
            }
            $group->students()->attach($studentsData);

            // ربط المشرفين
            $group->supervisors()->attach(
                $request->supervisors,
                ['status' => 'pending']
            );

            // إرسال الإشعارات
            $this->sendNotifications($group, $studentsList, $request->supervisors);

            return response()->json([
                'success' => true,
                'data' => [
                    'project' => $project,
                    'group' => $group->load(['students', 'supervisors'])
                ]
            ], 201);
        });
    }
    private function sendNotifications(Group $group, $students, $supervisors)
    {
        // إشعارات للطلاب
        $group->students()
            ->whereIn('students.studentId', $students)
            ->with('user')
            ->each(function ($student) use ($group) { // <-- تم إضافة use ($group) هنا
                $message = "تمت دعوتك لمشروع {$group->name}";
                $message .= $student->pivot->is_leader ? ' (أنت القائد)' : '';
                
                NotificationService::sendRealTime(
                    $student->user->userId,
                    $message
                );
            });

        // إشعارات للمشرفين (كانت تعمل بشكل صحيح)
        $group->supervisors()
            ->whereIn('supervisors.supervisorId', $supervisors)
            ->with('user')
            ->each(function ($supervisor) use ($group) {
                NotificationService::sendRealTime(
                    $supervisor->user->userId,
                    "تم تعيينك كمشرف على مشروع {$group->name}"
                );
            });
    }
    public function approveMembership(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,userId',
            'group_id' => 'required|exists:groups,groupid',
        ]);

        $user = User::findOrFail($request->user_id);
        $group = Group::findOrFail($request->group_id);

        DB::transaction(function () use ($user, $group) {
            if ($user->role === 'student') {
                GroupStudent::where([
                    'groupid' => $group->groupid,
                    'studentId' => $user->student->studentId
                ])->update(['status' => 'approved']);
            } elseif ($user->role === 'supervisor') {
                GroupSupervisor::where([
                    'groupid' => $group->groupid,
                    'supervisorId' => $user->supervisor->supervisorId
                ])->update(['status' => 'approved']);
            }
        });

        return response()->json(['success' => true]);
    }

    public function getRecommendations(Request $request)
    {
        $validated = $request->validate([
            'query' => 'nullable|string',
            'top_n' => 'nullable|integer|min:1|max:20'
        ]);

        $students = Student::with(['skills', 'user', 'groups'])
            ->get()
            ->map(function ($student) {
                return [
                    'student_id' => $student->studentId,
                    'name' => $student->user->name,
                    'leadership_score' => $student->groups->where('pivot.is_leader', true)->count(),
                    'skills' => $student->skills->pluck('name'),
                    'projects_count' => $student->groups->count()
                ];
            });

        // في الدالة getRecommendations for rranim
        $response = Http::withOptions([
            'verify' => false // ⚠️ لا تستخدم هذا في الإنتاج!
        ])->post('http://localhost:5001/recommend', [
            'students' => $students,
            'query' => $validated['query'] ?? '',
            'top_n' => $validated['top_n'] ?? 10
        ]);

        return response()->json($response->json());
    }

    // دالة جديدة للحصول على القائد
    public function getGroupLeader($groupId)
    {
        $leader = Group::findOrFail($groupId)
            ->students()
            ->wherePivot('is_leader', true)
            ->with('user')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $leader
        ]);
    }
}