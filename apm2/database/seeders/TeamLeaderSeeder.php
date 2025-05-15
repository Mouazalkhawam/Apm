<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TeamLeaderSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'قائد الفريق الافتراضي',
            'email' => 'team_leader@example.com',
            'password' => Hash::make('password'), // كلمة مرور قابلة للتغيير
            'role' => 'team_leader'
        ]);
    }
}