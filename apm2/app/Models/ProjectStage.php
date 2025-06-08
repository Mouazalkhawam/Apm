<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectStage extends Model
{
    protected $fillable = ['project_id', 'title', 'description', 'due_date', 'order'];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'projectid');
    }

    public function submissions()
    {
        return $this->hasMany(StageSubmission::class);
    }
}
