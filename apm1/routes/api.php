<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiscussionScheduleController;



Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index']); // فقط للكوردنيتورRoute::post('/schedules', [DiscussionScheduleController::class, 'store']);
    Route::get('/schedules', [DiscussionScheduleController::class, 'index']);
    
});

// عرض المواعيد - متاح للجميع
Route::get('/schedules', [DiscussionScheduleController::class, 'index']);
