<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'projectid',
        'name'
    ];

    // العلاقة مع المشروع
    public function project()
    {
        return $this->belongsTo(Project::class, 'projectid', 'projectid');
    }

    // العلاقة مع الطلاب
    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->withPivot('status')
                    ->withTimestamps();
    }

    // العلاقة مع المشرفين
    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->withPivot('status')
                    ->withTimestamps();
    }
}