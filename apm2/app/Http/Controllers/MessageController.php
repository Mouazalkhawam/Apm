<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    /**
     * إرسال رسالة جديدة
     */
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
            ]);

            // يمكنك إضافة إرسال إشعار هنا إذا كنت تستخدم نظام الإشعارات
            // $receiver = User::find($request->receiver_id);
            // $receiver->notify(new NewMessageNotification($message));

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

    /**
     * الحصول على جميع المحادثات
     */
    public function conversations(Request $request)
    {
        try {
            $user = Auth::user();
            $searchTerm = $request->query('search');
            
            $query = Message::with(['sender', 'receiver'])
                ->where(function($q) use ($user) {
                    $q->where('sender_id', $user->id)
                      ->orWhere('receiver_id', $user->id);
                });

            // فلترة المحادثات حسب البحث
            if ($searchTerm) {
                $query->whereHas('sender', function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%");
                })->orWhereHas('receiver', function($q) use ($searchTerm) {
                    $q->where('name', 'like', "%{$searchTerm}%");
                });
            }

            $messages = $query->latest()->get();

            $conversations = $messages->groupBy(function($message) use ($user) {
                    return $message->sender_id == $user->id 
                        ? $message->receiver_id 
                        : $message->sender_id;
                })
                ->map(function($messages) use ($user) {
                    $otherUser = $messages->first()->sender_id == $user->id 
                        ? $messages->first()->receiver 
                        : $messages->first()->sender;

                    return [
                        'conversation_id' => $otherUser->userId,
                        'user' => $otherUser,
                        'last_message' => $messages->first(),
                        'unread_count' => $messages->where('receiver_id', $user->id)
                                                  ->where('is_read', false)
                                                  ->count(),
                        'updated_at' => $messages->first()->created_at
                    ];
                })
                ->sortByDesc('updated_at')
                ->values();

            return response()->json([
                'success' => true,
                'data' => $conversations
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get conversations: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب المحادثات'
            ], 500);
        }
    }

    /**
     * الحصول على رسائل محادثة معينة
     */
    public function chatMessages($userId, Request $request)
    {
        try {
            $currentUser = Auth::user();
            $otherUser = User::findOrFail($userId);
            $perPage = $request->query('per_page', 20);
            
            // الحصول على الرسائل مع التقسيم للصفحات
            $messages = Message::where(function($query) use ($currentUser, $otherUser) {
                    $query->where('sender_id', $currentUser->id)
                          ->where('receiver_id', $otherUser->userId);
                })
                ->orWhere(function($query) use ($currentUser, $otherUser) {
                    $query->where('sender_id', $otherUser->userId)
                          ->where('receiver_id', $currentUser->id);
                })
                ->with(['sender', 'receiver'])
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            // تحديث الرسائل المستلمة كمقروءة
            Message::where('sender_id', $otherUser->userId)
                ->where('receiver_id', $currentUser->id)
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

    /**
     * الحصول على الرسائل المستلمة فقط
     */
    public function receivedMessages(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->query('per_page', 20);
            $unreadOnly = $request->query('unread', false);
            
            $query = Message::with(['sender'])
                ->where('receiver_id', $user->id);

            if ($unreadOnly) {
                $query->where('is_read', false);
            }

            $messages = $query->orderBy('created_at', 'desc')
                            ->paginate($perPage);

            return response()->json([
                'success' => true,
                'messages' => $messages->items(),
                'unread_count' => Message::where('receiver_id', $user->id)
                                       ->where('is_read', false)
                                       ->count(),
                'pagination' => [
                    'total' => $messages->total(),
                    'per_page' => $messages->perPage(),
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get received messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب الرسائل المستلمة'
            ], 500);
        }
    }

    /**
     * الحصول على الرسائل المرسلة فقط
     */
    public function sentMessages(Request $request)
    {
        try {
            $user = Auth::user();
            $perPage = $request->query('per_page', 20);
            
            $messages = Message::with(['receiver'])
                ->where('sender_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'messages' => $messages->items(),
                'pagination' => [
                    'total' => $messages->total(),
                    'per_page' => $messages->perPage(),
                    'current_page' => $messages->currentPage(),
                    'last_page' => $messages->lastPage()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get sent messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في جلب الرسائل المرسلة'
            ], 500);
        }
    }

    /**
     * تحديث حالة الرسالة كمقروءة
     */
    public function markAsRead($messageId)
    {
        try {
            $message = Message::findOrFail($messageId);

            if ($message->receiver_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بهذا الإجراء'
                ], 403);
            }
            
            $message->update(['is_read' => true]);
            
            return response()->json([
                'success' => true,
                'message' => 'تم تحديث حالة الرسالة كمقروءة'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark message as read: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في تحديث حالة الرسالة'
            ], 500);
        }
    }

    /**
     * حذف رسالة
     */
    public function destroy($messageId)
    {
        try {
            $message = Message::findOrFail($messageId);
            $user = Auth::user();
            
            if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'غير مصرح لك بهذا الإجراء'
                ], 403);
            }
            
            $message->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'تم حذف الرسالة بنجاح'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف الرسالة'
            ], 500);
        }
    }

    /**
     * الحصول على عدد الرسائل غير المقروءة
     */
    public function unreadCount()
    {
        try {
            $count = Message::where('receiver_id', Auth::id())
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

    /**
     * حذف جميع الرسائل المستلمة
     */
    public function deleteAllReceived()
    {
        try {
            $user = Auth::user();
            
            Message::where('receiver_id', $user->id)->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'تم حذف جميع الرسائل المستلمة'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to delete all received messages: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'فشل في حذف الرسائل'
            ], 500);
        }
    }
}