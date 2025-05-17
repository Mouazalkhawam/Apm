<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;
    protected $primaryKey = 'groupId';

    protected $fillable = [
        'projectid',
        'name'
    ];

    // العلاقة مع المشروع
    public function project()
    {
        return $this->belongsTo(Project::class, 'projectid', 'projectid');
    }

    // العلاقة مع الطلاب (معدلة)
// في App\Models\Group
    public function students() 
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->withPivot('status');
    }

    public function supervisors() 
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->withPivot('status');
    }

    public function groupStudents()
    {
        return $this->hasMany(GroupStudent::class, 'groupid', 'groupid');
    }

    public function groupSupervisors()
    {
        return $this->hasMany(GroupSupervisor::class, 'groupid', 'groupid');
    }
    

    // app/Models/Group.php
    public function peerEvaluations()
    {
        return $this->hasMany(PeerEvaluation::class, 'group_id');
    }

    public function evaluationCriteria()
    {
        return $this->hasMany(EvaluationCriterion::class);
    }
    
}