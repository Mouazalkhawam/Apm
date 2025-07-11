<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $primaryKey = 'projectid';

    protected $fillable = [
        'title',
        'description',
        'startdate',
        'enddate',
        'status',
        'headid',
        'type',
        'progress'
    ];

    protected static function booted()
    {
        static::saving(function ($project) {
            $project->calculateProgress();
        });
    }

    // قائد الفريق (الطالب المسؤول عن المشروع)
    public function leader()
    {
        return $this->belongsTo(User::class, 'headid', 'userId');
    }

    public function group()
    {
        return $this->hasOne(Group::class, 'projectid', 'projectid');
    }

    // المشرفين المقترحين (بانتظار الموافقة)
    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'project_supervisor')
                    ->withPivot('status') // pending, approved, rejected
                    ->withTimestamps();
    }

    // الطلاب المقترحين (بانتظار الموافقة)
    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'project_id', 'student_id')
                    ->withPivot('status') // pending, approved, rejected
                    ->withTimestamps();
    }
   
    public function academicPeriods()
    {
        return $this->belongsToMany(AcademicPeriod::class, 'academic_period_project', 'project_projectid', 'academic_period_id');
    }

    public function stages()
    {
        return $this->hasMany(ProjectStage::class, 'project_id', 'projectid');
    }

    public function honorBoard()
    {
        return $this->hasOne(HonorBoardProject::class, 'project_id', 'projectid');
    }

    /**
     * حساب تقدم المشروع بناءً على المراحل المسلمة والمقيمة
     */
   // في app/Models/Project.php

// الحفاظ على الدوال الحالية كما هي
public function calculateProgress()
{
    $totalStages = $this->stages()->count();
    
    if ($totalStages === 0) {
        $this->progress = 0;
        return;
    }

    $completedStages = $this->stages()
        ->whereHas('submissions', function($query) {
            $query->where('status', 'reviewed')
                  ->whereNotNull('grade');
        })
        ->count();

    $this->progress = ($completedStages / $totalStages) * 100;
}
// إضافة الدوال الجديدة
public function getWeeklyPlannedProgress()
{
    $totalStages = $this->stages()->count();
    if ($totalStages === 0) return 0;
    
    $plannedThisWeek = $this->stages()
        ->whereBetween('due_date', [now()->startOfWeek(), now()->endOfWeek()])
        ->count();
        
    return ($plannedThisWeek / $totalStages) * 100;
}

public function getWeeklyActualProgress()
{
    $totalStages = $this->stages()->count();
    if ($totalStages === 0) return 0;
    
    $completedThisWeek = $this->stages()
        ->whereHas('submissions', function($query) {
            $query->where('status', 'reviewed')
                  ->whereNotNull('grade')
                  ->whereBetween('submitted_at', [now()->startOfWeek(), now()->endOfWeek()]);
        })
        ->count();
        
    return ($completedThisWeek / $totalStages) * 100;
}

public function getMonthlyActualProgress()
{
    $totalStages = $this->stages()->count();
    if ($totalStages === 0) return 0;
    
    $completedThisMonth = $this->stages()
        ->whereHas('submissions', function($query) {
            $query->where('status', 'reviewed')
                  ->whereNotNull('grade')
                  ->whereBetween('submitted_at', [now()->startOfMonth(), now()->endOfMonth()]);
        })
        ->count();
        
    return ($completedThisMonth / $totalStages) * 100;
}

public function getMonthlyPlannedProgress()
{
    $totalStages = $this->stages()->count();
    if ($totalStages === 0) return 0;
    
    $plannedThisMonth = $this->stages()
        ->whereBetween('due_date', [now()->startOfMonth(), now()->endOfMonth()])
        ->count();
        
    return ($plannedThisMonth / $totalStages) * 100;
}


    public function getFormattedProgressAttribute()
    {
        return number_format($this->progress, 2) . '%';
    }
}