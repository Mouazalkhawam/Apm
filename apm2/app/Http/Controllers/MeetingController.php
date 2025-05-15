<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Supervisor;
use App\Models\Student;
use Illuminate\Http\Request;

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
        $request->validate([
            'group_id' => 'required|exists:groups,groupId',
            'proposed_times' => 'required|array|min:1',
            'proposed_times.*' => 'required|date',
            'description' => 'nullable|string'
        ]);

        $group = Group::findOrFail($request->group_id);
        $meetings = [];
        
        foreach ($request->proposed_times as $time) {
            $meetings[] = Meeting::create([
                'group_id' => $group->groupId,
                'leader_id' => $group->leader_id,
                'supervisor_id' => $supervisor->supervisorId,
                'description' => $request->description,
                'meeting_time' => $time,
                'status' => 'proposed'
            ]);
        }

        return response()->json([
            'message' => 'تم اقتراح المواعيد بنجاح',
            'data' => $meetings
        ], 201);
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