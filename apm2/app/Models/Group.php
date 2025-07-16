<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\GroupSupervisor;
use App\Models\GroupStudent;

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

    public function students()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->withPivot('status', 'is_leader');
    }

    public function supervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->withPivot('status');
    }

    public function groupStudents()
    {
        return $this->hasMany(GroupStudent::class, 'groupid', 'groupid');
    }

    public function groupSupervisors()
    {
        return $this->hasMany(GroupSupervisor::class, 'groupid', 'groupid');
    }
    
    public function peerEvaluations()
    {
        return $this->hasMany(PeerEvaluation::class, 'group_id');
    }

    public function evaluationCriteria()
    {
        return $this->hasMany(EvaluationCriterion::class);
    }
    
    public function approvedStudents()
    {
        return $this->belongsToMany(Student::class, 'group_student', 'groupid', 'studentId')
                    ->wherePivot('status', 'approved')
                    ->withPivot('is_leader')
                    ->with(['user:id,name']);
    }


    public function approvedSupervisors()
    {
        return $this->belongsToMany(Supervisor::class, 'group_supervisor', 'groupid', 'supervisorId')
                    ->wherePivot('status', 'approved')
                    ->withPivot('created_at')
                    ->with('user'); // إضافة تحميل علاقة user مع المشرف
    }
 
    public function proposal()
    {
        return $this->hasOne(ProjectProposal::class, 'group_id', 'groupid');
    }

    // الدوال الجديدة المضافة
    public function isSupervisorApproved($supervisorId)
    {
        return $this->groupSupervisors()
            ->where('supervisorId', $supervisorId)
            ->where('status', 'approved')
            ->exists();
    }

    public function isTeamLeader($studentId)
    {
        return $this->groupStudents()
            ->where('studentId', $studentId)
            ->where('is_leader', true)
            ->exists();
    }

        public function isStudentApproved($studentId)
        {
            return $this->groupStudents()
                ->where('studentId', $studentId)
                ->where('status', 'approved')
                ->exists();
        }

        public function evaluations()
        {
            return $this->hasMany(Evaluation::class, 'groupId', 'groupid');
        }


    public function calculateFinalGrade()
    {
        $evaluations = $this->evaluations()
            ->where('is_final', true)
            ->get();
        
        if ($evaluations->isEmpty()) return null;
        
        $total = $evaluations->sum(function($eval) {
            return $this->calculateEvaluationScore($eval);
        });
        
        return $total / $evaluations->count();
    }

    // دالة معدلة لحساب درجة التقييم
    protected function calculateEvaluationScore(Evaluation $evaluation)
    {
        $weights = $this->getEvaluationWeights($evaluation->stage);
        
        $scores = [
            'problem_definition' => $evaluation->problem_definition * $weights['problem_definition'],
            'theoretical_study' => $evaluation->theoretical_study * $weights['theoretical_study'],
            'reference_study' => $evaluation->reference_study * $weights['reference_study'],
            'analytical_study' => $evaluation->analytical_study * $weights['analytical_study'],
            'class_diagram' => $evaluation->class_diagram * $weights['class_diagram'],
            'erd_diagram' => $evaluation->erd_diagram * $weights['erd_diagram'],
            'front_back_connection' => $this->convertPercentageToScore($evaluation->front_back_connection) * $weights['front_back_connection'],
            'requirements_achievement' => $this->convertPercentageToScore($evaluation->requirements_achievement) * $weights['requirements_achievement'],
            'project_management' => $evaluation->project_management * $weights['project_management'],
            'documentation' => $evaluation->documentation * $weights['documentation'],
            'final_presentation' => $evaluation->final_presentation * $weights['final_presentation'],
        ];
        
        return array_sum($scores);
    }

    // تحديد الأوزان حسب مرحلة التقييم
    protected function getEvaluationWeights($stage)
    {
        return match($stage) {
            'discussion' => [
                'problem_definition' => 0.10,
                'theoretical_study' => 0.10,
                'reference_study' => 0.10,
                'project_management' => 0.05,
                // باقي المعايير تكون 0
            ],
            'analytical' => [
                'analytical_study' => 0.15,
                'class_diagram' => 0.10,
                'erd_diagram' => 0.10,
                'project_management' => 0.05,
                'documentation' => 0.05,
                // باقي المعايير تكون 0
            ],
            'final' => [
                'front_back_connection' => 0.20,
                'requirements_achievement' => 0.10,
                'final_presentation' => 0.10,
                'project_management' => 0.05,
                // باقي المعايير تكون 0
            ],
            default => []
        };
    }
    protected function convertPercentageToScore($percentage)
    {
        if ($percentage >= 70) return 5;
        if ($percentage >= 50) return 4;
        if ($percentage >= 30) return 3;
        return 2;
    }

   
    public function toArray()
{
    return [
        'groupId' => $this->groupId,
        'name' => $this->name,
        'final_grade' => $this->final_grade,
        // لا تقم بتحميل العلاقات هنا لتجنب التكرار
    ];
}
}