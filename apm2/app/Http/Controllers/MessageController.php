<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Events\NewMessageSent;
use App\Events\MessageRead;

class MessageController extends Controller
{
    public function send(Request $request)
{
    $request->validate([
        'receiver_id' => 'required|exists:users,userId',
        'content' => 'required|string|max:2000',
    ]);

    try {
        // 1. إنشاء الرسالة مع جميع الحقول المطلوبة
        $message = Message::create([
            'sender_id' => Auth::id(),
            'receiver_id' => $request->receiver_id,
            'content' => $request->content,
            'is_read' => false,
            'created_at' => now(),
            'sent_at' => now(), // إذا كان هذا الحقل مطلوباً
        ]);

        // 2. جلب الرسالة باستخدام المفتاح الأساسي الصحيح
        $messageWithRelations = Message::with(['sender', 'receiver'])
                                    ->where('message_id', $message->message_id)
                                    ->firstOrFail();

        // 3. تسجيل تفاصيل الرسالة للتأكد
        Log::debug('Message details', [
            'id' => $messageWithRelations->message_id,
            'sender' => $messageWithRelations->sender_id,
            'receiver' => $messageWithRelations->receiver_id
        ]);

        // 4. البث مع التحقق النهائي
        if ($messageWithRelations->exists) {
            broadcast(new NewMessageSent($messageWithRelations))->toOthers();
            
            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الرسالة بنجاح',
                'data' => $messageWithRelations
            ], 201);
        }

        throw new \Exception('فشل تحميل الرسالة بعد الإنشاء');

    } catch (\Exception $e) {
        Log::error('Message sending failed', [
            'error' => $e->getMessage(),
            'request' => $request->all(),
            'user' => Auth::id()
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'فشل في إرسال الرسالة',
            'error' => $e->getMessage()
        ], 500);
    }
}

    public function conversations()
    {
        try {
            $user = Auth::user();

            $messages = Message::with(['sender', 'receiver'])
                ->where(function ($query) use ($user) {
                    $query->where('sender_id', $user->userId)
                        ->orWhere('receiver_id', $user->userId);
                })
                ->orderBy('created_at', 'desc')
                ->get();

            $conversations = [];

            foreach ($messages as $message) {
                $otherUserId = $message->sender_id === $user->userId
                    ? $message->receiver_id
                    : $message->sender_id;

                if (!isset($conversations[$otherUserId])) {
                    $otherUser = $message->sender_id === $user->userId
                        ? $message->receiver
                        : $message->sender;

                    $conversations[$otherUserId] = [
                        'conversation_id' => $otherUserId,
                        'other_user' => $otherUser,
                        'messages' => [],
                        'unread_count' => 0
                    ];
                }

                $conversations[$otherUserId]['messages'][] = [
                    'id' => $message->message_id,
                    'sender_id' => $message->sender_id,
                    'receiver_id' => $message->receiver_id,
                    'content' => $message->content,
                    'created_at' => $message->created_at,
                    'is_read' => $message->is_read
                ];

                if ($message->receiver_id === $user->userId && !$message->is_read) {
                    $conversations[$otherUserId]['unread_count']++;
                }
            }

            return response()->json([
                'success' => true,
                'data' => array_values($conversations)
            ]);
        } catch (\Exception $e) {
            Log::error('Conversations error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب المحادثات',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function chatMessages($userId, Request $request)
    {
        try {
            $currentUser = Auth::user();
            $otherUser = User::findOrFail($userId);
            $perPage = $request->query('per_page', 20);

            $messages = Message::where(function($query) use ($currentUser, $otherUser) {
                    $query->where('sender_id', $currentUser->userId)
                          ->where('receiver_id', $otherUser->userId);
                })
                ->orWhere(function($query) use ($currentUser, $otherUser) {
                    $query->where('sender_id', $otherUser->userId)
                          ->where('receiver_id', $currentUser->userId);
                })
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // تحديث كقراءة
            Message::where('sender_id', $otherUser->userId)
                ->where('receiver_id', $currentUser->userId)
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'messages' => $messages->items(),
                'other_user' => $otherUser,
                'pagination' => [
                    'total' => $messages->total(),
                    'per_page' => $messages->perPage(),
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get chat messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب الرسائل'
            ], 500);
        }
    }

    public function unreadCount()
    {
        try {
            $count = Message::where('receiver_id', Auth::user()->userId)
                          ->where('is_read', false)
                          ->count();

            return response()->json([
                'success' => true,
                'unread_count' => $count
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get unread count: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب عدد الرسائل غير المقروءة'
            ], 500);
        }
    }

    public function markAsRead($messageId)
{
    try {
        $message = Message::findOrFail($messageId);

        if ($message->receiver_id !== Auth::user()->userId) {
            return response()->json([
                'success' => false,
                'message' => 'غير مصرح لك بقراءة هذه الرسالة'
            ], 403);
        }

        $message->update(['is_read' => true]);

        // بث حدث تحديث حالة الرسالة
        broadcast(new MessageRead($message));

        return response()->json([
            'success' => true,
            'message' => 'تم تعليم الرسالة كمقروءة'
        ]);

    } catch (\Exception $e) {
        Log::error('Mark as read error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'فشل في تحديث حالة الرسالة'
        ], 500);
    }
}
    public function markAllAsRead()
{
    try {
        $userId = Auth::user()->userId;

        // تحديث جميع الرسائل التي لم تُقرأ للمستخدم
        Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'تم تحديد جميع الرسائل كمقروءة'
        ]);

    } catch (\Exception $e) {
        Log::error('Mark all as read error: ' . $e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'فشل في تحديث جميع الرسائل كمقروءة'
        ], 500);
    }
}


    public function destroy($messageId)
    {
        try {
            $message = Message::findOrFail($messageId);
            $userId = Auth::user()->userId;

            if ($message->sender_id !== $userId && $message->receiver_id !== $userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بحذف هذه الرسالة'
                ], 403);
            }

            $message->delete();

            return response()->json([
                'success' => true,
                'message' => 'تم حذف الرسالة بنجاح'
            ]);

        } catch (\Exception $e) {
            Log::error('Delete message error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف الرسالة'
            ], 500);
        }
    }
}
 