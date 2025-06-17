<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Events\RealTimeNotification;

class NotificationService
{
    public static function getNotificationTypes()
    {
        return [
            'MEMBERSHIP_APPROVAL' => 'قبول عضوية',
            'PROJECT_INVITATION' => 'دعوة مشروع',
            'SUPERVISOR_INVITATION' => 'دعوة مشرف',
            'TASK_ASSIGNMENT' => 'مهمة جديدة',
            'SYSTEM_NOTIFICATION' => 'إشعار نظام'
        ];
    }

    public static function sendRealTime($userId, $message, $data = [])
    {
        // التأكد من أن النوع محدد وإلا استخدم SYSTEM_NOTIFICATION
        $type = $data['type'];
        
        $notificationData = [
            'type' => $type,
            'notifiable_id' => $userId,
            'notifiable_type' => User::class,
            'data' => [
                'message' => $message,
                'data' => $data // هذا يحتوي على جميع البيانات الإضافية بما فيها 'type'
            ]
        ];
    
        $notification = Notification::create($notificationData);
        event(new RealTimeNotification($notification));
        
        return $notification;
    }
    public static function markAsRead($notificationId)
    {
        $notification = Notification::find($notificationId);
        if ($notification && !$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }
        return $notification;
    }

    public static function getUserNotifications($userId)
    {
        return User::find($userId)->notifications()
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public static function getUnreadCount($userId)
    {
        return User::find($userId)->notifications()
            ->whereNull('read_at')
            ->count();
    }
}