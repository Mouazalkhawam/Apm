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
    ];
}
