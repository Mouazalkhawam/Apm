<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectCoordinator extends Model
{
    use HasFactory;

    protected $primaryKey = 'coordinatorId'; // لتحديد المفتاح الأساسي

    protected $fillable = [
        'userId',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId'); // ربط المستخدم
    }
}
