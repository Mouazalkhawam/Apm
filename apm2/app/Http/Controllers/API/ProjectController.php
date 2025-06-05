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
            'enddate' => 'required|date|after:startdate',
            'students' => 'required|array|min:1|exists:students,studentId',
            'supervisors' => 'required|array|min:1|exists:supervisors,supervisorId',
            'type' => 'required|in:semester,graduation'
        ]);

        return DB::transaction(function () use ($request) {
            $creator = Student::where('userId', Auth::id())->firstOrFail();
            
            // التحقق من شروط المشاريع
            if ($request->type === 'graduation') {
                $this->validateGraduationProject($creator);
            } else {
                $this->validateSemesterProject($creator);
            }

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
                'type' => $request->type
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

    protected function validateGraduationProject(Student $student)
    {
        // التحقق من وجود مشروع فصلي مكتمل
        $hasCompletedSemesterProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'semester')
                      ->where('status', 'completed');
            })
            ->exists();

        if (!$hasCompletedSemesterProject) {
            abort(403, 'يجب أن يكون لديك مشروع فصلي مكتمل قبل إنشاء مشروع تخرج');
        }

        // التحقق من عدم وجود مشروع تخرج قيد التنفيذ
        $hasActiveGraduationProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'graduation')
                      ->whereIn('status', ['pending', 'in_progress']);
            })
            ->exists();

        if ($hasActiveGraduationProject) {
            abort(403, 'لديك بالفعل مشروع تخرج قيد التنفيذ');
        }
    }

    protected function validateSemesterProject(Student $student)
    {
        // التحقق من عدم وجود مشروع فصلي قيد التنفيذ
        $hasActiveSemesterProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'semester')
                      ->whereIn('status', ['pending', 'in_progress']);
            })
            ->exists();

        if ($hasActiveSemesterProject) {
            abort(403, 'لديك بالفعل مشروع فصلي قيد التنفيذ');
        }
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
            'top_n' => 'nullable|integer|min:1|max:20',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_gpa' => 'nullable|numeric|min:0|max:4'
        ]);

        $students = Student::with(['skills', 'user', 'groups'])
            ->get()
            ->map(function ($student) {
                // معالجة الخبرات لاستخراج النص والوسائط
                $experience_data = [
                    'text' => '',
                    'media' => []
                ];
                
                if (!empty($student->experience) && is_array($student->experience)) {
                    foreach ($student->experience as $item) {
                        if (is_array($item) && isset($item['type'], $item['content'])) {
                            if ($item['type'] === 'text') {
                                $experience_data['text'] .= ' ' . $item['content'];
                            } else {
                                $experience_data['media'][] = [
                                    'type' => $item['type'],
                                    'content' => $item['content']
                                ];
                            }
                        }
                    }
                    $experience_data['text'] = trim($experience_data['text']);
                }
                
                // معالجة المهارات
                $skills = $student->skills->pluck('name')->toArray();
                $skills_str = !empty($skills) ? implode(', ', $skills) : '';
                
                return [
                    'student_id' => $student->studentId,
                    'name' => $student->user->name,
                    'skills' => $skills_str,
                    'experience' => $experience_data['text'], // إرسال النص فقط للتوصية
                    'experience_full' => $student->experience, // إرسال كل بيانات الخبرة
                    'gpa' => (float)($student->gpa ?? 0.0)
                ];
            });

        $requestData = [
            'students' => $students,
            'query' => $validated['query'] ?? '',
            'top_n' => $validated['top_n'] ?? 20
        ];

        // إضافة فلاتر GPA إذا كانت موجودة
        if (isset($validated['min_gpa'])) {
            $requestData['min_gpa'] = (float)$validated['min_gpa'];
        }
        if (isset($validated['max_gpa'])) {
            $requestData['max_gpa'] = (float)$validated['max_gpa'];
        }

        $response = Http::post('http://localhost:5001/recommend', $requestData);

        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get recommendations',
                'error' => $response->json()
            ], 500);
        }

        // معالجة النتائج لإضافة الوسائط المرتبطة
        $recommendations = $response->json()['data'] ?? [];
        $studentsMap = collect($students)->keyBy('student_id');
        
        $processedRecommendations = array_map(function($item) use ($studentsMap) {
            $studentId = $item['student_id'];
            $originalStudent = $studentsMap[$studentId] ?? null;
            
            if ($originalStudent) {
                $item['experience_media'] = $originalStudent['experience_full'] ?? [];
            }
            
            return $item;
        }, $recommendations);

        return response()->json([
            'status' => 'success',
            'data' => $processedRecommendations
        ]);
    }
}