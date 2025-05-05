<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $primaryKey = 'projectid';

    protected $fillable = [
        'title',
        'description',
        'startdate',
        'enddate',
        'status',
        'headid'
    ];

    // قائد الفريق (الطالب المسؤول عن المشروع)
    public function leader()
    {
        return $this->belongsTo(User::class, 'headid', 'userId');
    }

    // علاقة المشروع مع الفريق
    public function group()
    {
        return $this->hasOne(Group::class, 'project_id', 'projectid');
    }

    // المشرفين المقترحين (بانتظار الموافقة)
    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'project_supervisor')
                    ->withPivot('status') // pending, approved, rejected
                    ->withTimestamps();
    }

    // الطلاب المقترحين (بانتظار الموافقة)
    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'project_id', 'student_id')
                    ->withPivot('status') // pending, approved, rejected
                    ->withTimestamps();
    }
}
