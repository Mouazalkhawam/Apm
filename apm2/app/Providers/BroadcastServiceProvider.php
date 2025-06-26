<?php

namespace App\Providers;

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\ServiceProvider;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot()
    {
        Broadcast::routes(['middleware' => ['auth:api']]);
        
        require base_path('routes/channels.php');
        
        // تأكد من أن المستخدم مصرح له
        Broadcast::channel('private-chat.{userId}', function ($user, $userId) {
            return (int) $user->id === (int) $userId;
        });
    }
}
