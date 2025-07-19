<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Group;
use App\Models\Student;
use App\Models\DiscussionSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProjectEvaluationController extends Controller
{
    // تعريف معايير التقييم لكل مرحلة
    protected $stageCriteria = [
        'مرحلية' => [
            'problem_definition' => 10,
            'theoretical_study' => 10,
            'reference_study' => 10,
            'max_score' => 30
        ],
        'تحليلية' => [
            'analytical_study' => 15,
            'class_diagram' => 10,
            'erd_diagram' => 15,
            'max_score' => 35
        ],
        'نهائية' => [
            'front_back_connection' => 10, // كنسبة مئوية (80% => 8 نقاط)
            'requirements_achievement' => 15, // كنسبة مئوية (90% => 13.5 نقاط)
            'final_presentation' => 5,
            'max_score' => 30
        ]
    ];

    /**
     * حفظ التقييم الجديد
     */
    public function storeEvaluation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,scheduledId',
            'type' => 'required|in:individual,group',
            'student_id' => 'required_if:type,individual|nullable|exists:students,studentId',
            'stage' => 'required|in:مرحلية,تحليلية,نهائية',
            'criteria' => 'required|array',
            'notes' => 'nullable|string',
            'is_final' => 'sometimes|boolean'
        ]);

        // التحقق من صحة المعايير حسب المرحلة
        if (isset($this->stageCriteria[$request->stage])) {
            foreach ($this->stageCriteria[$request->stage] as $criterion => $weight) {
                if ($criterion !== 'max_score') {
                    $validator->sometimes("criteria.$criterion", 
                        "nullable|numeric|min:0|max:$weight", 
                        function() { return true; });
                }
            }
        }

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $schedule = DiscussionSchedule::findOrFail($request->schedule_id);
            $group = $schedule->group;
            $stage = $request->stage;

            if ($request->type === 'individual' && $request->student_id) {
                $studentExists = DB::table('group_student')
                ->where('group_student.groupId', $group->groupid)
                ->where('group_student.studentId', $request->student_id)
                ->where('group_student.status', 'approved')
                ->exists();
            
            if (!$studentExists) {
                throw new \Exception('الطالب غير معتمد في هذه المجموعة');
            }
            }

            // حساب العلامة الكلية للمرحلة
            $totalScore = $this->calculateStageScore($stage, $request->criteria);
            $maxStageScore = $this->stageCriteria[$stage]['max_score'];

            $evaluationData = [
                'groupId' => $group->groupid,
                'scheduleId' => $schedule->scheduledId,
                'type' => $request->type,
                'studentId' => $request->type === 'individual' ? $request->student_id : null,
                'stage' => $stage,
                'notes' => $request->notes,
                'is_final' => $request->is_final ?? false,
                'total_score' => $totalScore,
                'max_score' => $maxStageScore,
                ...$request->criteria
            ];

            $evaluation = Evaluation::create($evaluationData);

            if ($evaluation->is_final) {
                $this->updateFinalGrades($group, $stage);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ التقييم بنجاح',
                'evaluation' => $evaluation,
                'score_details' => [
                    'total' => $totalScore,
                    'max_possible' => $maxStageScore,
                    'percentage' => ($totalScore / $maxStageScore) * 100
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Evaluation creation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * حساب العلامة حسب مرحلة التقييم
     */
    protected function calculateStageScore($stage, $criteria)
    {
        $total = 0;
        
        foreach ($this->stageCriteria[$stage] as $criterion => $weight) {
            if ($criterion !== 'max_score' && isset($criteria[$criterion])) {
                // معالجة النسب المئوية للمرحلة النهائية
                if (in_array($criterion, ['front_back_connection', 'requirements_achievement'])) {
                    $total += ($criteria[$criterion] * $weight) / 100;
                } else {
                    $total += $criteria[$criterion] ?? 0;
                }
            }
        }
        
        return round($total, 2);
    }

    /**
     * تحديث العلامات النهائية
     */
    protected function updateFinalGrades(Group $group, $stage)
    {
        $groupScore = $this->calculateGroupStageScore($group, $stage);
        $group->update(["{$stage}_grade" => $groupScore]);

        foreach ($group->students()->where('status', 'approved')->get() as $student) {
            $studentScore = $this->calculateStudentStageScore($student, $group, $stage);
            
            DB::table('group_student')
                ->where('groupId', $group->groupid)
                ->where('studentId', $student->studentId)
                ->update(["{$stage}_individual_grade" => $studentScore]);
        }
    }

    /**
     * حساب علامة مرحلة للمجموعة
     */
    protected function calculateGroupStageScore(Group $group, $stage)
    {
        $evaluations = Evaluation::where('groupId', $group->groupid)
            ->where('stage', $stage)
            ->where('is_final', true)
            ->where('type', 'group')
            ->get();

        if ($evaluations->isEmpty()) return 0;

        return round($evaluations->avg('total_score'), 2);
    }

    /**
     * حساب علامة مرحلة للطالب
     */
    protected function calculateStudentStageScore($student, Group $group, $stage)
    {
        $evaluations = Evaluation::where('groupId', $group->groupid)
            ->where('studentId', $student->studentId)
            ->where('stage', $stage)
            ->where('is_final', true)
            ->where('type', 'individual')
            ->get();

        if ($evaluations->isEmpty()) {
            // إذا لم يكن للطالب تقييمات، نعطيه العلامة كاملة
            return $this->stageCriteria[$stage]['max_score'];
        }

        return round($evaluations->avg('total_score'), 2);
    }

    /**
     * الحصول على العلامات النهائية
     */
    public function getFinalGrades($groupId)
    {
        try {
            $groupStages = ['مرحلية', 'تحليلية', 'نهائية'];
            $stageMax = [
                'مرحلية' => 30,
                'تحليلية' => 40, // زودنا من 35 لـ40 بسبب زيادة erd_diagram 10 بدل 5
                'نهائية' => 30,
            ];
    
            $groupGrades = [];
            $totalGroupGrade = 0;
    
            // حساب علامات المجموعات حسب المراحل
            foreach ($groupStages as $stage) {
                $result = DB::select("
                    SELECT AVG(
                        CASE 
                            WHEN stage = 'مرحلية' THEN (problem_definition * 0.4 + theoretical_study * 0.4 + reference_study * 0.2)
                            WHEN stage = 'تحليلية' THEN (analytical_study * 0.5 + class_diagram * 0.3 + erd_diagram * 0.15)
                            WHEN stage = 'نهائية' THEN (
                                CASE 
                                    WHEN front_back_connection >= 85 THEN 5
                                    WHEN front_back_connection >= 70 THEN 4
                                    WHEN front_back_connection >= 50 THEN 3
                                    ELSE 2
                                END * 0.3
                                +
                                CASE 
                                    WHEN requirements_achievement >= 85 THEN 5
                                    WHEN requirements_achievement >= 70 THEN 4
                                    WHEN requirements_achievement >= 50 THEN 3
                                    ELSE 2
                                END * 0.4
                                + final_presentation * 0.3
                            )
                            ELSE 0
                        END
                    ) AS avg_score
                    FROM evaluations 
                    WHERE groupId = ? AND stage = ? AND type = 'group' AND is_final = 1
                ", [$groupId, $stage]);
    
                $avgScore = $result[0]->avg_score ?? 0;
                $groupGrades[$stage] = round($avgScore, 2);
                $totalGroupGrade += $avgScore;
            }
    
            // أقصى درجة ممكنة (مجموع مراحل فقط)
            $maxTotal = array_sum($stageMax);
    
            // حساب النسبة النهائية من 100
            $overallPercentage = $maxTotal > 0 ? round(($totalGroupGrade / $maxTotal) * 100, 2) : 0;
    
            // استعلام الطلاب في المجموعة
            $students = DB::table('group_student')
                ->join('students', 'group_student.studentId', '=', 'students.studentId')
                ->join('users', 'students.userId', '=', 'users.userId')
                ->where('group_student.groupid', $groupId)
                ->where('group_student.status', 'approved')
                ->select('students.studentId', 'users.name')
                ->get();
    
            $individualGrades = [];
    
            foreach ($students as $student) {
                $studentTotal = 0;
                $studentStageGrades = [];
    
                foreach ($groupStages as $stage) {
                    $result = DB::select("
                        SELECT AVG(
                            CASE 
                                WHEN stage = 'مرحلية' THEN (problem_definition * 0.4 + theoretical_study * 0.4 + reference_study * 0.2)
                                WHEN stage = 'تحليلية' THEN (analytical_study * 0.5 + class_diagram * 0.3 + erd_diagram * 0.15)
                                WHEN stage = 'نهائية' THEN (
                                    CASE 
                                        WHEN front_back_connection >= 85 THEN 5
                                        WHEN front_back_connection >= 70 THEN 4
                                        WHEN front_back_connection >= 50 THEN 3
                                        ELSE 2
                                    END * 0.3
                                    +
                                    CASE 
                                        WHEN requirements_achievement >= 85 THEN 5
                                        WHEN requirements_achievement >= 70 THEN 4
                                        WHEN requirements_achievement >= 50 THEN 3
                                        ELSE 2
                                    END * 0.4
                                    + final_presentation * 0.3
                                )
                                ELSE 0
                            END
                        ) AS avg_score
                        FROM evaluations 
                        WHERE groupId = ? AND studentId = ? AND stage = ? AND type = 'individual' AND is_final = 1
                    ", [$groupId, $student->studentId, $stage]);
    
                    $avgScore = $result[0]->avg_score ?? 0;
                    $studentStageGrades[$stage] = round($avgScore, 2);
                    $studentTotal += $avgScore;
                }
    
                $studentPercentage = $maxTotal > 0 ? round(($studentTotal / $maxTotal) * 100, 2) : 0;
    
                $individualGrades[] = [
                    'student_id' => $student->studentId,
                    'name' => $student->name,
                    'grades' => $studentStageGrades,
                    'total_grade' => round($studentTotal, 2),
                    'percentage' => $studentPercentage
                ];
            }
    
            return response()->json([
                'success' => true,
                'group' => [
                    'id' => $groupId,
                    'name' => DB::table('groups')->where('groupid', $groupId)->value('name'),
                    'grades' => $groupGrades,
                    'total_grade' => round($totalGroupGrade, 2),
                    'overall_score_details' => [
                        'total' => round($totalGroupGrade, 2),
                        'max_possible' => $maxTotal,
                        'percentage' => $overallPercentage
                    ]
                ],
                'individual_grades' => $individualGrades
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ أثناء جلب العلامات',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    
    public function getGroupEvaluations($groupId)
    {
        $group = Group::with(['evaluations' => function($query) {
            $query->with(['student.user:userId,name', 'schedule'])
                  ->orderBy('created_at', 'desc');
        }])->findOrFail($groupId);

        $evaluationsByStage = [];
        foreach (array_keys($this->stageCriteria) as $stage) {
            $evaluationsByStage[$stage] = $group->evaluations
                ->where('stage', $stage)
                ->values();
        }

        return response()->json([
            'success' => true,
            'group' => $group->only(['groupid', 'name']),
            'evaluations' => $evaluationsByStage
        ]);
    }
}