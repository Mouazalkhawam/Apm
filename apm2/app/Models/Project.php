<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $primaryKey = 'projectid'; // إذا اسم الـ ID مو "id"

    // Laravel بيفترض أن المفتاح الأساسي auto-increment وهو BigInt
    // فلا داعي لتعريف شيء إضافي هنا

    protected $fillable = [
        'projectid',
        'title',
        'description',
        'startdate',
        'enddate',
        'status',
        'headid'
    ];

    // تأكدي أن اسماء الحقول هون مطابقة تماماً للموديل والمهاجرشن
}
