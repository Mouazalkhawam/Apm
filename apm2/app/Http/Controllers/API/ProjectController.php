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

            // ربط الطلاب - فقط المنشئ يكون approved و leader
            $studentsData = [];
            
            // إضافة المنشئ كقائد ومعتمد
            $studentsData[$creator->studentId] = [
                'status' => 'approved',
                'is_leader' => true
            ];
            
            // إضافة باقي الطلاب ك pending وغير قادة
            foreach ($request->students as $studentId) {
                if ($studentId != $creator->studentId) {
                    $studentsData[$studentId] = [
                        'status' => 'pending',
                        'is_leader' => false
                    ];
                }
            }
            
            $group->students()->attach($studentsData);

            // ربط المشرفين (جميعهم بحالة pending)
            $group->supervisors()->attach(
                $request->supervisors,
                ['status' => 'pending']
            );

            // إرسال الإشعارات
            $this->sendNotifications($group, array_keys($studentsData), $request->supervisors);

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
        // التحقق من صحة البيانات المدخلة
        $validated = $request->validate([
            'query' => 'nullable|string',
            'top_n' => 'nullable|integer|min:1|max:20',
            'min_gpa' => 'nullable|numeric|min:0|max:4',
            'max_gpa' => 'nullable|numeric|min:0|max:4'
        ]);
    
        // جلب جميع الطلاب مع مهاراتهم ومعلومات المستخدم
        $students = Student::with(['skills', 'user', 'groups'])
            ->get()
            ->map(function ($student) {
                // تجميع النص الكامل للخبرة
                $full_experience = '';
                
                if (!empty($student->experience)) {
                    // إذا كانت الخبرة نصًا عاديًا
                    if (is_string($student->experience)) {
                        $full_experience = $student->experience;
                    } 
                    // إذا كانت الخبرة مصفوفة
                    elseif (is_array($student->experience)) {
                        foreach ($student->experience as $item) {
                            if (is_array($item) && isset($item['type'], $item['content'])) {
                                if ($item['type'] === 'text') {
                                    $full_experience .= ' ' . $item['content'];
                                }
                            }
                        }
                    }
                }
    
                // تنظيف النص النهائي
                $full_experience = trim($full_experience);
    
                return [
                    'student_id' => $student->studentId,
                    'user_id' => $student->userId,
                    'name' => $student->user->name,
                    'email' => $student->user->email,
                    'profile_picture' => $student->user->profile_picture,
                    'skills' => $student->skills->pluck('name')->implode(', '),
                    'experience' => $full_experience, // النص الكامل للخبرة
                    'experience_full' => $student->experience, // البيانات الكاملة للخبرة
                    'gpa' => (float)($student->gpa ?? 0.0),
                    'university_number' => $student->university_number,
                    'major' => $student->major
                ];
            });
    
        // تحضير البيانات للإرسال لنظام التوصية
        $requestData = [
            'students' => $students,
            'query' => $validated['query'] ?? '',
            'top_n' => $validated['top_n'] ?? 5
        ];
    
        // إضافة فلتر GPA إذا وجد
        if (isset($validated['min_gpa'])) {
            $requestData['min_gpa'] = (float)$validated['min_gpa'];
        }
        if (isset($validated['max_gpa'])) {
            $requestData['max_gpa'] = (float)$validated['max_gpa'];
        }
    
        try {
            // إرسال الطلب لنظام التوصية
            $response = Http::timeout(30)->post('http://localhost:5001/recommend', $requestData);
    
            if ($response->failed()) {
                throw new \Exception('Failed to get recommendations from service');
            }
    
            $recommendations = $response->json()['data'] ?? [];
            
            // إنشاء خريطة للطلاب للوصول السريع
            $studentsMap = collect($students)->keyBy('student_id');
            
            // معالجة التوصيات وإضافة البيانات الكاملة
            $processedRecommendations = array_map(function($item) use ($studentsMap) {
                $studentId = $item['student_id'];
                $originalStudent = $studentsMap[$studentId] ?? null;
                
                if ($originalStudent) {
                    // دمج جميع البيانات الأصلية مع نتائج التوصية
                    return array_merge($item, [
                        'user_id' => $originalStudent['user_id'],
                        'email' => $originalStudent['email'],
                        'profile_picture' => $originalStudent['profile_picture'],
                        'experience' => $originalStudent['experience'], // النص الكامل
                        'experience_full' => $originalStudent['experience_full'], // التفاصيل الكاملة
                        'university_number' => $originalStudent['university_number'],
                        'major' => $originalStudent['major']
                    ]);
                }
                
                return $item;
            }, $recommendations);
    
            return response()->json([
                'status' => 'success',
                'data' => $processedRecommendations,
                'message' => 'Recommendations retrieved successfully'
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Recommendation error: ' . $e->getMessage());
            
            return response()->json([
                'status' => 'error',
                'message' => 'Failed to get recommendations',
                'error' => $e->getMessage()
            ], 500);
        }
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
    
        // 2. جلب المشرفين المعتمدين مع معلومات المستخدم
        $supervisors = DB::table('group_supervisor')
            ->where('groupid', $groupId)
            ->where('status', 'approved')
            ->join('supervisors', 'group_supervisor.supervisorId', '=', 'supervisors.supervisorId')
            ->join('users', 'supervisors.userId', '=', 'users.userId')
            ->select(
                'supervisors.supervisorId',
                'users.userId',
                'users.name',
                'users.email',
                'users.profile_picture',
                'group_supervisor.created_at'
            )
            ->get()
            ->map(function ($item) {
                return [
                    'supervisorId' => $item->supervisorId,
                    'userId' => $item->userId,
                    'name' => $item->name,
                    'email' => $item->email,
                    'profile_picture' => $item->profile_picture,
                    'since' => Carbon::parse($item->created_at)->diffForHumans()
                ];
            });
    
        if ($supervisors->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No approved supervisors found'
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
    
        // 2. جلب الطلاب المعتمدين مع معلومات المستخدم
        $students = DB::table('group_student')
            ->where('groupid', $groupId)
            ->where('status', 'approved')
            ->join('students', 'group_student.studentId', '=', 'students.studentId')
            ->join('users', 'students.userId', '=', 'users.userId')
            ->select(
                'students.studentId',
                'users.userId',
                'users.name',
                'users.email',
                'users.profile_picture',
                'students.major',
                'students.university_number',
                'group_student.is_leader',
                'group_student.created_at'
            )
            ->get()
            ->map(function ($item) {
                return [
                    'studentId' => $item->studentId,
                    'userId' => $item->userId,
                    'name' => $item->name,
                    'email' => $item->email,
                    'profile_picture' => $item->profile_picture,
                    'major' => $item->major,
                    'university_number' => $item->university_number,
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
/**
 * التحقق مما إذا كان الطالب الحالي هو قائد لمجموعة معينة
 *
 *
 */
    public function isStudentLeader($groupId)
    {
        try {
            $user = Auth::user();
            
            if (!$user->student) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is not a student'
                ], 403);
            }

            $isLeader = GroupStudent::where('groupid', $groupId)
                ->where('studentId', $user->student->studentId)
                ->where('is_leader', true)
                ->exists();

            return response()->json([
                'success' => true,
                'is_leader' => $isLeader
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check leadership status: ' . $e->getMessage()
            ], 500);
        }
    }
    public function isUserSupervisor($groupId)
    {
        try {
            $user = Auth::user();
            
            // التحقق من أن المستخدم مشرف
            if (!$user->supervisor) {
                return response()->json([
                    'success' => false,
                    'is_supervisor' => false,
                    'message' => 'User is not a supervisor'
                ]);
            }

            // استخدام الاستعلام المباشر على جدول group_supervisor
            $isApprovedSupervisor = DB::table('group_supervisor')
                ->where('supervisorId', $user->supervisor->supervisorId)
                ->where('groupid', $groupId)
                ->where('status', 'approved')
                ->exists();

            return response()->json([
                'success' => true,
                'is_supervisor' => $isApprovedSupervisor,
                'supervisor_id' => $user->supervisor->supervisorId,
                'message' => $isApprovedSupervisor 
                    ? 'User is an approved supervisor for this group' 
                    : 'User is not an approved supervisor for this group'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'is_supervisor' => false,
                'message' => 'Failed to check supervisor status: ' . $e->getMessage()
            ], 500);
        }
    }
    public function addGroupMembers(Request $request, $groupId)
    {
        $request->validate([
            'members' => 'required|array|min:1',
            'members.*.user_id' => 'required|exists:users,userId', // تغيير إلى userId
            'members.*.type' => 'required|in:student,supervisor'
        ]);
    
        return DB::transaction(function () use ($request, $groupId) {
            // التحقق من أن المستخدم الحالي هو قائد المجموعة
            $user = Auth::user();
            $isLeader = GroupStudent::where('groupid', $groupId)
                ->where('studentId', $user->student->studentId)
                ->where('is_leader', true)
                ->exists();
    
            if (!$isLeader) {
                abort(403, 'Only the group leader can add members');
            }
    
            $group = Group::findOrFail($groupId);
            $addedMembers = [];
            $notificationService = new NotificationService();
    
            foreach ($request->members as $member) {
                if ($member['type'] === 'student') {
                    // البحث عن الطالب باستخدام userId
                    $student = Student::where('userId', $member['user_id'])->firstOrFail();
                    
                    // التحقق من أن الطالب ليس بالفعل في المجموعة
                    $existing = GroupStudent::where('groupid', $groupId)
                        ->where('studentId', $student->studentId)
                        ->first();
    
                    if ($existing) {
                        continue; // تخطي إذا كان الطالب موجود بالفعل
                    }
    
                    // إضافة الطالب بحالة pending
                    DB::table('group_student')->insert([
                        'groupid' => $groupId,
                        'studentId' => $student->studentId,
                        'status' => 'pending',
                        'is_leader' => false,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
    
                    // إرسال إشعار للطالب
                    $notificationService->sendRealTime(
                        $member['user_id'], // استخدام userId مباشرة
                        "تمت دعوتك للانضمام إلى مجموعة {$group->name}"
                    );
    
                    $addedMembers[] = [
                        'user_id' => $member['user_id'],
                        'type' => 'student',
                        'name' => $student->user->name
                    ];
                } elseif ($member['type'] === 'supervisor') {
                    // البحث عن المشرف باستخدام userId
                    $supervisor = Supervisor::where('userId', $member['user_id'])->firstOrFail();
                    
                    // التحقق من أن المشرف ليس بالفعل في المجموعة
                    $existing = GroupSupervisor::where('groupid', $groupId)
                        ->where('supervisorId', $supervisor->supervisorId)
                        ->first();
    
                    if ($existing) {
                        continue; // تخطي إذا كان المشرف موجود بالفعل
                    }
    
                    // إضافة المشرف بحالة pending
                    DB::table('group_supervisor')->insert([
                        'groupid' => $groupId,
                        'supervisorId' => $supervisor->supervisorId,
                        'status' => 'pending',
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
    
                    // إرسال إشعار للمشرف
                    $notificationService->sendRealTime(
                        $member['user_id'], // استخدام userId مباشرة
                        "تمت دعوتك لتكون مشرفًا على مجموعة {$group->name}"
                    );
    
                    $addedMembers[] = [
                        'user_id' => $member['user_id'],
                        'type' => 'supervisor',
                        'name' => $supervisor->user->name
                    ];
                }
            }
    
            return response()->json([
                'success' => true,
                'message' => 'Members added successfully',
                'data' => $addedMembers
            ]);
        });
    }
    public function getSupervisorGroups()
{
    try {
        $user = Auth::user();
        
        if (!$user->supervisor) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a supervisor'
            ], 403);
        }

        // جلب أسماء المجموعات المعتمدة للمشرف فقط
        $groups = Group::whereHas('supervisors', function($query) use ($user) {
                $query->where('supervisors.supervisorId', $user->supervisor->supervisorId)
                      ->where('group_supervisor.status', 'approved');
            })
            ->pluck('name', 'groupId');

        if ($groups->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No approved groups found for this supervisor'
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $groups,
            'message' => 'Supervisor groups retrieved successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve supervisor groups: ' . $e->getMessage()
        ], 500);
    }
}
/**
 * جلب جميع المشاريع المرتبطة بالمشرف الحالي
 *
 * @return \Illuminate\Http\JsonResponse
 */
public function getSupervisorProjects()
{
    try {
        $user = Auth::user();
        
        // التحقق من أن المستخدم مشرف
        if (!$user->supervisor) {
            return response()->json([
                'success' => false,
                'message' => 'User is not a supervisor'
            ], 403);
        }

        // جلب المشاريع المعتمدة للمشرف مع تفاصيل المشروع الأساسية
        $projects = Project::select([
                'projects.projectid',
                'projects.title',
                'projects.description',
                'projects.type',
                'projects.status',
                'projects.startdate',
                'projects.enddate'
            ])
            ->whereHas('group.supervisors', function($query) use ($user) {
                $query->where('supervisors.supervisorId', $user->supervisor->supervisorId)
                      ->where('group_supervisor.status', 'approved');
            })
            ->with(['group' => function($query) {
                $query->select(['groupid', 'projectid', 'name'])
                      ->withCount(['approvedStudents', 'approvedSupervisors']);
            }])
            ->orderBy('projects.created_at', 'desc')
            ->get();

        if ($projects->isEmpty()) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'No projects found for this supervisor'
            ]);
        }

        // تنسيق البيانات للإرجاع
        $formattedProjects = $projects->map(function ($project) {
            return [
                'project_id' => $project->projectid,
                'title' => $project->title,
                'description' => $project->description,
                'type' => $project->type,
                'status' => $project->status,
                'start_date' => $project->startdate,
                'end_date' => $project->enddate,
                'group' => [
                    'id' => $project->group->groupid,
                    'name' => $project->group->name,
                    'students_count' => $project->group->approved_students_count,
                    'supervisors_count' => $project->group->approved_supervisors_count
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedProjects,
            'message' => 'Supervisor projects retrieved successfully'
        ]);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Failed to retrieve supervisor projects: ' . $e->getMessage()
        ], 500);
    }
}
}