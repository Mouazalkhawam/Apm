<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use Illuminate\Support\Facades\Hash;

class TeamLeader1Seeder extends Seeder
{
    public function run()
    {
        DB::beginTransaction();

        try {
            // 1. إنشاء مستخدم قائد الفريق
            $teamLeaderUser = User::create([
                'name' => 'قائد الفريق الافتراضي',
                'email' => 'team_leader1@example.com',
                'password' => Hash::make('password'),
                'role' => 'team_leader'
            ]);

            // 2. إنشاء سجل الطالب المرتبط
            $student = Student::create([
                'userId' => $teamLeaderUser->userId,
                // أي حقول إضافية للطالب
            ]);

            DB::commit();

            $this->command->info('تم إنشاء قائد الفريق بنجاح!');
            $this->command->info('البريد الإلكتروني: team_leader@example.com');
            $this->command->info('كلمة المرور: password');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('حدث خطأ: '.$e->getMessage());
        }
    }
}