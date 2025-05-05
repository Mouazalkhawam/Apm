<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Tymon\JWTAuth\Contracts\JWTSubject;
use Illuminate\Database\Eloquent\SoftDeletes;

class User extends Authenticatable implements JWTSubject
{
    use SoftDeletes;
    protected $primaryKey = 'userId';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'trashed_at',
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
    // أضف هذه الدوال إلى نموذج User
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }
}
