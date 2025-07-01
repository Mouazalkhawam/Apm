<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Pusher\Pusher;

class PusherAuthController extends Controller
{
    public function authenticate(Request $request)
    {
        try {
            if (!auth()->check()) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $socketId = $request->input('socket_id');
            $channelName = $request->input('channel_name');

            if (empty($socketId)) {
                throw new \Exception('Socket ID is required');
            }

            if (empty($channelName)) {
                throw new \Exception('Channel name is required');
            }

            $pusher = new Pusher(
                config('broadcasting.connections.pusher.key'),
                config('broadcasting.connections.pusher.secret'),
                config('broadcasting.connections.pusher.app_id'),
                [
                    'cluster' => config('broadcasting.connections.pusher.options.cluster'),
                    'useTLS' => true,
                ]
            );

            if (str_starts_with($channelName, 'private-')) {
                $userData = [
                    'user_id' => auth()->id(),
                    'user_info' => auth()->user()->only(['name', 'email']),
                ];
                $auth = $pusher->socket_auth($channelName, $socketId, json_encode($userData));
            } else {
                $auth = $pusher->socket_auth($channelName, $socketId);
            }

            return response($auth);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}