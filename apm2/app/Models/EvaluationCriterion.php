<?php

namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationCriterion extends Model
{
    use HasFactory;

    protected $primaryKey = 'criteria_id';
    
    protected $fillable = [
        'title',
        'description'
    ];

    public function evaluations()
    {
        return $this->hasMany(PeerEvaluation::class, 'criteria_id');
    }
}