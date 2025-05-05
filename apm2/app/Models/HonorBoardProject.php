<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $primaryKey = 'projectid'; // تحديد المفتاح الأساسي
    public $incrementing = true; // تأكيد أنه تلقائي الزيادة
    protected $keyType = 'int'; // نوع المفتاح

    protected $fillable = [
        'projectid',
        'title',
        'description',
        'startdate',
        'enddate',
        'status',
        'headid'
    ];

    public function honorBoard()
    {
        return $this->hasOne(HonorBoardProject::class, 'project_id', 'projectid');
    }
}