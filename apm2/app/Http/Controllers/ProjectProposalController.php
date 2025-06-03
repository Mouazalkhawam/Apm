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

class ProjectProposalController extends Controller
{
    /**
     * عرض نموذج إنشاء مقترح جديد
     */
    public function create()
    {
        $user = Auth::user();
        $student = $user->student;
        
        if (!$student) {
            return response()->json(['message' => 'يجب أن تكون طالباً لإنشاء مقترح'], 403);
        }

        // التحقق من أن الطالب عضو في مجموعة معتمدة
        $group = $student->groups()->where('status', 'approved')->first();
        
        if (!$group) {
            return response()->json(['message' => 'يجب أن تكون عضوًا في مجموعة معتمدة لإنشاء مقترح'], 403);
        }

        // جلب أعضاء المجموعة الآخرين
        $groupMembers = $group->students()->where('students.userId', '!=', $user->id)->get();

        return response()->json([
            'group' => $group,
            'group_members' => $groupMembers,
            'supervisors' => $group->supervisors
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * حفظ المقترح الجديد
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        $student = $user->student;

        if (!$student) {
            return response()->json(['message' => 'يجب أن تكون طالباً لإنشاء مقترح'], 403);
        }

        // التحقق من أن الطالب عضو في مجموعة معتمدة
        $group = $student->groups()->where('status', 'approved')->first();
        
        if (!$group) {
            return response()->json(['message' => 'يجب أن تكون عضوًا في مجموعة معتمدة لإنشاء مقترح'], 403);
        }

        $validated = $this->validateRequest($request);
        $mindmapPath = $this->handleFileUpload($request);

        $proposalData = [
            'group_id' => $group->groupid,
            'title' => $validated['title'],
            'problem_mindmap_path' => $mindmapPath,
            'problem_statement' => $validated['problem_statement'],
            'problem_background' => $validated['problem_background'],
            'proposed_solution' => $validated['proposed_solution'],
            'functional_requirements' => $validated['functional_requirements'],
            'non_functional_requirements' => $validated['non_functional_requirements'],
            'methodology' => 'Agile',
            'technology_stack' => $validated['tech_stack'] ?? [],
        ];

        $proposal = ProjectProposal::create($proposalData);
        $this->attachRelations($proposal, $request, $group);

        return response()->json([
            'message' => 'تم تقديم المقترح بنجاح!',
            'data' => $this->prepareResponseData($proposal, $mindmapPath)
        ], 201, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * التحقق من صلاحية المستخدم للوصول للمقترح
     */
    private function checkUserAccess(ProjectProposal $proposal)
    {
        $user = Auth::user();
        $groupId = $proposal->group_id;

        // إذا كان المستخدم طالباً
        if ($user->student) {
            return GroupStudent::where('studentId', $user->student->studentId)
                ->where('groupid', $groupId)
                ->where('status', 'approved')
                ->exists();
        }
        
        // إذا كان المستخدم مشرفاً
        if ($user->supervisor) {
            return GroupSupervisor::where('supervisorId', $user->supervisor->supervisorId)
                ->where('groupid', $groupId)
                ->where('status', 'approved')
                ->exists();
        }

        return false;
    }

    /**
     * عرض المقترح
     */
    public function show($id)
    {
        $proposal = ProjectProposal::with([
            'group.students.user',
            'group.supervisors.user',
            'experts'
        ])->findOrFail($id);

        if (!$this->checkUserAccess($proposal)) {
            return response()->json(['message' => 'غير مصرح لك بمشاهدة هذا المقترح'], 403);
        }

        return response()->json([
            'data' => $this->formatProposalData($proposal)
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * تحديث المقترح
     */
    public function update(Request $request, $id)
    {
        $proposal = ProjectProposal::findOrFail($id);
        $user = Auth::user();

        // فقط الطلاب يمكنهم التعديل
        if (!$user->student) {
            return response()->json(['message' => 'فقط الطلاب يمكنهم تعديل المقترحات'], 403);
        }

        if (!$this->checkUserAccess($proposal)) {
            return response()->json(['message' => 'غير مصرح لك بتعديل هذا المقترح'], 403);
        }

        $validated = $this->validateRequest($request, true);
        $mindmapPath = $this->handleFileUpload($request, $proposal);

        $updateData = [
            'title' => $validated['title'],
            'problem_statement' => $validated['problem_statement'],
            'problem_background' => $validated['problem_background'],
            'proposed_solution' => $validated['proposed_solution'],
            'functional_requirements' => $validated['functional_requirements'],
            'non_functional_requirements' => $validated['non_functional_requirements'],
            'technology_stack' => $validated['tech_stack'] ?? [],
        ];

        if ($mindmapPath) {
            $updateData['problem_mindmap_path'] = $mindmapPath;
        }

        $proposal->update($updateData);
        $this->syncRelations($proposal, $request);

        return response()->json([
            'message' => 'تم تحديث المقترح بنجاح!',
            'data' => $this->prepareResponseData($proposal, $mindmapPath)
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * حذف المقترح
     */
    public function destroy($id)
    {
        $proposal = ProjectProposal::findOrFail($id);
        $user = Auth::user();

        // التحقق من أن المستخدم هو قائد المجموعة
        if (!$user->student || !$user->student->isTeamLeader($proposal->group_id)) {
            return response()->json(['message' => 'فقط قائد المجموعة يمكنه حذف المقترح'], 403);
        }

        // حذف الملف المرفوع إذا كان موجوداً
        if ($proposal->problem_mindmap_path) {
            Storage::disk('public')->delete($proposal->problem_mindmap_path);
        }

        $proposal->delete();

        return response()->json([
            'message' => 'تم حذف المقترح بنجاح!'
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }

    /**
     * التحقق من صحة البيانات
     */
    private function validateRequest(Request $request, $isUpdate = false): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'problem_statement' => 'required|string',
            'problem_background' => 'required|string',
            'proposed_solution' => 'required|string',
            'functional_requirements' => 'required|string',
            'non_functional_requirements' => 'required|string',
            'tech_stack' => 'nullable|array',
        ];

        if (!$isUpdate) {
            $rules['problem_mindmap'] = 'nullable|image|mimes:jpeg,png,jpg|max:2048';
        } else {
            $rules['problem_mindmap'] = 'sometimes|image|mimes:jpeg,png,jpg|max:2048';
        }

        return $request->validate($rules);
    }

    /**
     * معالجة رفع الملف
     */
    private function handleFileUpload(Request $request, $proposal = null): ?string
    {
        if (!$request->hasFile('problem_mindmap')) {
            return null;
        }

        try {
            // حذف الملف القديم إذا كان موجوداً
            if ($proposal && $proposal->problem_mindmap_path) {
                Storage::disk('public')->delete($proposal->problem_mindmap_path);
            }

            return $request->file('problem_mindmap')->store('mindmaps', 'public');
        } catch (\Exception $e) {
            Log::error('File upload failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * إرفاق العلاقات (لإنشاء مقترح جديد)
     */
    private function attachRelations(ProjectProposal $proposal, Request $request, Group $group): void
    {
        try {
            // إرفاق الخبراء فقط (المشرفين يأتون من المجموعة)
            if ($request->experts) {
                foreach ($request->experts as $expert) {
                    if (!empty($expert['name'])) {
                        $proposal->experts()->create([
                            'name' => $expert['name'],
                            'phone' => $expert['phone'] ?? null,
                            'specialization' => $expert['specialization'] ?? null,
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Relations attachment failed: ' . $e->getMessage());
        }
    }

    /**
     * مزامنة العلاقات (لتحديث المقترح)
     */
    private function syncRelations(ProjectProposal $proposal, Request $request): void
    {
        try {
            // تحديث الخبراء فقط (المشرفين يأتون من المجموعة)
            if ($request->has('experts')) {
                $proposal->experts()->delete();
                foreach ($request->experts as $expert) {
                    if (!empty($expert['name'])) {
                        $proposal->experts()->create([
                            'name' => $expert['name'],
                            'phone' => $expert['phone'] ?? null,
                            'specialization' => $expert['specialization'] ?? null,
                        ]);
                    }
                }
            }
        } catch (\Exception $e) {
            Log::error('Relations sync failed: ' . $e->getMessage());
        }
    }

    /**
     * تحضير بيانات الاستجابة
     */
    private function prepareResponseData(ProjectProposal $proposal, ?string $mindmapPath): array
    {
        return [
            'proposal_id' => $proposal->proposalId,
            'title' => $proposal->title,
            'mindmap_url' => $mindmapPath ? url('storage/' . $mindmapPath) : null,
            'view_url' => url("/api/proposals/{$proposal->proposalId}")
        ];
    }

    /**
     * تنسيق بيانات المقترح
     */
    private function formatProposalData(ProjectProposal $proposal): array
    {
        return [
            'proposalId' => $proposal->proposalId,
            'title' => $proposal->title,
            'problem_statement' => $proposal->problem_statement,
            'problem_background' => $proposal->problem_background,
            'proposed_solution' => $proposal->proposed_solution,
            'functional_requirements' => $proposal->functional_requirements,
            'non_functional_requirements' => $proposal->non_functional_requirements,
            'methodology' => $proposal->methodology,
            'technology_stack' => $proposal->technology_stack,
            'group' => [
                'id' => $proposal->group->groupid,
                'name' => $proposal->group->name,
                'students' => $proposal->group->students,
                'supervisors' => $proposal->group->supervisors
            ],
            'experts' => $proposal->experts,
            'mindmap_url' => $proposal->problem_mindmap_path ? url('storage/' . $proposal->problem_mindmap_path) : null
        ];
    }
}