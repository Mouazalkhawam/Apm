<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DiscussionSchedule extends Model
{
    use HasFactory;

    protected $table = 'schedules';
    protected $primaryKey = 'scheduledId';
    protected $fillable = [
        'date', 
        'type',
        'group_id',
        'time',
        'location',
        'notes'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupid');
    }
}