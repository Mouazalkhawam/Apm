<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'studentId';
    
    protected $fillable = ['userId','experience', 
    'gpa'];

    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    // المقترحات التي يقودها الطالب
    public function ledProposals()
    {
        return $this->hasMany(ProjectProposal::class, 'leader_id', 'studentId');
    }

    // المقترحات التي يشارك فيها كعضو فريق
    public function teamProposals()
    {
        return $this->belongsToMany(
            ProjectProposal::class,
            'proposal_team_members',
            'student_id',
            'proposal_id'
        )->withTimestamps();
    }

    // علاقة العديد إلى العديد مع المهارات (Skills)
    public function skills()
    {
        return $this->belongsToMany(
            Skill::class,
            'skill_student',
            'student_id',
            'skill_id'
        )->withTimestamps();
    }
    
    public function groups()
    {
        return $this->belongsToMany(
            Group::class,
            'group_student',
            'studentId',
            'groupid'
        )->withPivot('status', 'is_leader', 'created_at', 'updated_at'); // التعديل هنا
    }

    // استبدال دالة isTeamLeader
    public function isTeamLeader($groupId = null)
    {
        $query = $this->groups();
        
        if($groupId){
            $query->where('groupid', $groupId);
        }
        
        return $query->wherePivot('is_leader', true)->exists();
    }
}