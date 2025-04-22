<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectProposal extends Model
{
    use HasFactory;

    protected $primaryKey = 'proposalId';

    protected $fillable = [
        'leader_id',
        'title',
        'problem_statement',
        'problem_background',
        'problem_mindmap_path',
        'proposed_solution',
        'methodology',
        'technology_stack',
        'functional_requirements', 
        'non_functional_requirements'
    ];

    protected $casts = [
        'technology_stack' => 'array'
    ];

    // علاقة مع قائد الفريق (طالب)
    public function leader()
    {
        return $this->belongsTo(Student::class, 'leader_id');
    }

    // علاقة مع أعضاء الفريق (طلاب)
    public function teamMembers()
    {
        return $this->belongsToMany(Student::class, 'proposal_team_members', 'proposal_id', 'student_id');
    }

    // علاقة مع المشرفين
    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'proposal_supervisors', 'proposal_id', 'supervisor_id');
    }

    // علاقة مع الخبراء
    public function experts()
    {
        return $this->hasMany(ProposalExpert::class, 'proposal_id');
    }
}