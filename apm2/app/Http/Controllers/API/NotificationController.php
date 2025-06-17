<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = NotificationService::getUserNotifications(
            $request->user_id ?? Auth::user()->userId
        )->map(function($notification) {
            return [
                'id' => $notification->id,
                'type' => $notification->type,
                'message' => $notification->data['message'] ?? '',
                'extra_data' => $notification->data['data'] ?? [],
                'read_at' => $notification->read_at,
                'created_at' => $notification->created_at
            ];
        });
        
        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    public function sendTestNotification(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'user_id' => 'required|exists:users,userId',
            'type' => 'nullable|string'
        ]);

        $notification = NotificationService::sendRealTime(
            $request->user_id,
            $request->message,
            array_merge($request->except(['message', 'user_id']), [
                'type' => $request->type ?? 'SYSTEM_NOTIFICATION'
            ])
        );

        return response()->json([
            'success' => true,
            'notification' => $notification,
            'pusher_event' => 'notification-event'
        ]);
    }

    public function markAsRead($id)
    {
        $notification = NotificationService::markAsRead($id);
        
        return response()->json([
            'success' => (bool)$notification,
            'notification' => $notification
        ]);
    }

    public function markAllAsRead()
    {
        Auth::user()->notifications()
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
            
        return response()->json(['success' => true]);
    }

    public function unreadCount()
    {
        $count = NotificationService::getUnreadCount(Auth::user()->userId);
        
        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }

    public function getNotificationTypes()
    {
        return response()->json([
            'success' => true,
            'types' => NotificationService::getNotificationTypes()
        ]);
    }
}