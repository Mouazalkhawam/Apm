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

        // توزيع حسب الحالة
        $projectsByStatus = Project::groupBy('status')
            ->selectRaw('status, COUNT(*) as count')
            ->pluck('count', 'status');

        // المشاريع حسب الأشهر
        $monthlyProjects = Project::selectRaw('MONTH(created_at) as month, COUNT(*) as count')
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('count', 'month');

        return response()->json([
            'totalProjects' => $totalProjects,
            'completedProjects' => $completedProjects,
            'completionPercentage' => $completionPercentage,
            'projectsByStatus' => $projectsByStatus,
            'monthlyProjects' => $monthlyProjects,
        ]);
    }
}
