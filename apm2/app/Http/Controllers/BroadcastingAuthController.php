<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;

class BroadcastingAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // تسجيل تفاصيل إضافية للتتبع
        \Log::info('Broadcast authentication details', [
            'user_id' => $request->user()->id,
            'channel' => $request->channel_name,
            'socket' => $request->socket_id
        ]);

        return Broadcast::auth($request);
    }
}