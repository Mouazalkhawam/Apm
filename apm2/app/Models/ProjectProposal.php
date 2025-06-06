<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectProposal extends Model
{
    use HasFactory;

    protected $primaryKey = 'proposalId';

    protected $fillable = [
        'group_id',
        'project_type',
        'title',
        'problem_description',
        'problem_studies',
        'problem_background',
        'solution_studies',
        'proposed_solution',
        'platform',
        'tools',
        'programming_languages',
        'database',
        'packages',
        'management_plan',
        'team_roles',
        'methodology',
        'functional_requirements',
        'non_functional_requirements',
        'technology_stack',
        'problem_mindmap_path'
    ];

    protected $casts = [
        'technology_stack' => 'array',
        'functional_requirements' => 'array',
        'non_functional_requirements' => 'array',
        'tools' => 'array',
        'programming_languages' => 'array'
    ];

    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupid');
    }

    public function teamMembers()
    {
        return $this->belongsToMany(
            Student::class,
            'proposal_team_members',
            'proposal_id',
            'student_id'
        )->withTimestamps();
    }

    public function supervisors()
    {
        return $this->belongsToMany(
            Supervisor::class,
            'proposal_supervisors',
            'proposal_id',
            'supervisor_id'
        )->withTimestamps();
    }

    public function experts()
    {
        return $this->hasMany(ProposalExpert::class, 'proposal_id');
    }

    public function getProjectTypeNameAttribute()
    {
        return [
            'term-project' => 'مشروع فصلي',
            'grad-project' => 'مشروع تخرج'
        ][$this->project_type] ?? 'غير محدد';
    }

    public function isGraduationProject()
    {
        return $this->project_type === 'grad-project';
    }
}