<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RealTimeNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $userId;
    public $proposalId;

    public function __construct($message, $userId, $proposalId = null)
    {
        $this->message = $message;
        $this->userId = $userId;
        $this->proposalId = $proposalId;
    }

    public function broadcastOn()
    {
        // قناة خاصة لكل مستخدم
        return new Channel('user.' . $this->userId);
    }

    public function broadcastAs()
    {
        return 'notification-event';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'proposalId' => $this->proposalId,
            'time' => now()->toDateTimeString()
        ];
    }
}