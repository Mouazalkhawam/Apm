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
        );
        
        return response()->json([
            'success' => true,
            'notifications' => $notifications
        ]);
    }

    public function sendTestNotification(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
            'user_id' => 'required|exists:users,userId' // تغيير من id إلى userId
        ]);

        $notification = NotificationService::sendRealTime(
            $request->user_id,
            $request->message,
            $request->except(['message', 'user_id'])
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
        $count = NotificationService::getUnreadCount(Auth::user()->userId); // تغيير من id() إلى userId
        
        return response()->json([
            'success' => true,
            'count' => $count
        ]);
    }
}