<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $primaryKey = 'studentId';
    
    protected $fillable = ['userId','experience', 
    'gpa', 
    'university_number', // أضف هذا
    'major', // أضف هذا
    'academic_year', 'experience_media_type' ];

    protected $casts = [
        'experience' => 'array', // تحويل JSON إلى array تلقائياً
    ];

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

    public function setExperienceAttribute($value)
    {
        if (is_null($value)) {
            $this->attributes['experience'] = null;
            $this->attributes['experience_media_type'] = null;
            return;
        }

        if (is_string($value)) {
            try {
                $decoded = json_decode($value, true);
                $this->attributes['experience'] = is_array($decoded) ? $value : json_encode([[
                    'type' => 'text',
                    'content' => $value
                ]]);
            } catch (\Exception $e) {
                $this->attributes['experience'] = json_encode([[
                    'type' => 'text',
                    'content' => $value
                ]]);
            }
        } elseif (is_array($value)) {
            $this->attributes['experience'] = json_encode($value);
        }

        // تحديد نوع الوسائط
        $this->determineMediaType();
    }

    private function determineMediaType()
    {
        if (empty($this->attributes['experience'])) {
            $this->attributes['experience_media_type'] = null;
            return;
        }

        $experience = json_decode($this->attributes['experience'], true);
        $types = array_column($experience, 'type');
        $uniqueTypes = array_unique($types);

        $this->attributes['experience_media_type'] = count($uniqueTypes) > 1 
            ? 'mixed' 
            : ($uniqueTypes[0] ?? 'text');
    }
}
