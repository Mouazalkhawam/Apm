<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $primaryKey = 'message_id';
    public $timestamps = false;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'sent_at'
    ];

    protected $dates = ['created_at', 'sent_at', 'deleted_at'];

    // العلاقة مع المرسل
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    // العلاقة مع المستقبل
    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}