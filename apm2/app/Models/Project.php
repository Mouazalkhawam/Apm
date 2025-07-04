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
        'type' 
    ];

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

    // في App\Models\Project.php
    public function stages()
    {
        return $this->hasMany(ProjectStage::class, 'project_id', 'projectid');
    }
}
