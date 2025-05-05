<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,userId',
            'content' => 'required|string|max:2000',
        ]);

        try {
            $message = Message::create([
                'sender_id' => Auth::id(),
                'receiver_id' => $request->receiver_id,
                'content' => $request->content,
                'created_at' => now(), 
            ]);

            return response()->json([
                'success' => true,
                'message' => 'تم إرسال الرسالة بنجاح',
                'data' => $message->load(['sender', 'receiver'])
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to send message: ' . $e->getMessage());
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

        // جلب الرسائل المتعلقة بالمستخدم
        $messages = Message::with(['sender', 'receiver'])
            ->where(function ($query) use ($user) {
                $query->where('sender_id', $user->userId)
                    ->orWhere('receiver_id', $user->userId);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // تجميع الرسائل بحسب المرسل (userId الآخر)
        $conversations = [];

        foreach ($messages as $message) {
            // تحديد المستخدم الآخر بناءً على المرسل أو المستقبل
            $otherUserId = $message->sender_id === $user->userId
                ? $message->receiver_id
                : $message->sender_id;

            // التحقق من إذا كان المستخدم الآخر موجود ضمن المحادثات
            if (!isset($conversations[$otherUserId])) {
                // استرجاع بيانات المستخدم الآخر
                $otherUser = $message->sender_id === $user->userId
                    ? $message->receiver
                    : $message->sender;

                // إضافة المستخدم إلى المحادثات
                $conversations[$otherUserId] = [
                    'conversation_id' => $otherUserId,
                    'other_user' => $otherUser,
                    'messages' => [],
                    'unread_count' => 0
                ];
            }

            // إضافة الرسالة إلى محادثة المستخدم الآخر
            $conversations[$otherUserId]['messages'][] = [
                'id' => $message->message_id,
                'sender_id' => $message->sender_id,
                'receiver_id' => $message->receiver_id,
                'content' => $message->content,
                'created_at' => $message->created_at,
                'is_read' => $message->is_read
            ];

            // زيادة عداد الرسائل غير المقروءة إذا كانت الرسالة مستلمة للمستخدم
            if ($message->receiver_id === $user->userId && !$message->is_read) {
                $conversations[$otherUserId]['unread_count']++;
            }
        }

        // إرجاع البيانات بشكل منظم
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
 