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
use App\Models\AcademicPeriod;
use App\Models\HonorBoardProject;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class ProjectController extends Controller
{
    public function createProject(Request $request)
    {
        $request->validate([
            'title' => 'required|string',
            'description' => 'nullable|string',
            'students' => 'required|array|min:1|exists:students,studentId',
            'supervisors' => 'required|array|min:1|exists:supervisors,supervisorId',
            'type' => 'required|in:semester,graduation'
        ]);

        return DB::transaction(function () use ($request) {
            $creator = Student::where('userId', Auth::id())->firstOrFail();
            
            // التحقق من شروط المشاريع مع التحقق من حالة approved
            if ($request->type === 'graduation') {
                $this->validateGraduationProject($creator);
                $periods = $this->getGraduationPeriods();
            } else {
                $this->validateSemesterProject($creator);
                $periods = $this->getSemesterPeriod();
            }

            if (empty($periods)) {
                abort(400, 'لا يوجد فصل دراسي فعال حاليًا');
            }

            // إضافة المنشئ تلقائيًا إلى قائمة الطلاب
            $studentsList = array_unique(
                array_merge($request->students, [$creator->studentId])
            );

            // حساب تواريخ البدء والانتهاء
            $startDate = $periods->first()->start_date;
            $endDate = $periods->last()->end_date;

            // إنشاء المشروع
            $project = Project::create([
                'title' => $request->title,
                'description' => $request->description,
                'startdate' => $startDate,
                'enddate' => $endDate,
                'headid' => Auth::id(),
                'type' => $request->type
            ]);

            // ربط المشروع بالفصول الدراسية
            $project->academicPeriods()->attach($periods->pluck('id'));

            // إنشاء الفريق
            $group = Group::create([
                'projectid' => $project->projectid,
                'name' => $request->title,
            ]);

            // ربط الطلاب مع تحديد القائد - حالة approved
            $studentsData = [];
            foreach ($studentsList as $studentId) {
                $studentsData[$studentId] = [
                    'status' => 'approved',
                    'is_leader' => ($studentId == $creator->studentId)
                ];
            }
            $group->students()->attach($studentsData);

            // ربط المشرفين (حالة pending)
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

    protected function getGraduationPeriods()
    {
        $currentPeriod = AcademicPeriod::where('is_current', true)->first();
        
        if (!$currentPeriod) {
            return collect();
        }

        // الحصول على الفصل التالي
        $nextPeriod = AcademicPeriod::where('start_date', '>', $currentPeriod->end_date)
            ->orderBy('start_date', 'asc')
            ->first();

        if (!$nextPeriod) {
            return collect([$currentPeriod]);
        }

        return collect([$currentPeriod, $nextPeriod]);
    }

    protected function getSemesterPeriod()
    {
        return AcademicPeriod::where('is_current', true)->get();
    }

    protected function validateGraduationProject(Student $student)
    {
        // التحقق من وجود مشروع فصلي مكتمل بحالة approved
        $hasCompletedSemesterProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'semester')
                      ->where('status', 'completed');
            })
            ->where('group_student.status', 'approved')
            ->exists();

        if (!$hasCompletedSemesterProject) {
            abort(403, 'يجب أن يكون لديك مشروع فصلي مكتمل (ومقبول) قبل إنشاء مشروع تخرج');
        }

        // التحقق من عدم وجود مشروع تخرج قيد التنفيذ بحالة approved
        $hasActiveGraduationProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'graduation')
                      ->whereIn('status', ['pending', 'in_progress']);
            })
            ->where('group_student.status', 'approved')
            ->exists();

        if ($hasActiveGraduationProject) {
            abort(403, 'لديك بالفعل مشروع تخرج قيد التنفيذ (ومقبول)');
        }
    }

    protected function validateSemesterProject(Student $student)
    {
        // التحقق من عدم وجود مشروع فصلي قيد التنفيذ بحالة approved
        $hasActiveSemesterProject = $student->groups()
            ->whereHas('project', function($query) {
                $query->where('type', 'semester')
                      ->whereIn('status', ['pending', 'in_progress']);
            })
            ->where('group_student.status', 'approved')
            ->exists();

        if ($hasActiveSemesterProject) {
            abort(403, 'لديك بالفعل مشروع فصلي قيد التنفيذ (ومقبول)');
        }
    }

    private function sendNotifications(Group $group, $students, $supervisors)
    {
        // إشعارات للطلاب
        $httpClient = new \GuzzleHttp\Client([
            'verify' => false, // لبيئة التطوير فقط
            // أو استخدام: 'verify' => 'C:/path/to/cacert.pem'
        ]);
        $group->students()
            ->whereIn('students.studentId', $students)
            ->with('user')
            ->each(function ($student) use ($group) {
                $message = "تمت دعوتك لمشروع {$group->name}";
                $message .= $student->pivot->is_leader ? ' (أنت القائد)' : '';
                
                NotificationService::sendRealTime(
                    $student->user->userId,
                    $message
                );
            });

        // إشعارات للمشرفين
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
                
                $skills = $student->skills->pluck('name')->toArray();
                $skills_str = !empty($skills) ? implode(', ', $skills) : '';
                
                return [
                    'student_id' => $student->studentId,
                    'name' => $student->user->name,
                    'skills' => $skills_str,
                    'experience' => $experience_data['text'],
                    'experience_full' => $student->experience,
                    'gpa' => (float)($student->gpa ?? 0.0)
                ];
            });

        $requestData = [
            'students' => $students,
            'query' => $validated['query'] ?? '',
            'top_n' => $validated['top_n'] ?? 20
        ];

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

    public function getStudentProjects()
    {
        $user = Auth::user();
        
        if (!$user->student) {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $projects = Project::with(['group.students', 'group.supervisors', 'academicPeriods'])
            ->whereHas('group', function($query) use ($user) {
                $query->whereHas('students', function($q) use ($user) {
                    $q->where('students.studentId', $user->student->studentId)
                      ->where('group_student.status', 'approved');
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects
        ]);
    }

    public function getStudentProjectDetails($projectId)
    {
        $user = Auth::user();
        
        if (!$user->student) {
            return response()->json(['message' => 'User is not a student'], 400);
        }

        $project = Project::with([
                'group.students.user', 
                'group.supervisors.user',
                'academicPeriods',
                'stages.tasks' => function($query) use ($user) {
                    $query->where('assigned_to', $user->student->studentId)
                        ->with(['submissions', 'assignee.user']);
                }
            ])
            ->where('projectid', $projectId)
            ->whereHas('group', function($query) use ($user) {
                $query->whereHas('students', function($q) use ($user) {
                    $q->where('students.studentId', $user->student->studentId)
                      ->where('group_student.status', 'approved');
                });
            })
            ->first();

        if (!$project) {
            return response()->json(['message' => 'Project not found or unauthorized'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $project
        ]);
    }
 
public function getGroupSupervisors($groupId)
{
    // 1. التحقق من وجود المجموعة
    $group = Group::find($groupId);
    if (!$group) {
        return response()->json(['message' => 'Group not found'], 404);
    }

    // 2. جلب البيانات باستخدام query builder للتأكد
    $supervisors = DB::table('group_supervisor')
                   ->where('groupid', $groupId)
                   ->where('status', 'approved')
                   ->join('supervisors', 'group_supervisor.supervisorId', '=', 'supervisors.supervisorId')
                   ->join('users', 'supervisors.userId', '=', 'users.userId')
                   ->select(
                       'supervisors.supervisorId',
                       'users.name',
                       'users.email',
                       'group_supervisor.created_at'
                   )
                   ->get()
                   ->map(function ($item) {
                       return [
                           'supervisorId' => $item->supervisorId,
                           'name' => $item->name,
                           'email' => $item->email,
                           'since' => \Carbon\Carbon::parse($item->created_at)->diffForHumans()
                       ];
                   });

    if ($supervisors->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'No approved supervisors found',
            'debug' => DB::table('group_supervisor')
                         ->where('groupid', $groupId)
                         ->get()
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $supervisors
    ]);
}
public function getGroupStudents($groupId)
{
    // 1. التحقق من وجود المجموعة
    $group = Group::find($groupId);
    if (!$group) {
        return response()->json(['message' => 'Group not found'], 404);
    }

    // 2. جلب الطلاب المعتمدة عضويتهم في المجموعة مع معلوماتهم
    $students = DB::table('group_student')
        ->where('groupid', $groupId)
        ->where('status', 'approved')
        ->join('students', 'group_student.studentId', '=', 'students.studentId')
        ->join('users', 'students.userId', '=', 'users.userId')
        ->select(
            'students.studentId',
            'users.name',
            'users.email',
            'students.major',
            'group_student.is_leader',
            'group_student.created_at'
        )
        ->get()
        ->map(function ($item) {
            return [
                'studentId' => $item->studentId,
                'name' => $item->name,
                'email' => $item->email,
                'major' => $item->major,
                'is_leader' => (bool)$item->is_leader,
                'since' => Carbon::parse($item->created_at)->diffForHumans()
            ];
        });

    if ($students->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'No approved students found in this group'
        ], 404);
    }

    return response()->json([
        'success' => true,
        'data' => $students
    ]);
}
public function getAcademicAchievements()
{
    try {
        $student = Auth::user()->student;
        
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student profile not found'
            ], 404);
        }

        // الحصول على جميع مجموعات الطالب باستخدام query builder لتجنب التضارب
        $groupIds = DB::table('group_student')
            ->where('studentId', $student->studentId)
            ->where('status', 'approved')
            ->pluck('groupid');

        if ($groupIds->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No approved groups found'
            ]);
        }

        // البحث عن المشاريع المميزة لهذه المجموعات
        $honorProjects = HonorBoardProject::with([
                'project.group' => function($query) use ($groupIds) {
                    $query->whereIn('groups.groupid', $groupIds);
                },
                'project.group.approvedStudents.user',
                'project.group.approvedSupervisors.user'
            ])
            ->whereHas('project.group', function($query) use ($groupIds) {
                $query->whereIn('groups.groupid', $groupIds);
            })
            ->get();

        if ($honorProjects->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No academic achievements found'
            ]);
        }

        // تحضير البيانات للعرض
        $achievements = $honorProjects->map(function ($honorProject) {
            return [
                'project_id' => $honorProject->project->projectid,
                'title' => $honorProject->project->title,
                'description' => $honorProject->project->description,
                'featured_at' => $honorProject->featured_at,
                'notes' => $honorProject->notes,
                'group_members' => $honorProject->project->group->approvedStudents->map(function($student) {
                    return [
                        'name' => $student->user->name,
                        'university_number' => $student->university_number,
                        'is_leader' => $student->pivot->is_leader
                    ];
                }),
                'supervisors' => $honorProject->project->group->approvedSupervisors->map(function($supervisor) {
                    return [
                        'name' => $supervisor->user->name,
                        'email' => $supervisor->user->email
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $achievements,
            'message' => 'Academic achievements retrieved successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve achievements: ' . $e->getMessage()
        ], 500);
    }
}
}