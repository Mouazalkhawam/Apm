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

// ... باقي الكود يبقى كما هو ...

    // تحديث المقترح
    public function update(Request $request, $id)
    {
        $proposal = ProjectProposal::findOrFail($id);
        $user = Auth::user();

        if (!$user->student) {
            return response()->json(['message' => 'فقط الطلاب يمكنهم التعديل'], 403);
        }

        if (!$this->checkAccess($proposal)) {
            return response()->json(['message' => 'غير مصرح لك بتعديل هذا المقترح'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'problem_description' => 'sometimes|string',
            'problem_studies' => 'sometimes|string',
            'problem_background' => 'sometimes|string',
            'solution_studies' => 'sometimes|string',
            'proposed_solution' => 'sometimes|string',
            'platform' => 'nullable|string|max:255',
            'tools' => 'sometimes|json',
            'programming_languages' => 'sometimes|json',
            'database' => 'nullable|string|max:255',
            'packages' => 'nullable|string',
            'management_plan' => 'sometimes|string',
            'team_roles' => 'sometimes|string',
            'functional_requirements' => 'sometimes|json',
            'non_functional_requirements' => 'sometimes|json',
            'technology_stack' => 'nullable|json',
            'problem_mindmap' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
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
            if ($request->hasFile('problem_mindmap')) {
                if ($proposal->problem_mindmap_path) {
                    Storage::disk('public')->delete($proposal->problem_mindmap_path);
                }
                $data['problem_mindmap_path'] = $request->file('problem_mindmap')->store('mindmaps', 'public');
            }

            $proposal->update($data);

            if (isset($data['experts'])) {
                $proposal->experts()->delete();
                foreach ($data['experts'] as $expert) {
                    $proposal->experts()->create([
                        'name' => $expert['name'],
                        'phone' => $expert['phone'] ?? null,
                        'specialization' => $expert['specialization'] ?? null,
                    ]);
                }
            }

            return response()->json([
                'message' => 'تم تحديث المقترح بنجاح',
                'data' => $this->formatProposalResponse($proposal)
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Failed to update proposal: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث المقترح'
            ], 500);
        }
    }

    // حذف المقترح
    public function destroy($id)
    {
        $proposal = ProjectProposal::findOrFail($id);
        $user = Auth::user();

        if (!$user->student || !$user->student->isTeamLeader($proposal->group_id)) {
            return response()->json(['message' => 'فقط قائد المجموعة يمكنه الحذف'], 403);
        }

        try {
            if ($proposal->problem_mindmap_path) {
                Storage::disk('public')->delete($proposal->problem_mindmap_path);
            }

            $proposal->delete();

            return response()->json([
                'message' => 'تم حذف المقترح بنجاح'
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            Log::error('Failed to delete proposal: ' . $e->getMessage());
            return response()->json([
                'message' => 'حدث خطأ أثناء حذف المقترح'
            ], 500);
        }
    }

    // ============ الدوال المساعدة ============

    private function checkAccess(ProjectProposal $proposal)
    {
        $user = Auth::user();
        $groupId = $proposal->group_id;

        if ($user->student) {
            return GroupStudent::where('studentId', $user->student->studentId)
                ->where('groupid', $groupId)
                ->where('status', 'approved')
                ->exists();
        }
        
        if ($user->supervisor) {
            return GroupSupervisor::where('supervisorId', $user->supervisor->supervisorId)
                ->where('groupid', $groupId)
                ->where('status', 'approved')
                ->exists();
        }

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