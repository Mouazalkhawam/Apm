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

    
    public function isSubmitted()
    {
        return $this->submissions()->exists();
    }

    /**
     * هل المرحلة مقيمة؟ (لديها submission مع status = reviewed)
     */
    public function isReviewed()
    {
        return $this->submissions()
            ->where('status', 'reviewed')
            ->exists();
    }

    /**
     * هل المرحلة مكتملة؟ (لديها submission مع status = reviewed و grade)
     */
    public function isCompleted()
    {
        return $this->submissions()
            ->where('status', 'reviewed')
            ->whereNotNull('grade')
            ->exists();
    }

    /**
     * الحصول على درجة المرحلة (إذا كانت مقيمة)
     */
    public function getGrade()
    {
        return $this->submissions()
            ->where('status', 'reviewed')
            ->value('grade');
    }   
}
