<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class PendingTask extends Model
{
    protected $fillable = [
        'type',
        'related_id',
        'related_type',
        'supervisor_id',
        'coordinator_id',
        'status',
        'notes',
        'group_id',
        'task_id',
        'stage_id',
        'resource_id',
        'proposal_id'
    ];

    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class, 'supervisor_id', 'supervisorId');
    }

    public function coordinator()
    {
        return $this->belongsTo(ProjectCoordinator::class, 'coordinator_id', 'coordinatorId');
    }

    public function related()
    {
        return $this->morphTo();
    }

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupId');
    }

    public function task()
    {
        return $this->belongsTo(Task::class, 'task_id');
    }

    public function stage()
    {
        return $this->belongsTo(Stage::class, 'stage_id');
    }

    public function resource()
    {
        return $this->belongsTo(Resource::class, 'resource_id', 'resourceId');
    }

    public function proposal()
    {
        return $this->belongsTo(ProjectProposal::class, 'proposal_id', 'proposalId');
    }

    // Scopes
    public function scopePending(Builder $query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForSupervisor(Builder $query, $supervisorId)
    {
        return $query->where('supervisor_id', $supervisorId);
    }

    public function scopeForCoordinator(Builder $query, $coordinatorId)
    {
        return $query->where('coordinator_id', $coordinatorId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeForGroup($query, $groupId)
    {
        return $query->where('group_id', $groupId);
    }

    public function submission()
    {
        return $this->belongsTo(TaskSubmission::class, 'related_id')
            ->where('related_type', TaskSubmission::class);
    }

    public function scopeForStageEvaluation(Builder $query, $stageId)
    {
        return $query->where('type', 'stage_evaluation')
                    ->where('stage_id', $stageId);
    }

    public function stageSubmission()
    {
        return $this->belongsTo(StageSubmission::class, 'related_id')
            ->where('related_type', StageSubmission::class);
    }
}