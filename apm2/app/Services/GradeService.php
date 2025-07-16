<?php

namespace App\Services;

use App\Models\Group;
use App\Models\Student;
use App\Models\Evaluation;
use Illuminate\Support\Facades\Log;

class GradeService
{
    protected $stages;

    public function __construct()
    {
        $this->stages = $this->loadStagesConfig();
    }

    protected function loadStagesConfig()
    {
        $stages = config('stages', []);
        
        if (!is_array($stages)) {
            Log::error('Invalid stages configuration - expected array');
            return [];
        }
        
        return $stages;
    }

    protected function getStageConfig($stageKey)
    {
        $normalizedKey = $this->normalizeStageName($stageKey);
        return $this->stages[$normalizedKey] ?? null;
    }

    protected function normalizeStageName($stageName)
    {
        foreach ($this->stages as $key => $stage) {
            $possibleNames = array_merge(
                [$stage['name_ar'], $key],
                $stage['db_names'] ?? []
            );
            
            if (in_array($stageName, $possibleNames)) {
                return $key;
            }
        }
        
        Log::warning("Unknown stage name: {$stageName}");
        return $stageName;
    }

    public function calculateStageGrade(Group $group, string $stageKey): float
{
    // خرائط تحويل المفاتيح الإنجليزية للعربية
    $stageMap = [
        'discussion' => 'مرحلية',
        'analytical' => 'تحليلية',
        'final' => 'نهائية'
    ];

    // تحقق من وجود المفتاح في الخريطة
    if (!array_key_exists($stageKey, $stageMap)) {
        Log::error("Unknown stage key in calculateStageGrade: {$stageKey}");
        return 0;
    }

    $arabicStage = $stageMap[$stageKey];

    // سجل الاستعلام للتحقق من البيانات
    Log::debug("Searching for evaluations:", [
        'groupId' => $group->groupId,
        'stage' => $arabicStage,
        'type' => 'group',
        'is_final' => true
    ]);

    $evaluations = $group->evaluations()
        ->where('stage', $arabicStage)
        ->where('is_final', true)
        ->where('type', 'group')
        ->get();

    if ($evaluations->isEmpty()) {
        Log::warning("No evaluations found for stage: {$arabicStage}");
        return 0;
    }

    switch ($stageKey) {
        case 'discussion': // تم تصحيح الخطأ الإملائي هنا
            $avg = $evaluations->avg(function($eval) {
                return ($eval->problem_definition + 
                       $eval->theoretical_study + 
                       $eval->reference_study) / 3;
            });
            return $avg ?? 0;

        case 'analytical':
            $avg = $evaluations->avg(function($eval) {
                return ($eval->analytical_study + 
                       $eval->class_diagram + 
                       $eval->erd_diagram) / 3;
            });
            return $avg ?? 0;

        case 'final':
            $avg = $evaluations->avg(function($eval) {
                return ($eval->front_back_connection * 0.3 +
                       $eval->requirements_achievement * 0.4 +
                       $eval->final_presentation * 20 * 0.3) / 100;
            });
            return $avg ?? 0;

        default:
            return 0;
    }
}
    public function calculateStudentStageGrade(Student $student, Group $group, string $stageKey)
    {
        $stageConfig = $this->getStageConfig($stageKey);
        
        if (!$stageConfig) {
            Log::error("Stage config not found for: {$stageKey}");
            return 0;
        }

        $evaluations = Evaluation::where('groupId', $group->groupId)
            ->where('studentId', $student->studentId)
            ->where('stage', $stageKey)
            ->where('is_final', true)
            ->where('type', 'individual')
            ->get();

        if ($evaluations->isEmpty()) {
            Log::info("No individual evaluations found for student {$student->id} in stage {$stageKey}");
            return 0;
        }

        $total = $evaluations->sum(function($evaluation) {
            return $this->calculateEvaluationScore($evaluation);
        });

        return $total / $evaluations->count();
    }

    public function calculateStudentFinalGrade(Student $student, Group $group)
    {
        $finalGrade = 0;

        foreach ($this->stages as $stageKey => $stageConfig) {
            $stageGrade = $this->calculateStudentStageGrade($student, $group, $stageKey);
            $finalGrade += $stageGrade * ($stageConfig['weight'] ?? 0);
        }

        return $finalGrade;
    }

    public function calculateGroupFinalGrade(Group $group)
    {
        $finalGrade = 0;

        foreach ($this->stages as $stageKey => $stageConfig) {
            $stageGrade = $this->calculateStageGrade($group, $stageKey);
            $finalGrade += $stageGrade * ($stageConfig['weight'] ?? 0);
        }

        return $finalGrade;
    }

    public function calculateEvaluationScore(Evaluation $evaluation)
    {
        $stageConfig = $this->getStageConfig($evaluation->stage);
        
        if (!$stageConfig || !isset($stageConfig['criteria'])) {
            Log::error("Invalid stage config or missing criteria for stage: {$evaluation->stage}");
            return 0;
        }

        $score = 0;
        
        foreach ($stageConfig['criteria'] as $criterion => $weight) {
            $value = $evaluation->{$criterion};
            
            if (!is_null($value)) {
                $normalized = $this->normalizeScore($value, $criterion);
                $score += $normalized * $weight;
                Log::debug("Evaluation {$evaluation->id} - {$criterion}: {$value} => {$normalized} * {$weight}");
            }
        }

        return $score;
    }

    protected function normalizeScore($value, $criterion)
    {
        $percentageFields = ['front_back_connection', 'requirements_achievement'];
        
        if (in_array($criterion, $percentageFields)) {
            if ($value >= 85) return 5;
            if ($value >= 70) return 4;
            if ($value >= 50) return 3;
            return 2;
        }
        
        return min(max($value, 1), 5); // تأكد أن القيمة بين 1 و 5
    }
}