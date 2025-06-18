<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

  public function __construct(Message $message)
{
    if (!$message->exists) {
        Log::error('Attempt to broadcast non-existent message');
        throw new \Exception('Message does not exist');
    }
    
    $this->message = $message->loadMissing(['sender', 'receiver']);
}

    public function broadcastOn()
    {
        return new PrivateChannel('chat.' . $this->message->receiver_id);
    }

    public function broadcastAs()
    {
        return 'new.message';
    }

    public function broadcastWith()
{
    return [
        'message_id' => $this->message->message_id, // استخدم message_id بدل id
        'content' => $this->message->content,
        'sender' => $this->message->sender,
        'receiver' => $this->message->receiver,
        'created_at' => $this->message->created_at
    ];
}
}