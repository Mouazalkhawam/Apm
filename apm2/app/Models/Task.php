<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    protected $fillable = [
        'project_stage_id',
        'title',
        'description',
        'assigned_to',
        'status',
        'priority',
        'due_date',
        'assigned_by'
    ];

    public function stage()
    {
        return $this->belongsTo(ProjectStage::class, 'project_stage_id');
    }

    public function assignee()
    {
        return $this->belongsTo(Student::class, 'assigned_to');
    }

    public function assigner()
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }

    public function submissions()
    {
        return $this->hasMany(TaskSubmission::class);
    }

    // دالة جديدة للتحقق من وجود تسليم
    public function hasSubmission()
    {
        return $this->submissions()->exists();
    }

    // دالة جديدة للحصول على آخر تسليم
    public function latestSubmission()
    {
        return $this->submissions()->latest()->first();
    }
}