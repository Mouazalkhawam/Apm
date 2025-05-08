<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class GroupSupervisor extends Pivot
{
    protected $table = 'group_supervisor';

    protected $primaryKey = null;
    public $incrementing = false;

    protected $fillable = [
        'supervisorId',
        'groupid',
        'status',
    ];

    public $timestamps = true;
}
