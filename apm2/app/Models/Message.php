<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Message extends Model
{
    use HasFactory;

    protected $table = 'messages';
    protected $primaryKey = 'message_id';

    public $timestamps = false; // ✅ هذا السطر يحل مشكلتك

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'created_at', // تأكد أنه ضمن fillable لأنك تضيفه يدويًا
        'sent_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id', 'userId');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id', 'userId');
    }
}
