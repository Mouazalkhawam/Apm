<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\ProjectProposalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscussionScheduleController;
use App\Http\Controllers\Admin\HonorBoardController;

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