<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProjectCoordinator; // تأكد من وجود هذا الموديل
use Illuminate\Support\Facades\Hash;

class ProjectCoordinatorSeeder extends Seeder
{
    public function run(): void
    {
        // التحقق من وجود منسق سابق
        $coordinator = User::where('role', 'coordinator')->first();

        if (!$coordinator) {
            // إنشاء حساب جديد للمنسق
            $coordinator = User::create([
                'name' => 'Project Coordinator',
                'email' => 'coordinator@example.com',
                'password' => Hash::make('password123'),
                'role' => 'coordinator',
            ]);

            // إنشاء سجل في جدول project_coordinators
            ProjectCoordinator::create([
                'userId' => $coordinator->id, // أو userId لو كان هذا اسم العمود فعليًا
            ]);

            echo "✅ Project Coordinator Created: " . $coordinator->email . "\n";
        } else {
            echo "ℹ️ Project Coordinator already exists: " . $coordinator->email . "\n";
        }
    }
}
