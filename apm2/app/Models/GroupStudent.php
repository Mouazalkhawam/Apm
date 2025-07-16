<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GroupStudent extends Pivot
{
    protected $table = 'group_student';

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'studentId',
        'groupid',
        'status',
        'is_leader'
    ];

    public $timestamps = true;

    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId', 'studentId');
    }

    
    public function group()
    {
        return $this->belongsTo(Group::class, 'groupid', 'groupid');
    }

    public function isMember($studentId)
{
    return $this->groupStudents()
        ->where('studentId', $studentId)
        ->exists();
}
}
