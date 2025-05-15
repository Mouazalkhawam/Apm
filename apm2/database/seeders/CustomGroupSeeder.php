<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomGroupSeeder extends Seeder
{
    public function run()
    {
        // 1. تحديد المستخدمين المطلوبين
        $teamLeader = User::where('email', 'team_leader@example.com')->firstOrFail();
        $supervisor = User::where('email', 'supervisor@university.edu')->firstOrFail();
        $students = User::whereIn('email', ['ranim@example.com'])->get();

        // 2. إنشاء المشروع
        $project = Project::create([
            'title' => 'مشروع الذكاء الاصطناعي المتقدم',
            'description' => 'تطوير نظام توصيات ذكي',
            'startdate' => now(),
            'enddate' => now()->addMonths(6),
            'status' => 'in_progress',
            'headid' => $teamLeader->userId,
        ]);

        // 3. إنشاء المجموعة
        $group = Group::create([
            'projectid' => $project->projectid,
            'name' => 'فريق الذكاء الاصطناعي'
        ]);

        // 4. ربط الطلاب
        foreach ($students as $student) {
            DB::table('group_student')->updateOrInsert(
                [
                    'studentId' => $student->userId, // تعديل هنا إذا كان اسم العمود مختلفًا
                    'groupid' => $group->groupid
                ],
                [
                    'status' => 'approved',
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            );
        }

        // 5. ربط المشرف
        DB::table('group_supervisor')->updateOrInsert(
            [
                'supervisorId' => $supervisor->userId, // تعديل هنا إذا كان اسم العمود مختلفًا
                'groupid' => $group->groupid
            ],
            [
                'status' => 'approved',
                'created_at' => now(),
                'updated_at' => now()
            ]
        );
    }
}