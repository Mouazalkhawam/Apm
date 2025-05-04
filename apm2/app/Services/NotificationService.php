<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Events\RealTimeNotification;
use Illuminate\Database\Eloquent\Model;

class NotificationService
{
    public static function send($type, $notifiable, $data)
    {
        $notification = new Notification([
            'type' => $type,
            'data' => $data
        ]);

        $notifiable->notifications()->save($notification);

        // إرسال إشعار Real-time إذا كان النوع مناسباً
        if (in_array($type, ['real_time', 'proposal_submitted', 'new_message'])) {
            event(new RealTimeNotification(
                $data['message'] ?? 'You have a new notification',
                $notifiable->id,
                $data['proposal_id'] ?? null
            ));
        }

        return $notification;
    }

    public static function sendRealTime($userId, $message, $data = [])
    {
        $user = User::findOrFail($userId);
        
        $notification = self::send('real_time', $user, array_merge([
            'message' => $message,
            'time' => now()->toDateTimeString()
        ], $data));

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