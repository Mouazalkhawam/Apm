<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Supervisor;
use App\Models\Student;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MeetingController extends Controller
{
    private function checkSupervisor(User $user)
    {
        if ($user->role !== 'supervisor') {
            abort(403, 'هذا الإجراء مسموح فقط للمشرفين');
        }
    }

    private function checkStudent(User $user)
    {
        if ($user->role !== 'student') {
            abort(403, 'هذا الإجراء مسموح فقط للطلاب');
        }
    }

    public function supervisorIndex(Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية الوصول لهذه البيانات');
            }

            $meetings = $supervisor->meetings()
                ->with(['group.students.user'])
                ->orderByDesc('meeting_time')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $meetings
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function storeProposed(Request $request, Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا يمكنك التصرف نيابة عن مشرف آخر');
            }

            $validator = Validator::make($request->all(), [
                  'group_id' => 'required|integer|exists:groups,groupid',
                  'proposed_times' => 'required|array|min:1|max:5',
                  'proposed_times.*' => [
                  'required',
                  'date_format:Y-m-d H:i:s',
                  'after:now +1 hour',
                  'before:now +30 days'
                    ],
                  'description' => 'nullable|string|max:1000' // إضافة التحقق من حقل الوصف
              ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $isApproved = DB::table('group_supervisor')
                ->where('supervisorId', $supervisor->supervisorId)
                ->where('groupid', $request->group_id)
                ->where('status', 'approved')
                ->exists();

            if (!$isApproved) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لهذا المشرف بإدارة هذه المجموعة'
                ], 403);
            }

           $meetings = [];
foreach ($request->proposed_times as $time) {
    $meetings[] = Meeting::create([
        'group_id' => $request->group_id,
        'supervisor_id' => $supervisor->supervisorId,
        'meeting_time' => $time,
        'end_time' => Carbon::parse($time)->addHour(),
        'status' => 'proposed',
        'description' => $request->description ?? null // إضافة الوصف
    ]);
}

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المقترحات بنجاح',
                'data' => $meetings
            ], 201);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function confirm(Meeting $meeting, Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية تأكيد هذا الموعد');
            }

            DB::transaction(function () use ($meeting, $supervisor) {
                $isApproved = DB::table('group_supervisor')
                    ->where('supervisorId', $supervisor->supervisorId)
                    ->where('groupid', $meeting->group_id)
                    ->where('status', 'approved')
                    ->exists();

                if (!$isApproved) {
                    abort(403, 'غير مصرح لهذا الإجراء');
                }

                Meeting::where('group_id', $meeting->group_id)
                    ->where('id', '!=', $meeting->id)
                    ->update(['status' => 'canceled']);

                $meeting->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'تم تأكيد الموعد',
                'data' => $meeting->fresh()
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function reject(Meeting $meeting, Supervisor $supervisor, Request $request)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية رفض هذا الموعد');
            }

            $validator = Validator::make($request->all(), [
                'rejection_reason' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $isApproved = DB::table('group_supervisor')
                ->where('supervisorId', $supervisor->supervisorId)
                ->where('groupid', $meeting->group_id)
                ->where('status', 'approved')
                ->exists();

            if (!$isApproved) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لهذا الإجراء'
                ], 403);
            }

            $meeting->update([
                'status' => 'canceled',
                'rejection_reason' => $request->rejection_reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم رفض الموعد',
                'data' => $meeting->fresh()
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function chooseTime($groupId, $meetingId)
    {
        try {
            $user = auth()->user();
            $this->checkStudent($user);
            
            if (!$user->student) {
                abort(403, 'المستخدم الحالي ليس طالباً');
            }
    
            // التحقق من أن الطالب قائد المجموعة
            $isLeader = DB::table('group_student')
                ->where('groupid', $groupId)
                ->where('studentId', $user->student->studentId)
                ->where('is_leader', 1)
                ->exists();
    
            if (!$isLeader) {
                abort(403, 'غير مصرح بهذا الإجراء، يجب أن تكون قائد المجموعة');
            }
    
            // البدء بعملية transaction
            return DB::transaction(function () use ($groupId, $meetingId) {
                // الحصول على الاجتماع المختار
                $selectedMeeting = Meeting::where('id', $meetingId)
                    ->where('group_id', $groupId)
                    ->where('status', 'proposed')
                    ->firstOrFail();
    
                // الحصول على جميع الاجتماعات المقترحة لنفس المجموعة والمشرف
                $proposedMeetings = Meeting::where('group_id', $groupId)
                    ->where('supervisor_id', $selectedMeeting->supervisor_id)
                    ->where('status', 'proposed')
                    ->where('created_at', $selectedMeeting->created_at)
                    ->get();
    
                // تحديث الاجتماع المختار إلى confirmed
                $selectedMeeting->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now()
                ]);
    
                // حذف جميع الاجتماعات المقترحة الأخرى لنفس المجموعة والمشرف والوقت
                Meeting::where('group_id', $groupId)
                    ->where('supervisor_id', $selectedMeeting->supervisor_id)
                    ->where('status', 'proposed')
                    ->where('created_at', $selectedMeeting->created_at)
                    ->where('id', '!=', $meetingId)
                    ->delete();
    
                return response()->json([
                    'success' => true,
                    'message' => 'تم اختيار الموعد بنجاح وحذف المقترحات الأخرى',
                    'data' => $selectedMeeting->fresh()
                ]);
            });
    
        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    public function getAvailableTimes(Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkStudent($user);

            $isMember = DB::table('group_student')
                ->join('group_supervisor', 'group_student.groupid', '=', 'group_supervisor.groupid')
                ->where('group_supervisor.supervisorId', $supervisor->supervisorId)
                ->where('group_supervisor.status', 'approved')
                ->where('group_student.studentId', $user->student->studentId)
                ->exists();

            if (!$isMember) {
                abort(403, 'غير مصرح لك برؤية مواعيد هذا المشرف');
            }

            $availableTimes = Meeting::where('supervisor_id', $supervisor->supervisorId)
                ->whereIn('status', ['proposed', 'tentative'])
                ->where('meeting_time', '>', now()->addHours(1))
                ->orderBy('meeting_time')
                ->get(['id', 'meeting_time', 'status', 'group_id']);

            return response()->json([
                'success' => true,
                'data' => $availableTimes
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    private function handleException(\Exception $e)
    {
        $statusCode = method_exists($e, 'getStatusCode') 
            ? $e->getStatusCode() 
            : 500;

        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTrace() : null
        ], $statusCode);
    }

    public function getConfirmedMeetings()
{
    try {
        $user = auth()->user();
        $this->checkSupervisor($user);
        
        $supervisor = $user->supervisor;
        
        $confirmedMeetings = $supervisor->meetings()
            ->where('status', 'confirmed')
            ->with(['group.students.user']) // تحميل العلاقات المطلوبة
            ->orderBy('meeting_time', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $confirmedMeetings
        ]);
        
    } catch (\Exception $e) {
        return $this->handleException($e);
    }
}

public function getProposedMeetings()
{
    try {
        $user = auth()->user();
        $this->checkSupervisor($user);
        
        $supervisor = $user->supervisor;
        
        $proposedMeetings = $supervisor->meetings()
            ->where('status', 'proposed')
            ->with(['group.students.user']) // تحميل العلاقات المطلوبة
            ->orderBy('meeting_time', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $proposedMeetings
        ]);
        
    } catch (\Exception $e) {
        return $this->handleException($e);
    }
}
}