<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Supervisor;

class SupervisorSeeder extends Seeder
{
    public function run(): void
    {
        // 1. إنشاء مستخدم بدور "مشرف"
        $user = User::create([
            'name' => 'Dr. Ahmad Supervisor',
            'email' => 'supervisor@example.com',
            'password' => Hash::make('password123'), // استخدم باسورد آمن
            'role' => 'Supervisor', // تأكد أن الحقل موجود ويقبل هذا الدور
        ]);

        // 2. إنشاء السوبرفايزور وربطه بالمستخدم
        Supervisor::create([
            'userId' => $user->userId, // أو $user->id إذا كنت تستخدم id بدلاً من userId
        ]);
    }
}
