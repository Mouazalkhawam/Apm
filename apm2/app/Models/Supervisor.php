<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supervisor extends Model
{
    use HasFactory;

    protected $primaryKey = 'supervisorId';
    
    protected $fillable = ['userId'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    // المقترحات التي يشرف عليها
    public function proposals()
    {
        return $this->belongsToMany(
            ProjectProposal::class,
            'proposal_supervisors',
            'supervisor_id',
            'proposal_id'
        )->withTimestamps();
    }
    public function isApprovedForGroup($groupId)
    {
        return $this->groups()
            ->where('group_supervisor.groupid', $groupId) // تحديد الجدول
            ->where('group_supervisor.status', 'approved')
            ->exists();
    }

    public function groups()
    {
        return $this->belongsToMany(
            Group::class,
            'group_supervisor',
            'supervisorId',
            'groupid'
        )->withPivot('status', 'created_at');
    }

    public function meetings()
    {
        return $this->hasMany(Meeting::class, 'supervisor_id', 'supervisorId');
    }


    public function pendingTasks()
    {
        return $this->hasMany(PendingTask::class, 'supervisor_id', 'supervisorId');
    }

    public function pendingTasksCount()
    {
        return $this->pendingTasks()->pending()->count();
    }
}