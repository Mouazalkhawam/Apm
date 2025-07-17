<?php

namespace App\Services;

use App\Models\Group;
use App\Models\Student;
use App\Models\Evaluation;
use Illuminate\Support\Facades\Log;

class GradeService
{
    public function calculateStageGrade(Group $group, string $stageKey): float
    {
        $stageMap = [
            'discussion' => 'مرحلية',
            'analytical' => 'تحليلية', 
            'final' => 'نهائية'
        ];

        if (!array_key_exists($stageKey, $stageMap)) {
            Log::error("Unknown stage key: {$stageKey}");
            return 0;
        }

        $evaluations = $group->evaluations()
            ->where('stage', $stageMap[$stageKey])
            ->where('is_final', true)
            ->where('type', 'group')
            ->get();

        if ($evaluations->isEmpty()) {
            return 0;
        }

        switch ($stageKey) {
            case 'discussion':
                return $evaluations->avg(function($eval) {
                    return ($eval->problem_definition + 
                           $eval->theoretical_study + 
                           $eval->reference_study) / 3;
                });
                
            case 'analytical':
                return $evaluations->avg(function($eval) {
                    return ($eval->analytical_study + 
                           $eval->class_diagram + 
                           $eval->erd_diagram) / 3;
                });
                
            case 'final':
                return $evaluations->avg(function($eval) {
                    return ($eval->front_back_connection * 0.3 +
                           $eval->requirements_achievement * 0.4 +
                           $eval->final_presentation * 20 * 0.3) / 100;
                });
                
            default:
                return 0;
        }
    }

    public function calculateStudentStageGrade($student, Group $group, $stageKey)
    {
        $evaluation = Evaluation::where('groupId', $group->groupId)
            ->where('studentId', $student->studentId)
            ->where('stage', $stageKey)
            ->where('is_final', true)
            ->where('type', 'individual')
            ->first();

        if (!$evaluation) return 0;

        switch ($stageKey) {
            case 'discussion':
                return ($evaluation->problem_definition * 0.4) + 
                       ($evaluation->theoretical_study * 0.4) + 
                       ($evaluation->reference_study * 0.2);
                       
            case 'analytical':
                return ($evaluation->analytical_study * 0.5) + 
                       ($evaluation->class_diagram * 0.3) + 
                       ($evaluation->erd_diagram * 0.2);
                       
            case 'final':
                $frontScore = $this->convertPercentageToScore($evaluation->front_back_connection);
                $requirementsScore = $this->convertPercentageToScore($evaluation->requirements_achievement);
                return ($frontScore * 0.3) + 
                       ($requirementsScore * 0.4) + 
                       ($evaluation->final_presentation * 0.3);
                       
            default:
                return 0;
        }
    }

    protected function convertPercentageToScore($percentage)
    {
        if ($percentage >= 85) return 5;
        if ($percentage >= 70) return 4;
        if ($percentage >= 50) return 3;
        return 2;
    }

    public function calculateGroupGrades(Group $group)
{
    $stages = [
        'discussion' => 'مرحلية',
        'analytical' => 'تحليلية',
        'final' => 'نهائية'
    ];

    $stageGrades = [];
    foreach ($stages as $key => $name) {
        $stageGrades[$key] = $this->calculateStageGrade($group, $key);
    }

    $finalGrade = array_sum($stageGrades) / count($stageGrades);

    return [
        'final_grade' => $finalGrade,
        'stages' => $stageGrades
    ];
}

public function calculateStudentGrades(Group $group, $studentId)
{
    $student = Student::findOrFail($studentId);
    $stages = ['discussion', 'analytical', 'final'];
    
    $grades = [];
    foreach ($stages as $stage) {
        $grades[$stage] = $this->calculateStudentStageGrade($student, $group, $stage);
    }

    $finalGrade = array_sum($grades) / count($grades);

    return [
        'final_grade' => $finalGrade,
        'stages' => $grades
    ];
}

}