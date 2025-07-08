<?php

namespace App\Http\Controllers;

use App\Models\Supervisor;
use Illuminate\Http\Request;

class SupervisorController extends Controller
{
    // دالة لحساب المشاريع النشطة لمشرف معين
    public function countActiveProjects($supervisorId)
    {
        $supervisor = Supervisor::findOrFail($supervisorId);
        
        $activeProjectsCount = $supervisor->groups()
            ->wherePivot('status', 'approved')
            ->whereHas('project', function($query) {
                $query->where('status', '!=', 'completed');
            })
            ->count();
            
        return response()->json([
            'supervisor_id' => $supervisorId,
            'active_projects_count' => $activeProjectsCount
        ]);
    }
}