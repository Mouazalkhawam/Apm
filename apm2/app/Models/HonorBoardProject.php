<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HonorBoardProject extends Model
{
    protected $table = 'honor_board_project';
    
    protected $fillable = [
        'project_id',
        'featured_at',
        'notes'
    ];

    protected $casts = [
        'featured_at' => 'datetime',
    ];

    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'projectid');
    }
}