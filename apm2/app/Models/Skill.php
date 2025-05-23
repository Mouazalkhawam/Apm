<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    // علاقة كثير إلى كثير مع الطلاب
    public function students()
    {
        return $this->belongsToMany(Student::class, 'skill_student', 'skill_id', 'student_id');
    }
}
