<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\PeerEvaluation;
use App\Models\EvaluationCriterion;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EvaluationController extends Controller
{
    // إنشاء تقييم جديد
    // إنشاء تقييم جديد
public function store(Request $request)
{
$validator = Validator::make($request->all(), [
    'evaluated_user_id' => 'required|exists:users,userId',
    'group_id' => 'required|exists:groups,groupid',
    'criteria_id' => 'required|exists:evaluation_criteria,criteria_id',
    'rate' => 'required|integer|min:1|max:5'
]);

if ($validator->fails()) {
    return response()->json($validator->errors(), 422);
}

$user = Auth::user();
$group = Group::findOrFail($request->group_id);
$evaluatedUser = User::findOrFail($request->evaluated_user_id);

// منع التقييم الذاتي
if ($user->userId == $evaluatedUser->userId) {
    return response()->json(['message' => 'لا يمكنك تقييم نفسك'], 403);
}

// التحقق من صلاحية المُقيِّم
if (!$this->isApprovedMember($user, $group)) {
    return response()->json(['message' => 'ليست لديك صلاحية التقييم في هذه المجموعة'], 403);
}

// التحقق من صحة المُقيَّم (تختلف القواعد للمنسقين)
if (!$this->isValidEvaluatedUser($evaluatedUser, $group)) {
    // إذا لم يكن المستخدم المُقيَّم عضوًا في المجموعة، نتحقق إذا كان منسقًا
    if (!$evaluatedUser->isCoordinator()) {
        return response()->json(['message' => 'المستخدم المُقيَّم غير صالح'], 403);
    }
}

// التحقق من التقييم المكرر
if ($this->isDuplicateEvaluation($user->userId, $evaluatedUser->userId, $request->criteria_id)) {
    return response()->json(['message' => 'تم التقييم مسبقًا لهذا المعيار'], 409);
}

// إنشاء التقييم
$evaluation = PeerEvaluation::create([
    'evaluator_user_id' => $user->userId,
    'evaluated_user_id' => $evaluatedUser->userId,
    'group_id' => $group->groupid,
    'criteria_id' => $request->criteria_id,
    'rate' => $request->rate
]);

return response()->json($evaluation, 201);
}

// التحقق من صحة المُقيَّم (طلاب أو مشرفين أو منسقين)
private function isValidEvaluatedUser(User $user, Group $group)
{
// إذا كان المستخدم منسقًا، نسمح بتقييمه دون التحقق من ارتباطه بالمجموعة
if ($user->isCoordinator()) {
    return true;
}

if ($user->role === 'student') {
    return $user->student && $user->student->groups()
        ->where('groups.groupid', $group->groupid)
        ->exists();
}

if ($user->role === 'supervisor') {
    return $user->supervisor && $user->supervisor->groups()
        ->where('groups.groupid', $group->groupid)
        ->exists();
}

return false;
}

    // عرض التقييمات
    public function index(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'group_id' => 'required|exists:groups,groupid'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = Auth::user();
        $group = Group::findOrFail($request->group_id);

        // فقط المنسق يمكنه رؤية جميع التقييمات
        if (!$user->isCoordinator()) {
            return response()->json(['message' => 'ليست لديك صلاحية عرض التقييمات'], 403);
        }

        return PeerEvaluation::with([
                'evaluated:userId,name',
                'evaluator:userId,name',
                'criterion:criteria_id,title'
            ])
            ->where('group_id', $group->groupid)
            ->get();
    }


    // عرض تقييم محدد
    public function show($id)
    {
        $evaluation = PeerEvaluation::with([
            'evaluated:userId,name',
            'evaluator:userId,name',
            'criterion:criteria_id,title'
        ])->findOrFail($id);

        $user = Auth::user();

        // فقط المنسق يمكنه رؤية أي تقييم
        if (!$user->isCoordinator()) {
            return response()->json(['message' => 'غير مصرح بالوصول'], 403);
        }

        return response()->json($evaluation);
    }


    // تحديث التقييم
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'rate' => 'required|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $evaluation = PeerEvaluation::findOrFail($id);
        $user = Auth::user();

        // التحقق من ملكية التقييم
        if ($evaluation->evaluator_user_id !== $user->userId) {
            return response()->json(['message' => 'غير مصرح بالتعديل'], 403);
        }

        $evaluation->update(['rate' => $request->rate]);

        return response()->json($evaluation);
    }

    // حذف التقييم
    public function destroy($id)
    {
        $evaluation = PeerEvaluation::findOrFail($id);
        $user = Auth::user();

        // فقط المنسق يمكنه حذف التقييمات
        if (!$user->isCoordinator()) {
            return response()->json(['message' => 'غير مصرح بالحذف'], 403);
        }

        $evaluation->delete();
        return response()->json(['message' => 'تم الحذف بنجاح']);
    }
    // ============ الدوال المساعدة ============ //
    
    // التحقق من عضوية المُقيِّم المعتمدة
    private function isApprovedMember(User $user, Group $group)
    {
        if ($user->role === 'student' && $user->student) {
            return $user->student->groups()
                ->where('groups.groupid', $group->groupid)
                ->wherePivot('status', 'approved')
                ->exists();
        }

        if ($user->role === 'supervisor' && $user->supervisor) {
            return $user->supervisor->groups()
                ->where('groups.groupid', $group->groupid)
                ->wherePivot('status', 'approved')
                ->exists();
        }

        return false;
    }

    // التحقق من صحة المُقيَّم (طلاب أو مشرفين)
    
    // التحقق من التقييم المكرر
    private function isDuplicateEvaluation($evaluatorId, $evaluatedId, $criteriaId)
    {
        return PeerEvaluation::where([
            'evaluator_user_id' => $evaluatorId,
            'evaluated_user_id' => $evaluatedId,
            'criteria_id' => $criteriaId
        ])->exists();
    }
    // استرجاع جميع معايير التقييم
    public function getCriteria()
    {
        $criteria = EvaluationCriterion::all(['criteria_id', 'title', 'description']);
        return response()->json($criteria);
    }


    // في EvaluationController.php
