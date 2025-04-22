<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\ProjectCoordinator;
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

            // إنشاء سجل في جدول المنسقين
            ProjectCoordinator::create([
                'userId' => $coordinator->userId
            ]);

            echo "Project Coordinator Created: " . $coordinator->email . "\n";
            echo "Project Coordinator record added to project_coordinators table.\n";
        } else {
            // التحقق من وجود سجل في جدول المنسقين
            $coordinatorRecord = ProjectCoordinator::where('userId', $coordinator->userId)->first();
            
            if (!$coordinatorRecord) {
                ProjectCoordinator::create([
                    'userId' => $coordinator->userId
                ]);
                echo "Added missing coordinator record to project_coordinators table.\n";
            }
            
            echo "Project Coordinator already exists: " . $coordinator->email . "\n";
        }
    }
}