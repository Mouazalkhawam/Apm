<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Supervisor;
use App\Models\Student;
use App\Models\Group;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller{
    public function supervisorIndex(Supervisor $supervisor)
    {
        $meetings = $supervisor->meetings()
            ->with(['group', 'leader'])
            ->orderBy('meeting_time')
            ->get();
            
        return response()->json($meetings);
    }

    public function storeProposed(Request $request, Supervisor $supervisor)
    {
        // 1. التحقق من صحة البيانات
        $validated = $request->validate([
            'group_id' => 'required|integer|exists:groups,groupId',
            'proposed_times' => 'required|array|min:1',
            'proposed_times.*' => 'required|date_format:Y-m-d H:i:s',
            'description' => 'nullable|string|max:500'
        ]);

        // 2. البحث عن المجموعة مع أعضائها
        $group = Group::findOrFail($validated['group_id']);
        
        // 3. الحصول على قائد المجموعة أو تعيينه تلقائياً
        $leader = $this->resolveGroupLeader($group);
        
        if (!$leader) {
            return response()->json([
                'message' => 'لا يمكن إنشاء اجتماع لمجموعة بدون أعضاء',
                'solution' => 'يجب إضافة أعضاء للمجموعة أولاً'
            ], 422);
        }

        // 4. إنشاء الاجتماعات
        $meetings = [];
        foreach ($validated['proposed_times'] as $time) {
            $meetings[] = Meeting::create([
                'group_id' => $group->groupId,
                'leader_id' => $leader->studentId,
                'supervisor_id' => $supervisor->supervisorId,
                'description' => $validated['description'],
                'meeting_time' => $time,
                'status' => 'proposed'
            ]);
        }

        return response()->json([
            'message' => 'تم إنشاء الاجتماعات بنجاح',
            'data' => $meetings,
            'auto_leader_assigned' => $group->wasChanged('leader_id')
        ], 201);
    }

    /**
     * حل مشكلة عدم وجود قائد للمجموعة
     */
    private function resolveGroupLeader(Group $group)
    {
        // إذا كان هناك قائد محدد، نرجعه
        if ($group->leader_id) {
            return Student::find($group->leader_id);
        }

        // البحث عن قائد في جدول العلاقة
        $leader = DB::table('group_student')
            ->where('groupId', $group->groupId)
            ->where('is_leader', true)
            ->first();

        if ($leader) {
            $group->leader_id = $leader->studentId;
            $group->save();
            return Student::find($leader->studentId);
        }

        // إذا لم يوجد قائد، نأخذ أول عضو
        $member = DB::table('group_student')
            ->where('groupId', $group->groupId)
            ->first();

        if ($member) {
            // تحديث القائد في المجموعة وجدول العلاقة
            DB::table('group_student')
                ->where('groupId', $group->groupId)
                ->where('studentId', $member->studentId)
                ->update(['is_leader' => true]);

            $group->leader_id = $member->studentId;
            $group->save();

            return Student::find($member->studentId);
        }

        return null;
    }


    public function chooseTime(Meeting $meeting, Student $leader)
    {
        if (!$leader->isTeamLeader()) {
            return response()->json(['message' => 'غير مصرح بهذا الإجراء'], 403);
        }

        Meeting::where('group_id', $meeting->group_id)
            ->where('id', '!=', $meeting->id)
            ->update(['status' => 'canceled']);
            
        $meeting->update(['status' => 'tentative']);
        
        return response()->json([
            'message' => 'تم اختيار الموعد، في انتظار تأكيد المشرف',
            'data' => $meeting->fresh()
        ]);
    }

    public function confirm(Meeting $meeting, Supervisor $supervisor)
    {
        if (!$supervisor->isApprovedForGroup($meeting->group_id)) {
            return response()->json(['message' => 'غير مصرح بهذا الإجراء'], 403);
        }

        $meeting->update(['status' => 'confirmed']);
        
        return response()->json([
            'message' => 'تم تأكيد الموعد بنجاح',
            'data' => $meeting->fresh()
        ]);
    }

    public function reject(Meeting $meeting, Supervisor $supervisor)
    {
        if (!$supervisor->isApprovedForGroup($meeting->group_id)) {
            return response()->json(['message' => 'غير مصرح بهذا الإجراء'], 403);
        }

        $meeting->update(['status' => 'canceled']);
        
        return response()->json([
            'message' => 'تم رفض الموعد، يرجى اختيار موعد آخر',
            'data' => $meeting->fresh()
        ]);
    }
 
    public function leaderIndex(Student $leader)
    {
        $meetings = $leader->ledMeetings()
            ->with(['group', 'supervisor'])
            ->orderBy('meeting_time')
            ->get();
            
        return response()->json($meetings);
    }
}