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
        try {
            // التحقق من صلاحية المستخدم
            if (auth()->user()->role !== 'coordinator') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // تحقق من صحة البيانات
            $validated = $request->validate([
                'date' => 'required|date|after_or_equal:today',
                'type' => 'required|in:مرحلية,تحليلية,نهائية',
                'group_id' => 'required|exists:groups,groupid',
                'time' => [
                    'required',
                    'regex:/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/'
                ],
                'location' => 'required|string|max:255',
                'notes' => 'nullable|string|max:500'
            ]);

            // توحيد تنسيق الوقت
            $validated['time'] = date('H:i', strtotime($validated['time']));

            // إنشاء الموعد
            $schedule = DiscussionSchedule::create($validated);

            // إرسال الإشعارات
            $this->sendNotifications($schedule);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديد موعد المناقشة بنجاح',
                'data' => $schedule
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'خطأ في التحقق من البيانات',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error in schedule creation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حفظ الموعد',
                'error_details' => env('APP_DEBUG') ? $e->getMessage() : null
            ], 500);
        }
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
                'group.students.student.user',
                'group.supervisors.supervisor.user'
            ])->orderBy('date', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => $schedules
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching schedules: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب المواعيد'
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
}