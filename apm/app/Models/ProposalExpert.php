<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalExpert extends Model
{
    use HasFactory;

    protected $fillable = [
        'proposal_id',
        'name',
        'specialization',
        'phone'
    ];

    public function proposal()
    {
        return $this->belongsTo(ProjectProposal::class, 'proposal_id');
    }
}