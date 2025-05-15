<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Supervisor;
use App\Models\Student;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    // عرض جميع الاجتماعات للمشرف (API)
    public function supervisorIndex(Supervisor $supervisor)
    {
        $meetings = Meeting::where('supervisor_id', $supervisor->id)
            ->with(['group', 'leader'])
            ->orderBy('meeting_time')
            ->get();
            
        return response()->json($meetings);
    }

    // حفظ المواعيد المقترحة (API)
    public function storeProposed(Request $request, Supervisor $supervisor)
    {
        $request->validate([
            'group_id' => 'required|exists:groups,id',
            'proposed_times' => 'required|array|min:1',
            'proposed_times.*' => 'required|date',
            'description' => 'nullable|string'
        ]);

        $meetings = [];
        foreach ($request->proposed_times as $time) {
            $meetings[] = Meeting::create([
                'group_id' => $request->group_id,
                'leader_id' => Group::find($request->group_id)->leader_id,
                'supervisor_id' => $supervisor->id,
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

    // اختيار موعد من قبل قائد الفريق (API)
    public function chooseTime(Meeting $meeting)
    {
        // إلغاء جميع المواعيد الأخرى للمجموعة
        Meeting::where('group_id', $meeting->group_id)
            ->where('id', '!=', $meeting->id)
            ->update(['status' => 'canceled']);
            
        $meeting->update(['status' => 'tentative']);
        
        return response()->json([
            'message' => 'تم اختيار الموعد، في انتظار تأكيد المشرف',
            'data' => $meeting->fresh()
        ]);
    }

    // تأكيد الموعد من قبل المشرف (API)
    public function confirm(Meeting $meeting)
    {
        $meeting->update(['status' => 'confirmed']);
        
        return response()->json([
            'message' => 'تم تأكيد الموعد بنجاح',
            'data' => $meeting->fresh()
        ]);
    }

    // رفض الموعد من قبل المشرف (API)
    public function reject(Meeting $meeting)
    {
        $meeting->update(['status' => 'canceled']);
        
        return response()->json([
            'message' => 'تم رفض الموعد، يرجى اختيار موعد آخر',
            'data' => $meeting->fresh()
        ]);
    }

    // عرض الاجتماعات المتاحة لقائد الفريق (API)
    public function leaderIndex(Student $leader)
    {
        $meetings = Meeting::where('leader_id', $leader->id)
            ->with(['group', 'supervisor'])
            ->orderBy('meeting_time')
            ->get();
            
        return response()->json($meetings);
    }
}