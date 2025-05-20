<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Supervisor;
use App\Models\Student;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MeetingController extends Controller
{
    // التحقق من صلاحية المشرف
    private function checkSupervisor(User $user)
    {
        if ($user->role !== 'supervisor') {
            abort(403, 'هذا الإجراء مسموح فقط للمشرفين');
        }
    }

    // التحقق من صلاحية الطالب
    private function checkStudent(User $user)
    {
        if ($user->role !== 'student') {
            abort(403, 'هذا الإجراء مسموح فقط للطلاب');
        }
    }

    // عرض اجتماعات المشرف
    public function supervisorIndex(Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية الوصول لهذه البيانات');
            }

            $meetings = $supervisor->meetings()
                ->with(['group.students.user', 'leader.user'])
                ->orderByDesc('meeting_time')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => $meetings
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    // اقتراح مواعيد جديدة
    public function storeProposed(Request $request, Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا يمكنك التصرف نيابة عن مشرف آخر');
            }

            $validator = Validator::make($request->all(), [
                'group_id' => 'required|integer|exists:groups,groupid',
                'proposed_times' => 'required|array|min:1|max:5',
                'proposed_times.*' => [
                    'required',
                    'date_format:Y-m-d H:i:s',
                    'after:now +1 hour',
                    'before:now +30 days'
                ],
                'description' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            // التحقق من أن المشرف معتمد للمجموعة
            $isApproved = DB::table('group_supervisor')
                ->where('supervisorId', $supervisor->supervisorId)
                ->where('groupid', $request->group_id)
                ->where('status', 'approved')
                ->exists();

            if (!$isApproved) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لهذا المشرف بإدارة هذه المجموعة'
                ], 403);
            }

            // البحث عن قائد المجموعة
            $leader = $this->resolveGroupLeader($request->group_id);

            if (!$leader) {
                return response()->json([
                    'success' => false,
                    'message' => 'المجموعة لا تحتوي على أعضاء'
                ], 422);
            }

            // إنشاء الاجتماعات
            $meetings = [];
            foreach ($request->proposed_times as $time) {
                $meetings[] = Meeting::create([
                    'group_id' => $request->group_id,
                    'leader_id' => $leader->studentId,
                    'supervisor_id' => $supervisor->supervisorId,
                    'description' => $request->description,
                    'meeting_time' => $time,
                    'status' => 'proposed'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'تم إنشاء المقترحات بنجاح',
                'data' => $meetings
            ], 201);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    // تأكيد الموعد
    public function confirm(Meeting $meeting, Supervisor $supervisor)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية تأكيد هذا الموعد');
            }

            DB::transaction(function () use ($meeting, $supervisor) {
                // التحقق من صلاحية المشرف
                $isApproved = DB::table('group_supervisor')
                    ->where('supervisorId', $supervisor->supervisorId)
                    ->where('groupid', $meeting->group_id)
                    ->where('status', 'approved')
                    ->exists();

                if (!$isApproved) {
                    abort(403, 'غير مصرح لهذا الإجراء');
                }

                Meeting::where('group_id', $meeting->group_id)
                    ->where('id', '!=', $meeting->id)
                    ->update(['status' => 'canceled']);

                $meeting->update([
                    'status' => 'confirmed',
                    'confirmed_at' => now()
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => 'تم تأكيد الموعد',
                'data' => $meeting->fresh()
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    // رفض الموعد
    public function reject(Meeting $meeting, Supervisor $supervisor, Request $request)
    {
        try {
            $user = auth()->user();
            $this->checkSupervisor($user);
            
            if ($user->supervisor->supervisorId !== $supervisor->supervisorId) {
                abort(403, 'لا تملك صلاحية رفض هذا الموعد');
            }

            $validator = Validator::make($request->all(), [
                'rejection_reason' => 'required|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $isApproved = DB::table('group_supervisor')
                ->where('supervisorId', $supervisor->supervisorId)
                ->where('groupid', $meeting->group_id)
                ->where('status', 'approved')
                ->exists();

            if (!$isApproved) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لهذا الإجراء'
                ], 403);
            }

            $meeting->update([
                'status' => 'canceled',
                'rejection_reason' => $request->rejection_reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم رفض الموعد',
                'data' => $meeting->fresh()
            ]);

        } catch (\Exception $e) {
            return $this->handleException($e);
        }
    }

    // اختيار الموعد من القائد
   // Update the chooseTime method in MeetingController

   public function chooseTime(Student $leader, Meeting $meeting)
   {
       try {
           $user = auth()->user();
           $this->checkStudent($user);
   
           // التحقق من أن الطالب الحالي هو نفسه القائد الممرر في الرابط
           if ($user->student->studentId !== $leader->studentId) {
               abort(403, 'لا تملك صلاحية التصرف نيابة عن قائد آخر');
           }
   
           // التحقق من أن القائد هو قائد المجموعة المرتبطة بالاجتماع
           $isLeader = DB::table('group_student')
               ->where('groupid', $meeting->group_id)
               ->where('studentId', $leader->studentId)
               ->where('is_leader', true)
               ->exists();
   
           if (!$isLeader) {
               abort(403, 'غير مصرح بهذا الإجراء');
           }
   
           DB::transaction(function () use ($meeting) {
               // إلغاء جميع الاجتماعات الأخرى للمجموعة
               Meeting::where('group_id', $meeting->group_id)
                   ->where('id', '!=', $meeting->id)
                   ->update(['status' => 'canceled']);
   
               // تحديث الاجتماع الحالي إلى "مؤقت"
               $meeting->update([
                   'status' => 'tentative',
                   'selected_by_leader_at' => now()
               ]);
           });
   
           return response()->json([
               'success' => true,
               'message' => 'تم اختيار الموعد بنجاح',
               'data' => $meeting->fresh()
           ]);
   
       } catch (\Exception $e) {
           return $this->handleException($e);
       }
   }

    // معالجة الأخطاء
    private function handleException(\Exception $e)
    {
        $statusCode = method_exists($e, 'getStatusCode') 
            ? $e->getStatusCode() 
            : 500;

        return response()->json([
            'success' => false,
            'message' => $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTrace() : null
        ], $statusCode);
    }
}