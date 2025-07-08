<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HonorBoardProject extends Model
{
    protected $table = 'honor_board_project'; // تحديد اسم الجدول بدون s
    
    protected $fillable = [
        'project_id', // يجب أن يكون نفس اسم الحقل في الجدول
        'notes',
        'featured_at'
    ];
    
    public function project()
    {
        return $this->belongsTo(Project::class, 'project_id', 'projectid');
    }
    
}