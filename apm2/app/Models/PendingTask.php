<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PendingTask extends Model
{
    protected $fillable = [
        'type',
        'related_id',
        'related_type',
        'supervisor_id',
        'status',
        'notes'
    ];

    // علاقة مع المشرف
    public function supervisor()
    {
        return $this->belongsTo(Supervisor::class, 'supervisor_id', 'supervisorId');
    }

    // علاقة متعددة الأشكال مع العنصر المرتبط
    public function related()
    {
        return $this->morphTo();
    }

    // نطاقات الاستعلام
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeForSupervisor($query, $supervisorId)
    {
        return $query->where('supervisor_id', $supervisorId);
    }

    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}