<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Group extends Model
{
    use HasFactory;

    protected $primaryKey = 'groupId';
    protected $fillable = [
        'projectid',
        'name',
        'final_grade'
    ];

    // العلاقة مع المشروع
    public function project()
    {
        return $this->belongsTo(Project::class, 'projectid', 'projectid');
    }

    // العلاقة مع الطلاب عبر جدول group_student
    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->withPivot(['status', 'is_leader']);
    }

    // العلاقة مع المشرفين عبر جدول group_supervisor
    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->withPivot(['status', 'created_at']);
    }

    // العلاقة مع تقييمات الأقران
    public function peerEvaluations()
    {
        return $this->hasMany(PeerEvaluation::class, 'group_id');
    }

    // العلاقة مع معايير التقييم
    public function evaluationCriteria()
    {
        return $this->hasMany(EvaluationCriterion::class);
    }

    // العلاقة مع التقييمات
    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'groupId', 'groupid');
    }

    // العلاقة مع مقترح المشروع
    public function proposal()
    {
        return $this->hasOne(ProjectProposal::class, 'group_id', 'groupid');
    }

    // العلاقة مع الطلاب المعتمدين فقط
    public function approvedStudents()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->wherePivot('status', 'approved')
                    ->withPivot('is_leader')
                    ->with(['user:id,name']);
    }

    // العلاقة مع المشرفين المعتمدين فقط
    public function approvedSupervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->wherePivot('status', 'approved')
                    ->withPivot('created_at')
                    ->with(['user:id,name']);
    }

    // العلاقة مع جدول group_student (كـ hasMany)
    public function groupStudents()
    {
        return $this->hasMany(GroupStudent::class, 'groupid', 'groupid');
    }

    // العلاقة مع جدول group_supervisor (كـ hasMany)
    public function groupSupervisors()
    {
        return $this->hasMany(GroupSupervisor::class, 'groupid', 'groupid');
    }

    // التحقق من أن المشرف معتمد
    public function isSupervisorApproved($supervisorId)
    {
        return $this->groupSupervisors()
                   ->where('supervisorId', $supervisorId)
                   ->where('status', 'approved')
                   ->exists();
    }

    // التحقق من أن الطالب هو قائد الفريق
    public function isTeamLeader($studentId)
    {
        return $this->groupStudents()
                   ->where('studentId', $studentId)
                   ->where('is_leader', true)
                   ->exists();
    }

    // التحقق من أن الطالب معتمد
    public function isStudentApproved($studentId)
    {
        return $this->groupStudents()
                   ->where('studentId', $studentId)
                   ->where('status', 'approved')
                   ->exists();
    }

    // دالة لحساب العلامة النهائية للمجموعة
    public function calculateFinalGrade()
    {
        $stages = [
            'discussion' => ['weight' => 0.3, 'grade' => $this->discussion_grade ?? 0],
            'analytical' => ['weight' => 0.4, 'grade' => $this->analytical_grade ?? 0],
            'final' => ['weight' => 0.3, 'grade' => $this->final_grade ?? 0]
        ];

        $total = 0;
        foreach ($stages as $stage) {
            $total += $stage['grade'] * $stage['weight'];
        }

        $this->update(['final_grade' => $total]);
        return $total;
    }


    public function evaluatedStudents()
{
    return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
        ->withPivot([
            'discussion_individual_grade',
            'analytical_individual_grade',
            'final_individual_grade'
        ])
        ->wherePivot('status', 'approved')
        ->with(['evaluations' => function($query) {
            $query->where('is_final', true)
                  ->orderBy('created_at', 'desc');
        }]);
}
}