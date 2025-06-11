<?php


namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeerEvaluation extends Model
{
    use HasFactory;

    protected $primaryKey = 'evaluation_id';

    protected $fillable = [
        'evaluator_user_id',
        'evaluated_user_id',
        'group_id',
        'criteria_id',
        'rate'
    ];

    // العلاقة مع المُقيِّم
    public function evaluator()
    {
        return $this->belongsTo(User::class, 'evaluator_user_id', 'userId');
    }

    // العلاقة مع المُقيَّم
    public function evaluated()
    {
        return $this->belongsTo(User::class, 'evaluated_user_id', 'userId');
    }

    // العلاقة مع المجموعة
    public function group()
    {
        return $this->belongsTo(Group::class, 'group_id', 'groupid');
    }

    // العلاقة مع معيار التقييم
    public function criterion()
    {
        return $this->belongsTo(EvaluationCriterion::class, 'criteria_id');
    }
}