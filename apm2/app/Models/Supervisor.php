<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supervisor extends Model
{
    use HasFactory;

    protected $primaryKey = 'supervisorId';
    
    protected $fillable = ['userId'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    // المقترحات التي يشرف عليها
    public function proposals()
    {
        return $this->belongsToMany(ProjectProposal::class, 'proposal_supervisors', 'supervisor_id', 'proposal_id');
    }
}