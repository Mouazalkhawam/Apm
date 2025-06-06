<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\AcademicPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AcademicPeriodController extends Controller
{
    // عرض جميع الفصول
    public function index()
    {
        $periods = AcademicPeriod::orderBy('start_date', 'desc')->get();
        return response()->json(['data' => $periods]);
    }

    // إنشاء فصل جديد
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:first_semester,second_semester,summer,academic_year',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح به'], 403);
        }

        $this->validatePeriodDates($request);

        $period = AcademicPeriod::create([
            'name' => $request->name,
            'type' => $request->type,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'coordinator_id' => Auth::id()
        ]);

        return response()->json(['data' => $period], 201);
    }

    // تعديل فصل موجود
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:first_semester,second_semester,summer,academic_year',
            'start_date' => 'sometimes|date',
            'end_date' => 'sometimes|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح به'], 403);
        }

        $period = AcademicPeriod::findOrFail($id);
        
        $this->validatePeriodDates($request, $period->id);

        $period->update($request->all());

        return response()->json(['data' => $period]);
    }

    // تعيين فصل كحالي
    public function setCurrentPeriod($id)
    {
        if (Auth::user()->role !== 'coordinator') {
            return response()->json(['message' => 'غير مصرح به'], 403);
        }

        AcademicPeriod::query()->update(['is_current' => false]);
        $period = AcademicPeriod::findOrFail($id);
        $period->update(['is_current' => true]);

        return response()->json(['data' => $period]);
    }

    // الحصول على الفصل الحالي
    public function getCurrentPeriod()
    {
        $period = AcademicPeriod::where('is_current', true)->first();
        return response()->json(['data' => $period]);
    }

    // دالة مساعدة للتحقق من صحة التواريخ
    private function validatePeriodDates(Request $request, $exceptId = null)
    {
        $query = AcademicPeriod::where('type', $request->type)
            ->where(function($q) use ($request) {
                $q->whereBetween('start_date', [$request->start_date, $request->end_date])
                  ->orWhereBetween('end_date', [$request->start_date, $request->end_date])
                  ->orWhere(function($q2) use ($request) {
                      $q2->where('start_date', '<=', $request->start_date)
                         ->where('end_date', '>=', $request->end_date);
                  });
            });

        if ($exceptId) {
            $query->where('id', '!=', $exceptId);
        }

        if ($query->exists()) {
            abort(422, 'هناك تداخل في التواريخ مع فصل دراسي آخر من نفس النوع');
        }

        // قواعد خاصة بأنواع الفصول
        $start = Carbon::parse($request->start_date);
        $end = Carbon::parse($request->end_date);
        $durationMonths = $start->diffInMonths($end);

        switch ($request->type) {
            case 'summer':
                if ($durationMonths > 3) {
                    abort(422, 'الفصل الصيفي لا يمكن أن يزيد عن 3 أشهر');
                }
                break;
                
            case 'first_semester':
            case 'second_semester':
                if ($durationMonths < 3 || $durationMonths > 5) {
                    abort(422, 'الفصل الدراسي يجب أن يكون بين 3 إلى 5 أشهر');
                }
                break;
                
            case 'academic_year':
                if ($durationMonths < 9 || $durationMonths > 12) {
                    abort(422, 'العام الأكاديمي يجب أن يكون بين 9 إلى 12 شهراً');
                }
                break;
        }
    }
}