<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StageSubmission extends Model
{
    protected $fillable = ['project_stage_id', 'submitted_at', 'status', 'grade', 'reviewed_by', 'notes'];

    public function stage()
    {
        return $this->belongsTo(ProjectStage::class, 'project_stage_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by', 'userId');
    }
}
