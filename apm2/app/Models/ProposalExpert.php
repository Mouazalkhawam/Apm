<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProposalExpert extends Model
{
    use HasFactory;

    protected $primaryKey = 'expert_id';
    protected $fillable = [
        'proposal_id',
        'name',
        'phone',
        'specialization'
    ];

    public function proposal()
    {
        return $this->belongsTo(ProjectProposal::class, 'proposal_id', 'proposalId');
    }
}