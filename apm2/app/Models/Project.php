<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $primaryKey = 'projectid'; // تعريف المفتاح الأساسي المخصص

    public $incrementing = true; // تأكيد أنه auto-increment
    protected $keyType = 'int'; // نوع المفتاح الأساسي

    protected $fillable = [
        'title', // تم إزالة projectid من هنا لأنه auto-increment
        'description',
        'startdate',
        'enddate',
        'status',
        'headid'
    ];

    // العلاقة مع جدول لوحة الشرف
    public function honorBoard()
    {
        return $this->hasOne(HonorBoardProject::class, 'project_id', 'projectid');
    }

    // العلاقة مع المستخدم (رئيس المشروع)
    public function head()
    {
        return $this->belongsTo(User::class, 'headid', 'userId');
    }
}