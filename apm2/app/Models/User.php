<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements JWTSubject
{
    use SoftDeletes, Notifiable;
    protected $primaryKey = 'userId';

    protected $fillable = [
        'name',
        'email',
        'phone', 
        'password',
        'role',
        'trashed_at',
        'profile_picture'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'trashed_at' => 'datetime',
    ];

    // في موديل User
    public function student()
    {
        return $this->hasOne(Student::class, 'userId', 'userId');
    }

        public function supervisor()
    {
        return $this->hasOne(Supervisor::class, 'userId', 'userId');
    }
    
        public function coordinator()
    {
        return $this->hasOne(ProjectCoordinator::class, 'userId', 'userId');
    }

    // ✅ تحديد كيفية استرجاع معرف المستخدم
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    // ✅ تحديد أي معلومات إضافية لتضمينها في التوكن (لا توجد معلومات مخصصة في هذه الحالة)
    public function getJWTCustomClaims()
    {
        return [];
    }

    // ✅ وضع المستخدم في سلة المهملات
    public function softDelete()
    {
        $this->trashed_at = now();
        $this->save();
    }

    // ✅ التحقق إذا كان محذوفًا
    public function isTrashed()
    {
        return $this->trashed_at !== null;
    }

    // app/Models/User.php
    public function isSupervisor()
    {
        return $this->role === 'supervisor';
    }

    public function isTeamLeader()
    {
        // إذا كان الطالب قائدًا لمجموعة ما
        if ($this->role === 'student') {
            return $this->student->groups()
                ->wherePivot('is_leader', true)
                ->exists();
        }
        return false;
    }
    // في موديل User.php
    public function isCoordinator()
    {
        return $this->role === 'coordinator';
    }
   
 
}
