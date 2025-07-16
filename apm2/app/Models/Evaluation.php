<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory;

    protected $primaryKey = 'evaluationId';
    
    protected $fillable = [
        // الحقول الحالية
        'groupId',
        'scheduleId',
        'type',
        'studentId',
        'stage',
        'problem_definition',
        'theoretical_study',
        'reference_study',
        'analytical_study',
        'class_diagram', // الجديد
        'erd_diagram', // الجديد
        'front_back_connection',
        'requirements_achievement',
        'project_management',
        'documentation', // الجديد
        'final_presentation', // الجديد
        'innovation', // الجديد
        'punctuality',
        'participation',
        'helpfulness',
        'task_completion',
        'notes',
        'is_final'
    ];

    // العلاقات الحالية
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

    // دالة مساعدة لمعرفة نوع التقييم
    public function getEvaluationTypeAttribute()
    {
        return $this->type === 'individual' ? 'فردي' : 'جماعي';
    }

    // في App\Models\Evaluation.php
public function getStageNameAttribute()
{
    $stages = Config::get('stages');
    return $stages[$this->attributes['stage']]['name_ar'] ?? $this->attributes['stage'];
}
}