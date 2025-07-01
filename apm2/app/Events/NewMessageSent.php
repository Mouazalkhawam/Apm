<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Queue\SerializesModels;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;

class NewMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        if (!$message->exists) {
            \Log::error('Attempt to broadcast non-existent message');
            throw new \Exception('Message does not exist');
        }

        // تأكد من تحميل العلاقات
        $this->message = $message->loadMissing(['sender', 'receiver']);
    }

    public function broadcastOn()
    {
        // أرسل الحدث إلى القناة الخاصة بالمستقبل فقط
        return new PrivateChannel('App.Models.User.' . $this->message->receiver_id);
    }

    public function broadcastAs()
    {
        // الحدث يجب أن يتطابق اسمه مع ما تسمعه الواجهة
        return 'App\\Events\\NewMessageSent';
    }

    public function broadcastWith()
    {
        return [
            'message_id' => $this->message->message_id,
            'content'    => $this->message->content,
            'created_at' => $this->message->created_at,

            'sender' => [
                'userId' => $this->message->sender->userId,
                'name'   => $this->message->sender->name,
                'email'  => $this->message->sender->email,
                // أضف أي معلومات أخرى تحتاجها في الواجهة
            ],

            'receiver' => [
                'userId' => $this->message->receiver->userId,
                'name'   => $this->message->receiver->name,
                'email'  => $this->message->receiver->email,
            ]
        ];
    }
}
