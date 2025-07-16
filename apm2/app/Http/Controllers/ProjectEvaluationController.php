<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Group;
use App\Models\Student;
use App\Models\DiscussionSchedule;
use App\Services\GradeService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class ProjectEvaluationController extends Controller
{
    protected $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    public function storeEvaluation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,scheduledId',
            'type' => 'required|in:individual,group',
            'student_id' => 'required_if:type,individual|nullable|exists:students,studentId',
            'criteria' => 'required|array',
            'criteria.problem_definition' => 'nullable|integer|between:1,5',
            'criteria.theoretical_study' => 'nullable|integer|between:1,5',
            'criteria.reference_study' => 'nullable|integer|between:1,5',
            'criteria.analytical_study' => 'nullable|integer|between:1,5',
            'criteria.class_diagram' => 'nullable|integer|between:1,5',
            'criteria.erd_diagram' => 'nullable|integer|between:1,5',
            'criteria.front_back_connection' => 'nullable|integer|between:0,100',
            'criteria.requirements_achievement' => 'nullable|integer|between:0,100',
            'criteria.project_management' => 'nullable|integer|between:1,5',
            'criteria.documentation' => 'nullable|integer|between:1,5',
            'criteria.final_presentation' => 'nullable|integer|between:1,5',
            'notes' => 'nullable|string',
            'is_final' => 'sometimes|boolean'
        ]);

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
            $stageKey = $schedule->type;

            if ($request->type === 'individual' && $request->student_id) {
                if (!$group->isStudentApproved($request->student_id)) {
                    throw new \Exception('الطالب غير معتمد في هذه المجموعة');
                }
            }

            $evaluationData = [
                'groupId' => $group->groupid,
                'scheduleId' => $schedule->scheduledId,
                'type' => $request->type,
                'studentId' => $request->type === 'individual' ? $request->student_id : null,
                'stage' => $stageKey,
                'notes' => $request->notes,
                'is_final' => $request->is_final ?? false,
                ...$request->criteria
            ];

            $evaluation = Evaluation::create($evaluationData);

            if ($evaluation->is_final) {
                $this->updateStageGrades($group, $stageKey);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حفظ التقييم بنجاح',
                'evaluation' => $evaluation->load('group', 'student', 'schedule')
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

    protected function updateStageGrades(Group $group, $stageKey)
    {
        $stageGrade = $this->gradeService->calculateStageGrade($group, $stageKey);
        
        $group->update([
            "{$stageKey}_grade" => $stageGrade,
            'updated_at' => now()
        ]);

        foreach ($group->approvedStudents as $student) {
            $grade = $this->gradeService->calculateStudentStageGrade($student, $group, $stageKey);
            
            DB::table('group_student')
                ->where('groupid', $group->groupid)
                ->where('studentId', $student->studentId)
                ->update([
                    "{$stageKey}_individual_grade" => $grade
                ]);
        }
    }

    public function calculateFinalGrades($groupId)
    {

        $group = Group::with(['evaluations' => function($query) {
            $query->where('is_final', true)
                  ->where('type', 'group');
        }])->findOrFail($groupId);
        try {
            DB::beginTransaction();
    
            $group = Group::with(['evaluations' => function($query) {
                $query->where('is_final', true);
            }, 'approvedStudents.user:id,name'])->findOrFail($groupId);
    
            // سجل مراحل الإعدادات
            Log::debug("Stages config:", config('stages'));
    
            $grades = [];
            $totalWeightedGrade = 0;
            
            foreach (config('stages', []) as $stageKey => $stageConfig) {
                // سجل معلومات المرحلة قبل الحساب
                Log::debug("Processing stage:", [
                    'key' => $stageKey,
                    'config' => $stageConfig
                ]);
    
                $stageGrade = $this->gradeService->calculateStageGrade($group, $stageKey);
                
                // سجل النتائج الوسيطة
                Log::debug("Stage calculation result:", [
                    'stage' => $stageKey,
                    'grade' => $stageGrade,
                    'weight' => $stageConfig['weight'] ?? 0
                ]);
    
                $weight = $stageConfig['weight'] ?? 0;
                $weightedGrade = $stageGrade * $weight;
                $totalWeightedGrade += $weightedGrade;
    
                $grades[$stageKey] = [
                    'stage_name' => $stageConfig['name_ar'] ?? $stageKey,
                    'grade' => $stageGrade,
                    'weight' => $weight,
                    'weighted_grade' => $weightedGrade
                ];
            }

            $individualGrades = [];
            foreach ($group->approvedStudents as $student) {
                $finalGrade = $this->gradeService->calculateStudentFinalGrade($student, $group);
                
                $group->students()->updateExistingPivot($student->studentId, [
                    'final_individual_grade' => $finalGrade
                ]);

                $individualGrades[] = [
                    'student_id' => $student->studentId,
                    'name' => $student->user->name,
                    'grade' => $finalGrade
                ];
            }

            $group->update([
                'final_grade' => $totalWeightedGrade,
                'updated_at' => now()
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'تم حساب العلامات النهائية',
                'group' => [
                    'id' => $group->groupId,
                    'name' => $group->name,
                    'final_grade' => $totalWeightedGrade
                ],
                'stage_grades' => $grades,
                'individual_grades' => $individualGrades
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Final grades calculation failed: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'حدث خطأ: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getGroupEvaluations($groupId)
    {
        $group = Group::with(['evaluations' => function($query) {
            $query->with(['student.user:id,name', 'schedule'])
                  ->orderBy('created_at', 'desc');
        }])->findOrFail($groupId);

        $evaluationsByStage = [];
        foreach (config('stages', []) as $stageKey => $stageConfig) {
            if (!is_array($stageConfig)) continue;
            
            $evaluationsByStage[$stageConfig['name_ar'] ?? $stageKey] = $group->evaluations
                ->where('stage', $stageKey)
                ->values();
        }

        return response()->json([
            'success' => true,
            'group' => $group->only(['groupId', 'name', 'final_grade']),
            'evaluations' => $evaluationsByStage
        ]);
    }

    public function getStudentEvaluations($studentId)
    {
        $student = Student::with(['evaluations' => function($query) {
            $query->with(['group', 'schedule'])
                  ->orderBy('created_at', 'desc');
        }, 'user:id,name'])->findOrFail($studentId);

        $evaluationsByStage = [];
        foreach (config('stages', []) as $stageKey => $stageConfig) {
            if (!is_array($stageConfig)) continue;
            
            $evaluationsByStage[$stageConfig['name_ar'] ?? $stageKey] = $student->evaluations
                ->where('stage', $stageKey)
                ->values();
        }

        return response()->json([
            'success' => true,
            'student' => [
                'id' => $student->studentId,
                'name' => $student->user->name,
                'university_number' => $student->university_number
            ],
            'evaluations' => $evaluationsByStage
        ]);
    }
}