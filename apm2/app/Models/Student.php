<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'studentId';
    
    protected $fillable = ['userId'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    // المقترحات التي يقودها الطالب
    public function ledProposals()
    {
        return $this->hasMany(ProjectProposal::class, 'leader_id');
    }

    // المقترحات التي يشارك فيها كعضو فريق
    public function teamProposals()
    {
        return $this->belongsToMany(ProjectProposal::class, 'proposal_team_members', 'student_id', 'proposal_id');
    }

    // علاقة العديد إلى العديد مع المهارات (Skills)
    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'skill_student', 'student_id', 'skill_id');
    }
    
    public function groups()
    {
        return $this->belongsToMany(Group::class, 'group_student', 'studentId', 'groupid')
                    ->withPivot('status', 'updated_at');
    }
    public function groupMemberships()
    {
        return $this->hasMany(GroupStudent::class, 'studentId', 'studentId');
    }

}
