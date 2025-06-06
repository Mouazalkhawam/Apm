<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class AcademicPeriodController extends Controller
{
    public function index()
    {
        $periods = AcademicPeriod::orderBy('start_date', 'desc')->get();
        return response()->json(['data' => $periods]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'type' => 'required|in:first_semester,second_semester,summer,academic_year',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // تأكد أن المستخدم هو منسق مشاريع
        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح به'], 403);
        }

        $period = AcademicPeriod::create([
            'name' => $request->name,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'coordinator_id' => Auth::id()
        ]);

        return response()->json(['data' => $period], 201);
    }

    public function setCurrentPeriod($id)
    {
        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح به'], 403);
        }

        // إلغاء تحديد جميع الفترات الحالية
        AcademicPeriod::query()->update(['is_current' => false]);

        // تحديد الفترة الحالية
        $period = AcademicPeriod::findOrFail($id);
        $period->update(['is_current' => true]);

        return response()->json(['data' => $period]);
    }

    public function getCurrentPeriod()
    {
        $period = AcademicPeriod::where('is_current', true)->first();
        return response()->json(['data' => $period]);
    }
}