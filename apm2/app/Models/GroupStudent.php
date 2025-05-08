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
    ];

    public $timestamps = true;
}
