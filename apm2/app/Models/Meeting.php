<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = [
        'group_id',
        'leader_id',
        'supervisor_id',
        'description',
        'meeting_time',
        'status'
    ];

    // تحديث العلاقات لتستخدم أسماء الحقول الصحيحة
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupid');
    }

    public function leader()
    {
        return $this->belongsTo(Student::class, 'leader_id', 'studentId');
    }

    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class, 'supervisor_id', 'supervisorId');
    }
}