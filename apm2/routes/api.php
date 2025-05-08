<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscussionScheduleController;
use App\Http\Controllers\Admin\HonorBoardController;
use App\Http\Controllers\MessageController;

use Illuminate\Support\Facades\Route;
use OpenAI\Laravel\Facades\OpenAI;
use Illuminate\Support\Facades\Http;
// مسارات عامة بدون حماية
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// مسارات محمية تحتاج إلى Access Token
Route::middleware('auth:api')->group(function () {
    // مسارات المستخدم
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'userProfile']);
    Route::get('/users', [AuthController::class, 'getUsersByRole']);
    Route::post('/refresh', [AuthController::class, 'refreshToken']);
    Route::put('/profile/update', [AuthController::class, 'updateProfile']);
    Route::delete('/profile/delete', [AuthController::class, 'deleteAccount']);
    Route::post('/profile/restore/{id?}', [AuthController::class, 'restoreAccount']);
    Route::get('/dashboard', [DashboardController::class, 'index']); 
    Route::get('/schedules', [DiscussionScheduleController::class, 'index']);
    Route::post('/schedules', [DiscussionScheduleController::class, 'store']);
    Route::post('/projects/create', [ProjectController::class, 'createProject']);
    Route::delete('/messages/{messageId}', [MessageController::class, 'destroy']);
    Route::get('/messages/conversation/{userId}', [MessageController::class, 'chatMessages']);
    Route::post('/messages', [MessageController::class, 'send']);
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::patch('/messages/{message}/read', [MessageController::class, 'markAsRead']);
    Route::patch('/messages/mark-all-read', [MessageController::class, 'markAllAsRead']);
    Route::post('/projects/approve', [ProjectController::class, 'approveMembership']);
    Route::prefix('honor-board')->group(function () {
        // عرض جميع المشاريع المميزة (GET)
        Route::get('/', [HonorBoardController::class, 'indexApi']);
        
        // عرض المشاريع المتاحة للإضافة (GET)
        Route::get('/available-projects', [HonorBoardController::class, 'availableApi']);
        
        // إضافة مشروع جديد (POST)
        Route::post('/', [HonorBoardController::class, 'storeApi']);
        
        // حذف مشروع (DELETE)
        Route::delete('/{id}', [HonorBoardController::class, 'destroyApi']);
    });
    
    // مسارات المنسق
    Route::get('/admin/trash', [AuthController::class, 'viewTrash']);
    Route::delete('/admin/trash/{id}', [AuthController::class, 'forceDeleteAccount']);
    Route::put('/admin/user/role/{id}', [AuthController::class, 'changeRole']);

    // مسارات مقترحات المشاريع
    Route::prefix('proposals')->group(function () {
        Route::get('/create', [ProjectProposalController::class, 'create']);
        Route::post('/', [ProjectProposalController::class, 'store']);
        Route::get('/{proposal}', [ProjectProposalController::class, 'show']);
    });
    
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/send-test', [NotificationController::class, 'sendTestNotification']);
        Route::put('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
    });
  
});