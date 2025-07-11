<?php

namespace App\Http\Controllers;

use App\Models\ProjectProposal;
use App\Models\Group;
use App\Models\GroupStudent;
use App\Models\PendingTask;
use App\Models\ProjectCoordinator;
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
   // حفظ المقترح الجديد
public function store(Request $request, $group_id)
{
    $user = Auth::user();
    
    // التحقق من أن المستخدم طالب
    if (!$user->student) {
        return response()->json(['message' => 'يجب أن تكون طالباً لإنشاء مقترح'], 403);
    }

    // التحقق من أن المجموعة تخص الطالب وتكون معتمدة
    $group = $user->student->groups()
        ->where('groups.groupId', $group_id)
        ->where('status', 'approved')
        ->first();

    if (!$group) {
        return response()->json(['message' => 'غير مصرح لك بإضافة مقترح لهذه المجموعة أو المجموعة غير معتمدة'], 403);
    }

    // تحقق من صحة البيانات المدخلة
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
    ], [
        'required' => 'حقل :attribute مطلوب',
        'json' => 'حقل :attribute يجب أن يكون بصيغة JSON صالحة'
    ]);

    if ($validator->fails()) {
        return response()->json([
            'message' => 'خطأ في التحقق من البيانات',
            'errors' => $validator->errors()
        ], 422);
    }

    // تحضير البيانات
    $data = $request->except(['problem_mindmap', 'experts']);

    // تحويل الحقول JSON إلى مصفوفات مع الحفاظ على الترميز العربي
    $arrayFields = [
        'tools',
        'programming_languages',
        'functional_requirements',
        'non_functional_requirements',
        'technology_stack'
    ];

    foreach ($arrayFields as $field) {
        if (!empty($data[$field])) {
            $data[$field] = json_decode($data[$field], true, 512, JSON_UNESCAPED_UNICODE);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'صيغة JSON غير صالحة لحقل ' . $field,
                    'error' => json_last_error_msg()
                ], 422);
            }
        }
    }

    DB::beginTransaction();
    try {
        // رفع ملف الخريطة الذهنية إذا وجد
        $mindmapPath = null;
        if ($request->hasFile('problem_mindmap')) {
            $file = $request->file('problem_mindmap');
            $filename = 'mindmap_' . time() . '.' . $file->getClientOriginalExtension();
            $mindmapPath = $file->storeAs('mindmaps', $filename, 'public');
        }

        // إنشاء المقترح
        $proposal = ProjectProposal::create([
            'group_id' => $group_id,
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

        // إضافة الخبراء إذا وجدوا
        if ($request->has('experts') && is_array($request->experts)) {
            foreach ($request->experts as $expert) {
                $proposal->experts()->create([
                    'name' => $expert['name'],
                    'phone' => $expert['phone'] ?? null,
                    'specialization' => $expert['specialization'] ?? null,
                ]);
            }
        }

        // إنشاء مهمة معلقة للمنسق لمراجعة المقترح
        PendingTask::create([
            'type' => 'proposal_approval',
            'proposal_id' => $proposal->proposalId,
            'group_id' => $group_id,
            'coordinator_id' => $this->getCoordinatorId(), // دالة مساعدة للحصول على أي دي المنسق
            'status' => 'pending',
            'notes' => 'مقترح جديد يحتاج إلى مراجعة: ' . $proposal->title . ' - المجموعة: ' . $group->name,
            'related_type' => 'App\Models\ProjectProposal', // أضف هذا السطر
            'related_id' => $proposal->proposalId 
        ]);

        DB::commit();

        return response()->json([
            'message' => 'تم إنشاء المقترح بنجاح وهو بانتظار الموافقة',
            'data' => $this->formatProposalResponse($proposal)
        ], 201, [], JSON_UNESCAPED_UNICODE);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('فشل إنشاء المقترح: ' . $e->getMessage());
        return response()->json([
            'message' => 'حدث خطأ أثناء إنشاء المقترح',
            'error' => $e->getMessage(),
            'trace' => $e->getTrace()
        ], 500);
    }
}

// دالة مساعدة للحصول على أي دي المنسق
protected function getCoordinatorId()
{
    // يمكنك تعديل هذا الجزء حسب هيكل قاعدة البيانات الخاص بك
    // هذا مثال افتراضي
    $coordinator = ProjectCoordinator::first();
    return $coordinator ? $coordinator->coordinatorId : null;
}
    public function showByGroup($groupid)
    {
        $user = Auth::user();
        $proposal = ProjectProposal::with(['experts', 'group.students', 'group.supervisors'])
            ->where('group_id', $groupid)
            ->first();
    
        if (!$proposal) {
            return response()->json(['message' => 'No proposal found for this group'], 404);
        }
    
        // إذا كان المستخدم منسقًا، يسمح له بمشاهدة المقترح مباشرة
        if ($user->isCoordinator()) {
            return response()->json($this->formatProposalResponse($proposal));
        }
    
        // التحقق من أن المستخدم عضو في المجموعة (لغير المنسقين)
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
        $user = Auth::user();
        
        // التحقق من المصادقة
        if (!$user) {
            return response()->json(['message' => 'غير مصرح بالوصول، يرجى تسجيل الدخول'], 401);
        }

        // البحث عن المقترح
        $proposal = ProjectProposal::with(['experts'])
            ->where('group_id', $group_id)
            ->first();

        if (!$proposal) {
            return response()->json(['message' => 'لا يوجد مقترح مرتبط بهذه المجموعة'], 404);
        }

        // التحقق من الصلاحيات
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

        // التحقق من صحة البيانات
        $validator = Validator::make($request->all(), [
            'project_type' => 'sometimes|in:term-project,grad-project',
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
            'problem_mindmap' => 'nullable|file|mimes:jpg,jpeg,png,pdf,xmind|max:2048',
            'experts' => 'nullable|array',
            'experts.*.name' => 'required_with:experts|string',
            'experts.*.phone' => 'nullable|string',
            'experts.*.specialization' => 'nullable|string'
        ], [
            'required_with' => 'حقل :attribute مطلوب عند وجود خبراء',
            'json' => 'حقل :attribute يجب أن يكون بصيغة JSON صالحة'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'خطأ في البيانات المدخلة',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // معالجة ملف الخريطة الذهنية
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

            // تحضير البيانات للتحديث
            $data = $request->except(['experts', 'problem_mindmap']);

            // تحويل الحقول JSON إلى مصفوفات مع الحفاظ على الترميز العربي
            $arrayFields = [
                'tools',
                'programming_languages',
                'functional_requirements',
                'non_functional_requirements',
                'technology_stack'
            ];

            foreach ($arrayFields as $field) {
                if (isset($data[$field]) && is_string($data[$field])) {
                    $data[$field] = json_decode($data[$field], true, 512, JSON_UNESCAPED_UNICODE);
                    if (json_last_error() !== JSON_ERROR_NONE) {
                        throw new \Exception('صيغة JSON غير صالحة لحقل ' . $field . ': ' . json_last_error_msg());
                    }
                }
            }

            // تحديث البيانات الأساسية
            $proposal->update($data);

            // معالجة الخبراء
            if ($request->has('experts')) {
                // حذف الخبراء الحاليين
                $proposal->experts()->delete();
                
                // إضافة الخبراء الجدد
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
                'data' => $this->formatProposalResponse($proposal->fresh())
            ], 200, [], JSON_UNESCAPED_UNICODE);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Update error: '.$e->getMessage());
            Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'حدث خطأ أثناء تحديث المقترح',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
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

    public function checkProposalExists($group_id)
    {
        $proposal = ProjectProposal::where('group_id', $group_id)->first();
        return response()->json(['exists' => $proposal !== null]);
    }

    public function approveProposal($proposalId)
    {
        $user = Auth::user();
        
        if (!$user->isCoordinator()) {
            return response()->json(['message' => 'ليست لديك صلاحية الموافقة على المقترحات'], 403);
        }

        $proposal = ProjectProposal::findOrFail($proposalId);
        $proposal->status = 'approved';
        $proposal->save();

        return response()->json([
            'message' => 'تم قبول المقترح بنجاح',
            'status' => $proposal->status
        ], 200);
    }


    public function markAsNeedsRevision($proposalId)
    {
        $user = Auth::user();
        
        if (!$user->isCoordinator()) {
            return response()->json(['message' => 'ليست لديك صلاحية رفض المقترحات'], 403);
        }

        $proposal = ProjectProposal::findOrFail($proposalId);
        $proposal->status = 'needs_revision';
        $proposal->save();

        return response()->json([
            'message' => 'تم تغيير حالة المقترح إلى "بحاجة لإصلاح"',
            'status' => $proposal->status
        ], 200);
    }
/**
 * تغيير حالة مقترح المجموعة إلى مقبول
 */
/**
 * تغيير حالة مقترح المجموعة إلى مقبول
 */
public function approveProposalByGroup($groupId)
{
    $user = Auth::user();
    
    if (!$user->isCoordinator()) {
        return response()->json(['message' => 'ليست لديك صلاحية الموافقة على المقترحات'], 403);
    }

    DB::beginTransaction();
    try {
        // البحث عن المقترح باستخدام group_id
        $proposal = ProjectProposal::where('group_id', $groupId)->firstOrFail();
        
        $proposal->status = 'approved';
        $proposal->save();

        // حذف المهمة المعلقة المرتبطة بهذا المقترح إن وجدت
        PendingTask::where('proposal_id', $proposal->proposalId)
            ->where('type', 'proposal_approval')
            ->delete();

        DB::commit();

        return response()->json([
            'message' => 'تم قبول مقترح المجموعة بنجاح',
            'status' => $proposal->status,
            'status_name' => $proposal->status_name
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();
        Log::error('Error approving proposal: ' . $e->getMessage());
        return response()->json([
            'message' => 'حدث خطأ أثناء الموافقة على المقترح',
            'error' => $e->getMessage()
        ], 500);
    }
}
public function markProposalAsNeedsRevisionByGroup($groupId)
{
    $user = Auth::user();
    
    if (!$user->isCoordinator()) {
        return response()->json(['message' => 'ليست لديك صلاحية رفض المقترحات'], 403);
    }

    // البحث عن المقترح باستخدام group_id
    $proposal = ProjectProposal::where('group_id', $groupId)->firstOrFail();
    
    $proposal->status = 'needs_revision';
    $proposal->save();

    return response()->json([
        'message' => 'تم تغيير حالة مقترح المجموعة إلى "بحاجة لإصلاح"',
        'status' => $proposal->status,
        'status_name' => $proposal->status_name
    ], 200);
}
/**
 * استعراض جميع المقترحات عدا المقترحات المقبولة (للمنسق)
 */
public function getAllProposalsExceptApproved()
{
    // التحقق من أن المستخدم منسق
    $user = Auth::user();
    if (!$user->isCoordinator()) {
        return response()->json([
            'message' => 'ليست لديك صلاحية الوصول إلى هذه البيانات',
            'success' => false
        ], 403);
    }

    // جلب جميع المقترحات مع استثناء المقترحات المقبولة
    $proposals = ProjectProposal::with(['group.students', 'group.supervisors', 'experts'])
        ->where('status', '!=', 'approved')
        ->whereHas('group') // التأكد من وجود مجموعة مرتبطة
        ->orderBy('created_at', 'desc')
        ->get();

    // تنسيق الاستجابة مع التحقق من وجود المجموعة
    $formattedProposals = $proposals->map(function ($proposal) {
        return [
            'id' => $proposal->proposalId,
            'title' => $proposal->title,
            'status' => $proposal->status,
            'status_name' => $proposal->status_name,
            'project_type' => $proposal->project_type,
            'project_type_name' => $proposal->project_type_name,
            'created_at' => $proposal->created_at->format('Y-m-d H:i'),
            'updated_at' => $proposal->updated_at->format('Y-m-d H:i'),
            'group' => $proposal->group ? [
                'id' => $proposal->group->groupid,
                'name' => $proposal->group->name,
                'students_count' => $proposal->group->students->count(),
                'supervisors_count' => $proposal->group->supervisors->count()
            ] : null,
            'mindmap_url' => $proposal->problem_mindmap_path ? 
                url('storage/' . $proposal->problem_mindmap_path) : null
        ];
    });

    return response()->json([
        'success' => true,
        'count' => $proposals->count(),
        'data' => $formattedProposals
    ], 200, [], JSON_UNESCAPED_UNICODE);
}
}