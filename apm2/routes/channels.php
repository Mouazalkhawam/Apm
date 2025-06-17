<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\User;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('notifications.{userId}', function (User $user, $userId) {
    return (int) $user->userId === (int) $userId;
});

// قناة عامة يمكنك إضافتها إذا كنت بحاجة إليها
Broadcast::channel('global.notifications', function ($user) {
    return $user !== null; // أي مستخدم مصادق عليه يمكنه الاستماع
});