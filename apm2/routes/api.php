<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\API\ProjectStageController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\AcademicPeriodController;
use App\Http\Controllers\API\ResourceController;
use App\Http\Controllers\API\EvaluationController;
use App\Http\Controllers\API\PendingTaskController;
use App\Http\Controllers\Admin\HonorBoardController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SupervisorController;
use App\Http\Controllers\DiscussionScheduleController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Http;
// مسارات عامة بدون حماية
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/all-skills', [StudentProfileController::class, 'getAllSkills']);



// مسارات محمية تحتاج إلى Access Token
Route::middleware('auth:api')->group(function () {
    // مسارات المستخدم
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userProfile']);
    Route::get('/users', [AuthController::class, 'getUsersByRole']);
    Route::get('/students', [AuthController::class, 'getStudentsForDropdown']);
    Route::get('/supervisors', [AuthController::class, 'getSupervisorsForDropdown']);
    Route::get('/check-supervisor', [AuthController::class, 'checkSupervisor']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/delete', [AuthController::class, 'deleteAccount']);
    Route::post('/profile/restore/{id?}', [AuthController::class, 'restoreAccount']);
    Route::get('/dashboard', [DashboardController::class, 'index']); 
    Route::get('/schedules', [DiscussionScheduleController::class, 'index']);
    Route::post('/schedules', [DiscussionScheduleController::class, 'store']);
    Route::get('/schedules/group/{group_id}', [DiscussionScheduleController::class, 'getByGroup']);
    Route::post('/projects/create', [ProjectController::class, 'createProject']);
    Route::post('/projects/approve', [ProjectController::class, 'approveMembership']);
    Route::post('/projects/recommendations', [ProjectController::class, 'getRecommendations']);
    Route::get('/student/projects', [ProjectController::class, 'getStudentProjects']);
    Route::get('/student/projects/{projectId}', [ProjectController::class, 'getStudentProjectDetails']);
    Route::post('/project-stages', [ProjectStageController::class, 'store']); // إنشاء مرحلة
    Route::post('/groups/{group}/stages', [ProjectStageController::class, 'store']);
    Route::post('/project-stages/{stage_id}/submit', [ProjectStageController::class, 'submitStage']);
    Route::post('/stages/{stage_id}/evaluate', [ProjectStageController::class, 'evaluateStage']);
    Route::get('/stages/{stage_id}/submission', [ProjectStageController::class, 'getStageSubmission']);
    Route::get('/project-stages/{project_id}', [ProjectStageController::class, 'getByProject']);
    Route::get('/group-stages/{group_id}', [ProjectStageController::class, 'getByGroup']); // عرض مراحل مشروع
    Route::delete('/project-stages/{id}', [ProjectStageController::class, 'destroy']); // حذف مرحلة
    Route::delete('/messages/{messageId}', [MessageController::class, 'destroy']);
    Route::get('/messages/conversation/{userId}', [MessageController::class, 'chatMessages']);
    Route::post('/messages', [MessageController::class, 'send']);
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::patch('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::patch('/messages/mark-all-read', [MessageController::class, 'markAllAsRead']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::post('/projects/approve', [ProjectController::class, 'approveMembership']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/stages/{stage}/tasks', [TaskController::class, 'getStageTasks']);
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
    Route::post('/tasks/{task}/submit', [TaskController::class, 'submitTask']);
    Route::patch('/submissions/{submission}/grade', [TaskController::class, 'gradeTask']);
    Route::post('/tasks/{task}/grade', [TaskController::class, 'gradeTaskSubmission']);
    Route::get('/tasks/{task}/grading-status', [TaskController::class, 'checkTaskGrading']);
    Route::get('/tasks/submissions/{submission}/download', [TaskController::class, 'downloadAttachment']);
    Route::get('/tasks/stats', [TaskController::class, 'getStudentTaskStats']);
    Route::get('/user/tasks', [TaskController::class, 'getUserTasks']);
    Route::get('/student/projects/{projectId}/tasks', [TaskController::class, 'getStudentProjectTasks']);
    Route::prefix('honor-board')->group(function () {
        // عرض جميع المشاريع المميزة (GET)
        Route::get('/', [HonorBoardController::class, 'indexApi']);
        
        // عرض المشاريع المتاحة للإضافة (GET)
        Route::get('/available-projects', [HonorBoardController::class, 'availableApi']);
        
        // إضافة مشروع جديد (POST)
        Route::post('/', [HonorBoardController::class, 'storeApi']);
        
        // حذف مشروع (DELETE)
        Route::delete('/{id}', [HonorBoardController::class, 'destroyApi']);

        Route::get('/achievements', [ProjectController::class, 'getAcademicAchievements']);
    });
    
    
    // مسارات المنسق
    Route::get('/admin/trash', [AuthController::class, 'viewTrash']);
    Route::delete('/admin/trash/{id}', [AuthController::class, 'forceDeleteAccount']);
    Route::put('/admin/user/role/{id}', [AuthController::class, 'changeRole']); 

    // مسارات مقترحات المشاريع
    Route::prefix('proposals')->group(function () {
        Route::get('/create', [ProjectProposalController::class, 'create']);
        Route::post('/groups/{group_id}/proposals', [ProjectProposalController::class, 'store']);
        Route::get('/{id}', [ProjectProposalController::class, 'show']);
        Route::get('/group/{groupid}', [ProjectProposalController::class, 'showByGroup']);
        
    
    });
    
  
    Route::put('/proposals/{groupid}', [ProjectProposalController::class, 'update']);
    Route::get('/proposals/check/{group_id}', [ProjectProposalController::class, 'checkProposalExists']);
    
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/send-test', [NotificationController::class, 'sendTestNotification']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    });

    Route::get('/resources', [ResourceController::class, 'index']);
    Route::get('/resources/{id}', [ResourceController::class, 'show']);
    
    // إنشاء مورد جديد (مشرف أو منسق فقط - الصلاحية داخل الكونترولر)
    Route::post('/resources', [ResourceController::class, 'store']);
    
    // تحديث المورد (المنشئ أو المنسق - الصلاحية داخل الكونترولر)
    Route::put('/resources/{id}', [ResourceController::class, 'update']);
    
    // حذف المورد (المنسق فقط - الصلاحية داخل الكونترولر)
    Route::delete('/resources/{id}', [ResourceController::class, 'destroy']);
    
    // تحديث حالة المورد (المنسق فقط - الصلاحية داخل الكونترولر)
    Route::patch('/resources/{id}/status', [ResourceController::class, 'updateStatus']);

    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::get('/evaluations', [EvaluationController::class, 'index']);

    Route::get('/supervisor/groups', [ProjectController::class, 'getSupervisorGroups']);
    Route::prefix('supervisors/{supervisor}')->group(function () {
        Route::get('/meetings', [MeetingController::class, 'supervisorIndex']);
        Route::post('/meetings/propose', [MeetingController::class, 'storeProposed']);
        Route::post('/meetings/{meeting}/confirm', [MeetingController::class, 'confirm']);
        Route::post('/meetings/{meeting}/reject', [MeetingController::class, 'reject']);
    });

    Route::prefix('students/{leader}')->group(function () {
        Route::get('/meetings', [MeetingController::class, 'leaderIndex']);
        Route::post('/meetings/{meeting}/choose', [MeetingController::class, 'chooseTime']);
    });
    Route::post('groups/{groupId}/meetings/{meetingId}/choose',[MeetingController::class, 'chooseTime']);
    Route::get('/supervisors/{supervisor}/available-times', 
        [MeetingController::class, 'getAvailableTimes']);

    Route::prefix('student/profile')->group(function () {
        Route::put('/update', [StudentProfileController::class, 'updateProfile']);
        Route::post('/skills/add', [StudentProfileController::class, 'addSkill']);
        Route::delete('/skills/remove/{skillId}', [StudentProfileController::class, 'removeSkill']);
        Route::get('/skills', [StudentProfileController::class, 'getSkills']);
        Route::get('/info', [StudentProfileController::class, 'getProfile']);
    });

    
     // مسارات إدارة الفصول الدراسية (للمنسق فقط)
     Route::prefix('academic-periods')->group(function () {
        Route::get('/', [AcademicPeriodController::class, 'index']);
        Route::post('/', [AcademicPeriodController::class, 'store']);
        Route::put('/{id}', [AcademicPeriodController::class, 'update']);
        Route::post('/{id}/set-current', [AcademicPeriodController::class, 'setCurrentPeriod']);
    });
    

    Route::get('/current-academic-period', [AcademicPeriodController::class, 'getCurrentPeriod']);
    Route::get('/groups/{groupId}/supervisors', [ProjectController::class, 'getGroupSupervisors']);
    Route::get('/groups/{groupId}/students', [ProjectController::class, 'getGroupStudents']);
    Route::get('/groups/{groupId}/is-leader', [ProjectController::class, 'isStudentLeader']);
    Route::get('/groups/{groupId}/is-supervisor', [ProjectController::class, 'isUserSupervisor']);
    Route::post('/groups/{groupId}/members', [ProjectController::class, 'addGroupMembers']);


    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::get('/evaluation-criteria', [EvaluationController::class, 'getCriteria']);

    Route::get('/supervisor/projects', [ProjectController::class, 'getSupervisorProjects']);
    Route::get('/supervisors/students-names', [ProjectController::class, 'getSupervisorsWithStudentsNames']);

    Route::post('/pusher/auth', [\App\Http\Controllers\API\PusherAuthController::class, 'authenticate']);


    Route::get('/projects/current-semester', [ProjectController::class, 'getCurrentSemesterProjects']);
    Route::get('/projects/current-graduation', [ProjectController::class, 'getCurrentGraduationProjects']);
    Route::get('/coordinator/current-projects', [ProjectController::class, 'getCurrentProjectsCoordinator']);
   

    Route::get('supervisors/{supervisorId}/active-projects-count', 
    [SupervisorController::class, 'countActiveProjects']);

    Route::get('pending-tasks', [PendingTaskController::class, 'index']);
    Route::post('pending-tasks/{task}/process', [PendingTaskController::class, 'processTask']);
    Route::get('/projects/latest', [ProjectController::class, 'getLatestProjects']);
    Route::post('/coordinator/create-supervisor', [AuthController::class, 'createSupervisor']);

    Route::get('/discussions/current-month-count', [DiscussionScheduleController::class, 'getCurrentMonthDiscussionsCount']);
    Route::get('/discussion-types', [DiscussionScheduleController::class, 'getDiscussionTypes']);

      // روستس جديدة لتغيير حالة المقترح باستخدام group_id
      Route::post('/groups/{group}/proposal/approve', [ProjectProposalController::class, 'approveProposalByGroup']);
      Route::post('/groups/{group}/proposal/needs-revision', [ProjectProposalController::class, 'markProposalAsNeedsRevisionByGroup']);
});