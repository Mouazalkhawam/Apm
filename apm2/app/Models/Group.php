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


    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->withPivot('status', 'is_leader');
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
    

    
    public function peerEvaluations()
    {
        return $this->hasMany(PeerEvaluation::class, 'group_id');
    }

    public function evaluationCriteria()
    {
        return $this->hasMany(EvaluationCriterion::class);
    }
    

    public function approvedStudents()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->wherePivot('status', 'approved')
                    ->withPivot('is_leader');
    }
   public function approvedSupervisors()
{
    return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                ->wherePivot('status', 'approved')
                ->withPivot('created_at'); // إضافة هذه السطر
}
 
    public function proposal()
    {
        return $this->hasOne(ProjectProposal::class, 'group_id', 'groupid');
    }   
}