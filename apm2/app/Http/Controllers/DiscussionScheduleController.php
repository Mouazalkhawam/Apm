<?php

namespace App\Http\Controllers;

use App\Models\DiscussionSchedule;
use App\Models\Group;
use App\Models\GroupStudent;
use App\Models\GroupSupervisor;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DiscussionScheduleController extends Controller
{
    /**
     * حفظ موعد مناقشة جديد
     */
  public function store(Request $request)
{
    $data = $request->all();

    // تحقق إذا الريكوست عبارة عن مصفوفة من العناصر
    if (!is_array($data)) {
        return response()->json([
            'success' => false,
            'message' => 'صيغة البيانات غير صحيحة، يجب إرسال مصفوفة من المناقشات'
        ], 400);
    }

    $createdDiscussions = [];

    foreach ($data as $item) {
        $validated = validator($item, [
            'date' => 'required|date',
            'type' => 'required|string',
            'group_id' => 'required|integer',
            'time' => 'required',
            'location' => 'required|string',
            'notes' => 'nullable|string',
        ])->validate();

        $discussion = \App\Models\DiscussionSchedule::create($validated);
        $createdDiscussions[] = $discussion;
    }

    return response()->json([
        'success' => true,
        'message' => 'تمت إضافة جميع المناقشات بنجاح',
        'data' => $createdDiscussions
    ]);
}


    /**
     * إرسال إشعارات للطلاب والمشرفين
     */
    private function sendNotifications(DiscussionSchedule $schedule)
    {
        try {
            $group = Group::with([
                'students' => function($query) {
                    $query->where('status', 'approved')->with('student.user');
                },
                'supervisors' => function($query) {
                    $query->where('status', 'approved')->with('supervisor.user');
                }
            ])->find($schedule->group_id);

            if (!$group) {
                Log::error("Group not found for schedule: {$schedule->id}");
                return;
            }

            $message = "تم تحديد موعد المناقشة {$schedule->type} في {$schedule->date} الساعة {$schedule->time} في {$schedule->location}";

            // إرسال إشعارات للطلاب المعتمدين
            foreach ($group->students as $groupStudent) {
                try {
                    if ($groupStudent->student?->user) {
                        NotificationService::sendRealTime(
                            $groupStudent->student->user->userId,
                            $message,
                            [
                                'type' => 'discussion_schedule',
                                'schedule_id' => $schedule->id,
                                'group_id' => $group->groupid
                            ]
                        );
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to notify student {$groupStudent->student_id}: " . $e->getMessage());
                }
            }

            // إرسال إشعارات للمشرفين المعتمدين
            foreach ($group->supervisors as $groupSupervisor) {
                try {
                    if ($groupSupervisor->supervisor?->user) {
                        NotificationService::sendRealTime(
                            $groupSupervisor->supervisor->user->userId,
                            $message,
                            [
                                'type' => 'discussion_schedule',
                                'schedule_id' => $schedule->id,
                                'group_id' => $group->groupid
                            ]
                        );
                    }
                } catch (\Exception $e) {
                    Log::error("Failed to notify supervisor {$groupSupervisor->supervisor_id}: " . $e->getMessage());
                }
            }

        } catch (\Exception $e) {
            Log::error("Notification system error: " . $e->getMessage());
        }
    }

    /**
     * عرض جميع مواعيد المناقشات
     */
    public function index()
{
    try {
        $schedules = DiscussionSchedule::with([
            'group:groupid,name,projectid', // جلب الحقول الأساسية للمجموعة مع projectid
            'group.students.user:id,userId,name,email',
            'group.supervisors.user:id,userId,name,email',
            'group.project:projectid,type' // جلب نوع المشروع من جدول المشاريع
        ])
        ->select([
            'scheduledId', // استخدام scheduledId بدلاً من id أو scheduleid
            'date',
            'time',
            'type',
            'location',
            'notes',
            'created_at',
            'updated_at',
            'group_id'
        ])
        ->orderBy('date', 'asc')
        ->get();

        $formattedSchedules = $schedules->map(function ($schedule) {
            return [
                'schedule_info' => [
                    'id' => $schedule->scheduledId,
                    'date' => $schedule->date,
                    'time' => $schedule->time,
                    'type' => $schedule->type,
                    'location' => $schedule->location,
                    'notes' => $schedule->notes,
                ],
                'group_info' => $schedule->group ? [
                    'group_id' => $schedule->group->groupid,
                    'group_name' => $schedule->group->name,
                    'students' => $schedule->group->students->map(function($student) {
                        return [
                            'student_id' => $student->studentId, // استخدام studentId
                            'name' => $student->user->name,
                            'email' => $student->user->email
                        ];
                    }),
                    'supervisors' => $schedule->group->supervisors->map(function($supervisor) {
                        return [
                            'supervisor_id' => $supervisor->supervisorId, // استخدام supervisorId
                            'name' => $supervisor->user->name,
                            'email' => $supervisor->user->email
                        ];
                    })
                ] : null,
                'project_info' => $schedule->group && $schedule->group->project ? [
                    'project_id' => $schedule->group->project->projectid,
                    'project_type' => $schedule->group->project->type
                ] : null
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formattedSchedules
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching schedules: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب المواعيد',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

    /**
     * عرض مواعيد مجموعة محددة
     */
    public function getByGroup($group_id)
    {
        try {
            $schedules = DiscussionSchedule::where('group_id', $group_id)
                ->with(['group.students.student.user', 'group.supervisors.supervisor.user'])
                ->orderBy('date', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $schedules
            ]);

        } catch (\Exception $e) {
            Log::error("Error getting schedules for group {$group_id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المواعيد'
            ], 500);
        }
    }

    /**
     * تحديث موعد مناقشة
     */
    public function update(Request $request, $id)
    {
        try {
            if (auth()->user()->role !== 'coordinator') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $schedule = DiscussionSchedule::findOrFail($id);

            $validated = $request->validate([
                'date' => 'sometimes|date|after_or_equal:today',
                'type' => 'sometimes|in:مرحلية,تحليلية,نهائية',
                'time' => [
                    'sometimes',
                    'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'
                ],
                'location' => 'sometimes|string|max:255',
                'notes' => 'nullable|string|max:500'
            ]);

            if (isset($validated['time'])) {
                $validated['time'] = date('H:i', strtotime($validated['time']));
            }

            $schedule->update($validated);

            // إرسال إشعارات بالتحديث
            $this->sendNotifications($schedule, true);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديث موعد المناقشة بنجاح',
                'data' => $schedule
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'موعد المناقشة غير موجود'
            ], 404);
        } catch (\Exception $e) {
            Log::error("Error updating schedule {$id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء التحديث'
            ], 500);
        }
    }

    /**
     * حذف موعد مناقشة
     */
    public function destroy($id)
    {
        try {
            if (auth()->user()->role !== 'coordinator') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $schedule = DiscussionSchedule::findOrFail($id);
            $schedule->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف موعد المناقشة بنجاح'
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'موعد المناقشة غير موجود'
            ], 404);
        } catch (\Exception $e) {
            Log::error("Error deleting schedule {$id}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء الحذف'
            ], 500);
        }
    }
    /**
 * الحصول على عدد المناقشات في الشهر الحالي
 */