/**
 * حساب متوسط تقييمات المنسق الحالي حسب معايير محددة
 * 
 * @param Request $request
 * @return \Illuminate\Http\JsonResponse
 */
public function getCoordinatorAverageRatings(Request $request)
{
    // التحقق من أن المستخدم الحالي منسق
    $coordinator = Auth::user();
    if (!$coordinator->isCoordinator()) {
        return response()->json(['message' => 'ليست لديك صلاحية الوصول لهذه البيانات'], 403);
    }

    // معايير التقييم الخاصة بالمنسقين (11-13)
    $criteriaIds = [11, 12, 13]; // إدارة الجدول الزمني، توفير الموارد، التقييم والمتابعة

    // حساب المتوسط لكل معيار
    $averages = [];
    foreach ($criteriaIds as $criteriaId) {
        $average = PeerEvaluation::where('evaluated_user_id', $coordinator->userId)
            ->where('criteria_id', $criteriaId)
            ->avg('rate');

        // الحصول على معلومات المعيار
        $criterion = EvaluationCriterion::find($criteriaId, ['criteria_id', 'title']);

        $averages[] = [
            'criteria_id' => $criteriaId,
            'criteria_title' => $criterion->title,
            'average_rating' => round($average, 2) // تقريب إلى منزلتين عشريتين
        ];
    }

    // حساب المتوسط العام لجميع المعايير
    $overallAverage = PeerEvaluation::where('evaluated_user_id', $coordinator->userId)
        ->whereIn('criteria_id', $criteriaIds)
        ->avg('rate');

    return response()->json([
        'success' => true,
        'coordinator_id' => $coordinator->userId,
        'coordinator_name' => $coordinator->name,
        'criteria_averages' => $averages,
        'overall_average' => round($overallAverage, 2)
    ]);
}

