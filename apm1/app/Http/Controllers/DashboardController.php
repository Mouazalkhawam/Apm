<?php

namespace App\Http\Controllers;

use App\Models\Project;

class DashboardController extends Controller
{
    public function index()
    {
        $totalProjects = Project::count();
        $completedProjects = Project::where('status', 'completed')->count();
        $completionPercentage = $totalProjects > 0 ? round(($completedProjects / $totalProjects) * 100) : 0;

        // بيانات للرسوم البيانية
        $projectsByStatus = Project::groupBy('status')
            ->selectRaw('status, count(*) as count')
            ->pluck('count', 'status');

        $monthlyProjects = Project::selectRaw('MONTH(created_at) as month, count(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return view('dashboard', compact(
            'totalProjects',
            'completedProjects',
            'completionPercentage',
            'projectsByStatus',
            'monthlyProjects'
        ));
    }
}