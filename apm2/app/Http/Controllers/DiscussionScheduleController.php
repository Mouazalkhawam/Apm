<?php

namespace App\Http\Controllers;

use App\Models\DiscussionSchedule;
use App\Models\Group;
use App\Models\GroupStudent; // أضف هذا السطر
use App\Models\GroupSupervisor; // أضف هذا السطر
use App\Services\NotificationService;
use Illuminate\Http\Request;

class DiscussionScheduleController extends Controller
{
    public function store(Request $request)
    {
        try {
            if (auth()->user()->role !== 'coordinator') {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $validated = $request->validate([
                'date' => 'required|date',
                'type' => 'required|in:مرحلية,تحليلية,نهائية',
                'group_id' => 'required|exists:groups,groupid',
                'time' => 'required|date_format:H:i',
                'location' => 'required|string|max:255',
                'notes' => 'nullable|string'
            ]);

            $schedule = DiscussionSchedule::create($validated);
            $this->sendNotifications($schedule);

            return response()->json([
                'success' => true,
                'message' => 'تم تحديد موعد المناقشة بنجاح',
                'data' => $schedule
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Error in schedule creation: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء حفظ الموعد'
            ], 500);
        }
    }

    private function sendNotifications(DiscussionSchedule $schedule)
    {
        // الحصول على المجموعة مع الطلاب والمشرفين المعتمدين
        $group = Group::find($schedule->group_id);
        
        if (!$group) {
            \Log::error("Group not found for schedule: {$schedule->scheduledId}");
            return;
        }

        $message = "تم تحديد موعد المناقشة {$schedule->type} في {$schedule->date} الساعة {$schedule->time} في {$schedule->location}";

        // الحصول على الطلاب المعتمدين في هذه المجموعة
        $approvedStudents = GroupStudent::where('groupid', $group->groupid)
            ->where('status', 'approved')
            ->with('student.user')
            ->get();

        // إرسال إشعارات للطلاب المعتمدين
        foreach ($approvedStudents as $groupStudent) {
            try {
                if ($groupStudent->student && $groupStudent->student->user) {
                    NotificationService::sendRealTime(
                        $groupStudent->student->user->userId,
                        $message,
                        [
                            'type' => 'discussion_schedule',
                            'schedule_id' => $schedule->scheduledId,
                            'group_id' => $group->groupid
                        ]
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send notification to student: {$groupStudent->studentId}. Error: " . $e->getMessage());
            }
        }

        // الحصول على المشرفين المعتمدين في هذه المجموعة
        $approvedSupervisors = GroupSupervisor::where('groupid', $group->groupid)
            ->where('status', 'approved')
            ->with('supervisor.user')
            ->get();

        // إرسال إشعارات للمشرفين المعتمدين
        foreach ($approvedSupervisors as $groupSupervisor) {
            try {
                if ($groupSupervisor->supervisor && $groupSupervisor->supervisor->user) {
                    NotificationService::sendRealTime(
                        $groupSupervisor->supervisor->user->userId,
                        $message,
                        [
                            'type' => 'discussion_schedule',
                            'schedule_id' => $schedule->scheduledId,
                            'group_id' => $group->groupid
                        ]
                    );
                }
            } catch (\Exception $e) {
                \Log::error("Failed to send notification to supervisor: {$groupSupervisor->supervisorId}. Error: " . $e->getMessage());
            }
        }
    }
    public function index()
    {
        $schedules = DiscussionSchedule::with(['group.students', 'group.supervisors'])->get();
        
        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }
}