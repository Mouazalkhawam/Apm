<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'group_id',
        'supervisor_id',
        'description',
        'meeting_time',
        'end_time',
        'status'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupid');
    }

    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class, 'supervisor_id', 'supervisorId');
    }

    // دالة للحصول على قائد المجموعة تلقائياً
    public function getLeaderAttribute()
    {
        return $this->group->students()->wherePivot('is_leader', true)->first();
    }
}