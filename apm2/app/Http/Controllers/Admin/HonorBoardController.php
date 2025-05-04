<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HonorBoardProject;
use App\Models\Project;
use Illuminate\Http\Request;

class HonorBoardController extends Controller
{
    public function index()
    {
        $projects = HonorBoardProject::with('project')
                    ->orderBy('featured_at', 'desc')
                    ->get();
                    
        return view('admin.honor-board.index', compact('projects'));
    }

    public function create()
    {
        $regularProjects = Project::doesntHave('honorBoard')->get();
        return view('admin.honor-board.create', compact('regularProjects'));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id|unique:honor_board_projects,project_id',
            'notes' => 'nullable|string|max:500'
        ]);

        HonorBoardProject::create([
            'project_id' => $validated['project_id'],
            'featured_at' => now(),
            'notes' => $validated['notes'] ?? null
        ]);

        return redirect()->route('admin.honor-board.index')
                         ->with('success', 'تمت إضافة المشروع إلى لوحة الشرف بنجاح');
    }

    public function destroy($id)
    {
        $honorProject = HonorBoardProject::findOrFail($id);
        $honorProject->delete();

        return back()->with('success', 'تمت إزالة المشروع من لوحة الشرف');
    }
}