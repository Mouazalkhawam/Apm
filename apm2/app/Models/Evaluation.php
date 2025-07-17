<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Config;

class Evaluation extends Model
{
    use HasFactory;

    protected $primaryKey = 'evaluationId';
    
    protected $fillable = [
        'groupId',
        'scheduleId',
        'type',
        'studentId',
        'stage',
        'problem_definition',
        'theoretical_study',
        'reference_study',
        'analytical_study',
        'class_diagram',
        'erd_diagram',
        'front_back_connection',
        'requirements_achievement',
        'project_management',
        'documentation',
        'final_presentation',
        'punctuality',
        'participation',
        'helpfulness',
        'task_completion',
        'notes',
        'is_final',
        'is_task_related',
        'is_extra_task'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'groupId', 'groupid');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId');
    }

    public function schedule()
    {
        return $this->belongsTo(DiscussionSchedule::class, 'scheduleId');
    }

    // دالة لحساب درجة التقييم بناء على المرحلة
    public function calculateGrade()
    {
        $stageConfig = Config::get("stages.{$this->stage}");
        
        if (!$stageConfig) {
            return 0;
        }

        switch ($this->stage) {
            case 'discussion':
                return $this->calculateDiscussionGrade();
            case 'analytical':
                return $this->calculateAnalyticalGrade();
            case 'final':
                return $this->calculateFinalGrade();
            default:
                return 0;
        }
    }

    protected function calculateDiscussionGrade()
    {
        return ($this->problem_definition * 0.4) + 
               ($this->theoretical_study * 0.4) + 
               ($this->reference_study * 0.2);
    }

    protected function calculateAnalyticalGrade()
    {
        return ($this->analytical_study * 0.5) + 
               ($this->class_diagram * 0.3) + 
               ($this->erd_diagram * 0.2);
    }

    protected function calculateFinalGrade()
    {
        $frontScore = $this->convertPercentageToScore($this->front_back_connection);
        $requirementsScore = $this->convertPercentageToScore($this->requirements_achievement);
        
        return ($frontScore * 0.3) + 
               ($requirementsScore * 0.4) + 
               ($this->final_presentation * 0.3);
    }

    protected function convertPercentageToScore($percentage)
    {
        if ($percentage >= 85) return 5;
        if ($percentage >= 70) return 4;
        if ($percentage >= 50) return 3;
        return 2;
    }

    public function getEvaluationTypeAttribute()
    {
        return $this->type === 'individual' ? 'فردي' : 'جماعي';
    }

    public function getStageNameAttribute()
    {
        $stages = Config::get('stages');
        return $stages[$this->stage]['name_ar'] ?? $this->stage;
    }

    public function calculateIndividualGrade()
{
    $baseGrade = $this->calculateGrade(); // الدرجة الأساسية حسب المرحلة
    
    // إذا كان التقييم لمهمة أساسية ولم يكملها
    if ($this->is_task_related && $this->task_completion < 3) {
        return max($baseGrade - 1, 1); // خصم نقطة إذا لم يكمل المهمة
    }
    
    // إذا كان التقييم لمهمة إضافية
    if ($this->is_extra_task) {
        return min($baseGrade + 0.5, 5); // إضافة نصف نقطة بونص
    }
    
    return $baseGrade;
}
}