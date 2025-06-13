<?php

namespace App\Http\Controllers;

use App\Models\ProjectProposal;
use App\Models\Group;
use App\Models\GroupStudent;
use App\Models\GroupSupervisor;
use App\Models\Student;
use App\Models\Supervisor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;


class ProjectProposalController extends Controller
{
    // إنشاء مقترح جديد - واجهة
    public function create()
    {
        $user = Auth::user();
        
        if (!$user->student) {
            return response()->json(['message' => 'يجب أن تكون طالباً لإنشاء مقترح'], 403);
        }

        $group = $user->student->groups()->where('status', 'approved')->first();
        
        if (!$group) {
            return response()->json(['message' => 'يجب أن تكون عضوًا في مجموعة معتمدة'], 403);
        }

        return response()->json([
            'group' => $group,
            'group_members' => $group->students()->where('userId', '!=', $user->id)->get(),
            'supervisors' => $group->supervisors
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    // حفظ المقترح الجديد
    public function store(Request $request)
    {
        $user = Auth::user();
        
        if (!$user->student) {
            return response()->json(['message' => 'يجب أن تكون طالباً لإنشاء مقترح'], 403);
        }

        $group = $user->student->groups()->where('status', 'approved')->first();
        
        if (!$group) {
            return response()->json(['message' => 'يجب أن تكون عضوًا في مجموعة معتمدة'], 403);
        }

        $validator = Validator::make($request->all(), [
            'project_type' => 'required|in:term-project,grad-project',
            'title' => 'required|string|max:255',
            'problem_description' => 'required|string',
            'problem_studies' => 'required|string',
            'problem_background' => 'required|string',
            'solution_studies' => 'required|string',
            'proposed_solution' => 'required|string',
            'platform' => 'nullable|string|max:255',
            'tools' => 'required|json',
            'programming_languages' => 'required|json',
            'database' => 'nullable|string|max:255',
            'packages' => 'nullable|string',
            'management_plan' => 'required|string',
            'team_roles' => 'required|string',
            'functional_requirements' => 'required|json',
            'non_functional_requirements' => 'required|json',
            'technology_stack' => 'nullable|json',
            'problem_mindmap' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'experts' => 'nullable|array',
            'experts.*.name' => 'required|string',
            'experts.*.phone' => 'nullable|string',
            'experts.*.specialization' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();
        $arrayFields = [
            'tools',
            'programming_languages',
            'functional_requirements',
            'non_functional_requirements',
            'technology_stack'
        ];

        foreach ($arrayFields as $field) {
            if (!empty($data[$field])) {
                $data[$field] = json_decode($data[$field], true);
            }
        }

        try {
            $mindmapPath = null;
            if ($request->hasFile('problem_mindmap')) {
                $mindmapPath = $request->file('problem_mindmap')->store('mindmaps', 'public');
            }

            $proposal = ProjectProposal::create([
                'group_id' => $group->groupid,
                'project_type' => $data['project_type'],
                'title' => $data['title'],
                'problem_description' => $data['problem_description'],
                'problem_studies' => $data['problem_studies'],
                'problem_background' => $data['problem_background'],
                'solution_studies' => $data['solution_studies'],
                'proposed_solution' => $data['proposed_solution'],
                'platform' => $data['platform'] ?? null,
                'tools' => $data['tools'],
                'programming_languages' => $data['programming_languages'],
                'database' => $data['database'] ?? null,
                'packages' => $data['packages'] ?? null,
                'management_plan' => $data['management_plan'],
                'team_roles' => $data['team_roles'],
                'functional_requirements' => $data['functional_requirements'],
                'non_functional_requirements' => $data['non_functional_requirements'],
                'technology_stack' => $data['technology_stack'] ?? null,
                'problem_mindmap_path' => $mindmapPath,
                'methodology' => 'Agile'
            ]);

            if (!empty($data['experts'])) {
                foreach ($data['experts'] as $expert) {
                    $proposal->experts()->create([
                        'name' => $expert['name'],
                        'phone' => $expert['phone'] ?? null,
                        'specialization' => $expert['specialization'] ?? null,
                    ]);
                }
            }

            return response()->json([
                'message' => 'تم إنشاء المقترح بنجاح',
                'data' => $this->formatProposalResponse($proposal)
            ], 201, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Failed to create proposal: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء إنشاء المقترح'
            ], 500);
        }
    }

 
public function showByGroup($groupid)
{
    $proposal = ProjectProposal::with(['experts', 'group.students', 'group.supervisors'])
        ->where('group_id', $groupid)
        ->first();

    if (!$proposal) {
        return response()->json(['message' => 'No proposal found for this group'], 404);
    }

    // تحقق من أن المستخدم عضو في المجموعة
    $user = Auth::user();
    $isMember = false;

    if ($user->student) {
        $isMember = GroupStudent::where('studentId', $user->student->studentId)
            ->where('groupid', $groupid)
            ->where('status', 'approved')
            ->exists();
    } 
    elseif ($user->supervisor) {
        $isMember = GroupSupervisor::where('supervisorId', $user->supervisor->supervisorId)
            ->where('groupid', $groupid)
            ->where('status', 'approved')
            ->exists();
    }

    if (!$isMember) {
        return response()->json(['message' => 'Unauthorized'], 403);
    }

    return response()->json($this->formatProposalResponse($proposal));
}


public function update(Request $request, $group_id)
{
    // 1. التحقق من المصادقة
    $user = Auth::user();
    if (!$user) {
        return response()->json(['message' => 'غير مصرح بالوصول، يرجى تسجيل الدخول'], 401);
    }

    // 2. البحث عن المقترح
    $proposal = ProjectProposal::with(['experts'])->where('group_id', $group_id)->first();
    if (!$proposal) {
        return response()->json(['message' => 'لا يوجد مقترح مرتبط بهذه المجموعة'], 404);
    }

    // 3. التحقق من الصلاحيات
    $isAuthorized = false;
    if ($user->student) {
        $isAuthorized = GroupStudent::where('studentId', $user->student->studentId)
            ->where('groupid', $group_id)
            ->where('status', 'approved')
            ->exists();
    } elseif ($user->supervisor) {
        $isAuthorized = GroupSupervisor::where('supervisorId', $user->supervisor->supervisorId)
            ->where('groupid', $group_id)
            ->where('status', 'approved')
            ->exists();
    }

    if (!$isAuthorized) {
        return response()->json(['message' => 'ليست لديك صلاحية تعديل هذا المقترح'], 403);
    }

    // 4. التحقق من صحة البيانات
    $validator = Validator::make($request->all(), [
        'project_type' => 'sometimes|in:term-project,grad-project',
        'title' => 'sometimes|string|max:255',
        'problem_description' => 'sometimes|string',
        'problem_studies' => 'sometimes|string',
        'problem_background' => 'sometimes|string',
        'solution_studies' => 'sometimes|string',
        'proposed_solution' => 'sometimes|string',
        'platform' => 'nullable|string|max:255',
        'tools' => 'sometimes|array',
        'programming_languages' => 'sometimes|array',
        'database' => 'nullable|string|max:255',
        'packages' => 'nullable|string',
        'management_plan' => 'sometimes|string',
        'team_roles' => 'sometimes|string',
        'functional_requirements' => 'sometimes|array',
        'non_functional_requirements' => 'sometimes|array',
        'technology_stack' => 'nullable|array',
        'problem_mindmap' => 'nullable|file|mimes:jpg,jpeg,png,pdf,xmind|max:2048',
        'experts' => 'nullable|array',
        'experts.*.name' => 'required_with:experts|string',
        'experts.*.phone' => 'nullable|string',
        'experts.*.specialization' => 'nullable|string'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'خطأ في البيانات المدخلة',
            'errors' => $validator->errors()
        ], 422);
    }

    DB::beginTransaction();
    try {
        // 5. معالجة ملف الخريطة الذهنية
        if ($request->hasFile('problem_mindmap')) {
            // حذف الملف القديم إذا كان موجودًا
            if ($proposal->problem_mindmap_path) {
                Storage::disk('public')->delete($proposal->problem_mindmap_path);
            }
            
            // حفظ الملف الجديد
            $file = $request->file('problem_mindmap');
            $filename = 'mindmap_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('mindmaps', $filename, 'public');
            
            $proposal->problem_mindmap_path = $path;
        }

        // 6. تحديث البيانات الأساسية
        $data = $request->except(['experts', 'problem_mindmap']);
        $proposal->update($data);

        // 7. معالجة الخبراء
        if ($request->has('experts')) {
            $proposal->experts()->delete(); // حذف الخبراء الحاليين
            
            foreach ($request->input('experts') as $expert) {
                $proposal->experts()->create([
                    'name' => $expert['name'],
                    'phone' => $expert['phone'] ?? null,
                    'specialization' => $expert['specialization'] ?? null,
                ]);
            }
        }

        DB::commit();

        return response()->json([
            'message' => 'تم تحديث المقترح بنجاح',
            'data' => $this->formatProposalResponse($proposal)
        ], 200, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('فشل في تحديث المقترح: ' . $e->getMessage());
        return response()->json([
            'message' => 'حدث خطأ أثناء تحديث المقترح',
            'error' => $e->getMessage()
        ], 500);
    }
}

    // ============ الدوال المساعدة ============

    private function checkAccess(ProjectProposal $proposal)
    {
            $user = Auth::user();
            
            if (!$user) {
                Log::error('No authenticated user');
                return false;
            }
        
            Log::info('Checking access for proposal:', [
                'proposal_id' => $proposal->proposalId,
                'group_id' => $proposal->group_id,
                'has_group' => !is_null($proposal->group_id)
            ]);
        
            // إذا كان group_id فارغاً
            if (is_null($proposal->group_id)) {
                Log::error('Proposal has no group assigned');
                return false;
            }
        
            if ($user->student) {
                $isMember = GroupStudent::where('studentId', $user->student->studentId)
                    ->where('groupid', $proposal->group_id)
                    ->where('status', 'approved')
                    ->exists();
                
                Log::info('Student check:', [
                    'studentId' => $user->student->studentId ?? null,
                    'group_id' => $proposal->group_id,
                    'exists' => $isMember
                ]);
                return $isMember;
            }
            
        
        if ($user->supervisor) {
            $isSupervisor = GroupSupervisor::where('supervisorId', $user->supervisor->supervisorId)
                ->where('groupid', $proposal->group_id)
                ->where('status', 'approved')
                ->exists();
            
            Log::info('Supervisor check:', [
                'supervisorId' => $user->supervisor->supervisorId ?? null,
                'exists' => $isSupervisor
            ]);
            return $isSupervisor;
        }

        Log::info('User is neither student nor supervisor');
        return false;
    }
    private function formatProposalResponse(ProjectProposal $proposal)
    {
        return [
            'id' => $proposal->proposalId,
            'title' => $proposal->title,
            'project_type' => $proposal->project_type,
            'project_type_name' => $proposal->project_type_name,
            'problem_description' => $proposal->problem_description,
            'problem_studies' => $proposal->problem_studies,
            'problem_background' => $proposal->problem_background,
            'solution_studies' => $proposal->solution_studies,
            'proposed_solution' => $proposal->proposed_solution,
            'platform' => $proposal->platform,
            'tools' => $proposal->tools,
            'programming_languages' => $proposal->programming_languages,
            'database' => $proposal->database,
            'packages' => $proposal->packages,
            'management_plan' => $proposal->management_plan,
            'team_roles' => $proposal->team_roles,
            'functional_requirements' => $proposal->functional_requirements,
            'non_functional_requirements' => $proposal->non_functional_requirements,
            'technology_stack' => $proposal->technology_stack,
            'methodology' => $proposal->methodology,
            'mindmap_url' => $proposal->problem_mindmap_path ? 
                url('storage/' . $proposal->problem_mindmap_path) : null,
            'group' => [
                'id' => $proposal->group->groupid,
                'name' => $proposal->group->name,
                'students' => $proposal->group->students,
                'supervisors' => $proposal->group->supervisors
            ],
            'experts' => $proposal->experts,
            'created_at' => $proposal->created_at,
            'updated_at' => $proposal->updated_at
        ];
    }
}