<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HonorBoardProject;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HonorBoardController extends Controller
{
    // عرض جميع المشاريع المميزة (واجهة الإدارة)
    public function index()
    {
        $projects = HonorBoardProject::with(['project' => function($query) {
                        $query->select('projectid', 'title', 'description');
                    }])
                    ->orderBy('featured_at', 'desc')
                    ->get();
                    
        return view('admin.honor-board.index', compact('projects'));
    }

    // عرض نموذج إضافة مشروع مميز (واجهة الإدارة)
    public function create()
    {
        $regularProjects = Project::doesntHave('honorBoard')
                            ->select('projectid', 'title')
                            ->get();
                            
        return view('admin.honor-board.create', compact('regularProjects'));
    }

    // حفظ مشروع مميز جديد (واجهة الإدارة)
    
    // حذف مشروع مميز (واجهة الإدارة)
    public function destroy($id)
    {
        $honorProject = HonorBoardProject::findOrFail($id);
        $honorProject->delete();

        return back()
                ->with('success', 'تمت إزالة المشروع من لوحة الشرف');
    }

    // API: عرض المشاريع المميزة
    public function indexApi()
    {
        try {
            $projects = HonorBoardProject::with(['project' => function($query) {
                                $query->select('projectid', 'title', 'description');
                            }])
                            ->orderBy('featured_at', 'desc')
                            ->get();
                            
            return response()->json([
                'success' => true,
                'data' => $projects,
                'message' => 'تم جلب المشاريع المميزة بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب البيانات: ' . $e->getMessage()
            ], 500);
        }
    }

    // API: المشاريع المتاحة للإضافة
    public function availableApi()
    {
        $projects = Project::doesntHave('honorBoard')
                        ->select('projectid', 'title', 'description')
                        ->get();
                        
        return response()->json([
            'success' => true,
            'data' => $projects,
            'message' => 'المشاريع المتاحة للإضافة'
        ]);
    }
    public function availableProjects()
{
    return $this->availableApi();
}

    // API: إضافة مشروع مميز
    public function store(Request $request)
{
    $validated = $request->validate([
        'project_id' => [
            'required',
            'integer',
            Rule::exists('projects', 'projectid'),
            Rule::unique('honor_board_project', 'project_id')
        ],
        'notes' => 'nullable|string|max:500'
    ]);

    $honorProject = HonorBoardProject::create([
        'project_id' => $validated['project_id'],
        'featured_at' => now(),
        'notes' => $validated['notes']
    ]);

    return redirect()
            ->route('admin.honor-board.index')
            ->with('success', 'تمت إضافة المشروع إلى لوحة الشرف بنجاح');
}

public function storeApi(Request $request)
{
    $validated = $request->validate([
        'project_id' => [
            'required',
            'integer',
            Rule::exists('projects', 'projectid'),
            Rule::unique('honor_board_project', 'project_id')
        ],
        'notes' => 'nullable|string|max:500'
    ]);

    try {
        $honorProject = HonorBoardProject::create([
            'project_id' => $validated['project_id'],
            'featured_at' => now(),
            'notes' => $validated['notes'] ?? null
        ]);

        return response()->json([
            'success' => true,
            'data' => $honorProject,
            'message' => 'تمت الإضافة إلى لوحة الشرف بنجاح'
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'فشل في إضافة المشروع: ' . $e->getMessage()
        ], 500);
    }
}
    // API: حذف مشروع مميز
    public function destroyApi($id)
    {
        try {
            $honorProject = HonorBoardProject::findOrFail($id);
            $honorProject->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف المشروع بنجاح'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف المشروع: ' . $e->getMessage()
            ], 500);
        }
    }
}