public function generateCoordinatorSatisfactionReport(Request $request)
{
    // التحقق من أن المستخدم الحالي منسق
    $coordinator = Auth::user();
    if (!$coordinator->isCoordinator()) {
        return response()->json(['message' => 'ليست لديك صلاحية الوصول لهذه البيانات'], 403);
    }

    // معايير التقييم الخاصة بالمنسقين (11-13)
    $criteriaIds = [11, 12, 13]; // إدارة الجدول الزمني، توفير الموارد، التقييم والمتابعة

    // حساب المتوسط لكل معيار مع تفاصيل إضافية
    $criteriaDetails = [];
    $totalRatings = 0;
    $totalResponses = 0;

    foreach ($criteriaIds as $criteriaId) {
        $criterion = EvaluationCriterion::find($criteriaId);
        
        // الحصول على جميع التقييمات لهذا المعيار
        $evaluations = PeerEvaluation::where('evaluated_user_id', $coordinator->userId)
            ->where('criteria_id', $criteriaId)
            ->with('evaluator')
            ->get();

        $average = $evaluations->avg('rate');
        $count = $evaluations->count();
        
        // تحليل التوزيع التكراري للتقييمات
        $ratingDistribution = [
            1 => $evaluations->where('rate', 1)->count(),
            2 => $evaluations->where('rate', 2)->count(),
            3 => $evaluations->where('rate', 3)->count(),
            4 => $evaluations->where('rate', 4)->count(),
            5 => $evaluations->where('rate', 5)->count(),
        ];

        // حساب نسبة الرضا (تقييمات 4 و5 كنسبة مئوية)
        $satisfactionPercentage = $count > 0 
            ? round((($ratingDistribution[4] + $ratingDistribution[5]) / $count) * 100, 2)
            : 0;

        $criteriaDetails[] = [
            'criteria_id' => $criteriaId,
            'criteria_title' => $criterion->title,
            'criteria_description' => $criterion->description,
            'average_rating' => round($average, 2),
            'total_responses' => $count,
            'rating_distribution' => $ratingDistribution,
            'satisfaction_percentage' => $satisfactionPercentage,
            'satisfaction_level' => $this->getSatisfactionLevel($satisfactionPercentage),
            'comments' => $evaluations->pluck('comment')->filter()->values()
        ];

        $totalRatings += $evaluations->sum('rate');
        $totalResponses += $count;
    }

    // حساب المتوسط العام
    $overallAverage = $totalResponses > 0 ? round($totalRatings / $totalResponses, 2) : 0;

    // حساب نسبة الرضا العامة
    $overallSatisfaction = $this->calculateOverallSatisfaction($criteriaDetails);

    // تحضير التقرير النهائي
    $report = [
        'coordinator_id' => $coordinator->userId,
        'coordinator_name' => $coordinator->name,
        'report_date' => now()->toDateTimeString(),
        'total_evaluations_received' => $totalResponses,
        'overall_average_rating' => $overallAverage,
        'overall_satisfaction_percentage' => $overallSatisfaction,
        'overall_satisfaction_level' => $this->getSatisfactionLevel($overallSatisfaction),
        'criteria_details' => $criteriaDetails,
        'summary' => $this->generateSummary($overallAverage, $overallSatisfaction)
    ];

    return response()->json([
        'success' => true,
        'report' => $report
    ]);
}

/**
 * حساب مستوى الرضا بناءً على النسبة المئوية
 */
private function getSatisfactionLevel($percentage)
{
    if ($percentage >= 80) return 'ممتاز';
    if ($percentage >= 60) return 'جيد جداً';
    if ($percentage >= 40) return 'جيد';
    if ($percentage >= 20) return 'مقبول';
    return 'ضعيف';
}

/**
 * حساب نسبة الرضا العامة من تفاصيل المعايير
 */
private function calculateOverallSatisfaction($criteriaDetails)
{
    $totalSatisfaction = 0;
    $totalCriteria = 0;

    foreach ($criteriaDetails as $criteria) {
        $totalSatisfaction += $criteria['satisfaction_percentage'];
        $totalCriteria++;
    }

    return $totalCriteria > 0 ? round($totalSatisfaction / $totalCriteria, 2) : 0;
}

/**
 * توليد ملخص التقرير بناءً على النتائج
 */
private function generateSummary($average, $satisfaction)
{
    if ($average >= 4.5) {
        return "أظهر التقرير مستوى رضا عالي جداً من المستخدمين. المتوسط العام للتقييمات هو {$average} مما يشير إلى أداء ممتاز.";
    } elseif ($average >= 3.5) {
        return "أظهر التقرير مستوى رضا جيد من المستخدمين. المتوسط العام للتقييمات هو {$average} مع وجود بعض المجالات للتحسين.";
    } elseif ($average >= 2.5) {
        return "أظهر التقرير مستوى رضا متوسط. المتوسط العام للتقييمات هو {$average} مما يشير إلى الحاجة لتحسينات في عدة مجالات.";
    } else {
        return "أظهر التقرير مستوى رضا منخفض. المتوسط العام للتقييمات هو {$average} مما يتطلب مراجعة شاملة للأداء.";
    }
}
}