public function getCurrentMonthDiscussionsCount()
{
    try {
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $count = DiscussionSchedule::whereMonth('date', $currentMonth)
            ->whereYear('date', $currentYear)
            ->count();

        return response()->json([
            'success' => true,
            'data' => [
                'count' => $count,
                'month' => now()->translatedFormat('F'),
                'year' => $currentYear
            ]
        ]);

    } catch (\Exception $e) {
        Log::error('Error getting current month discussions count: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب عدد المناقشات'
        ], 500);
    }
}
/**
 * الحصول على جميع أنواع المناقشات المتاحة
 */
public function getDiscussionTypes()
{
    try {
        // جلب الأنواع الفريدة من قاعدة البيانات
        $types = DiscussionSchedule::distinct()
            ->whereNotNull('type')
            ->pluck('type')
            ->toArray();

        // يمكن إضافة أنواع افتراضية إذا لم تكن موجودة في قاعدة البيانات
        $defaultTypes = ['مرحلية', 'تحليلية', 'نهائية'];
        $allTypes = array_unique(array_merge($defaultTypes, $types));

        return response()->json([
            'success' => true,
            'data' => $allTypes
        ]);

    } catch (\Exception $e) {
        Log::error('Error fetching discussion types: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'حدث خطأ أثناء جلب أنواع المناقشات'
        ], 500);
    }
}
}