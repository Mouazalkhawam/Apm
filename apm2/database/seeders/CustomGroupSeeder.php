<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Student;
use App\Models\Supervisor;
use App\Models\Project;
use App\Models\Group;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class CustomGroupSeeder extends Seeder
{
    public function run()
    {
        DB::beginTransaction();

        try {
            // 1. إنشاء أو جلب قائد الفريق (User)
            $teamLeader = User::firstOrCreate(
                ['email' => 'team_leader1@example.com'],
                [
                    'name' => 'قائد الفريق الافتراضي',
                    'password' => Hash::make('password'),
                    'role' => 'team_leader'
                ]
            );

            // 2. إنشاء أو جلب سجل الطالب المرتبط بقائد الفريق (Student)
            $studentLeader = Student::firstOrCreate(
                ['userId' => $teamLeader->userId]
            );

            // 3. إنشاء أو جلب المشرف (User)
            $supervisorUser = User::firstOrCreate(
                ['email' => 'supervisor@university.edu'],
                [
                    'name' => 'المشرف الافتراضي',
                    'password' => Hash::make('password'),
                    'role' => 'supervisor'
                ]
            );

            // 4. إنشاء أو جلب سجل المشرف في جدول supervisors
            $supervisor = Supervisor::firstOrCreate(
                ['userId' => $supervisorUser->userId]
            );

            // 5. جلب الطلاب (Students) المرتبطين بالمستخدمين حسب الإيميل
            $students = Student::whereIn('userId', function($query) {
                $query->select('userId')->from('users')->whereIn('email', ['ranim@example.com']);
            })->get();

            // 6. إنشاء أو جلب المشروع
            $project = Project::firstOrCreate(
                ['title' => 'مشروع الذكاء الاصطناعي المتقدم'],
                [
                    'description' => 'تطوير نظام توصيات ذكي',
                    'startdate' => now(),
                    'enddate' => now()->addMonths(6),
                    'status' => 'in_progress',
                    'headid' => $teamLeader->userId,
                ]
            );

            if (!$project || !$project->projectid) {
                throw new \Exception('فشل في إنشاء أو الحصول على المشروع');
            }

            // 7. إنشاء أو جلب المجموعة
            $group = Group::firstOrCreate(
                ['projectid' => $project->projectid, 'name' => 'فريق الذكاء الاصطناعي']
            );

            if (!$group || !$group->groupId) {
                throw new \Exception('فشل في إنشاء أو الحصول على المجموعة');
            }

            $this->command->info('Project ID: ' . $project->projectid);
            $this->command->info('Group ID: ' . $group->groupId);

            // 8. ربط الطلاب بالمجموعة
            foreach ($students as $student) {
                $this->command->info('ربط الطالب: ' . $student->user->email);
                DB::table('group_student')->updateOrInsert(
                    [
                        'studentId' => $student->studentId,
                        'groupId' => $group->groupId,
                    ],
                    [
                        'status' => 'approved',
                        'created_at' => Carbon::now(),
                        'updated_at' => Carbon::now()
                    ]
                );
            }

            // 9. ربط قائد الفريق كطالب بالمجموعة مع وضعه كقائد
            DB::table('group_student')->updateOrInsert(
                [
                    'studentId' => $studentLeader->studentId,
                    'groupId' => $group->groupId,
                ],
                [
                    'status' => 'approved',
                    'is_leader' => true,  // تأكد أن الحقل موجود في الجدول
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]
            );

            // 10. ربط المشرف بالمجموعة باستخدام supervisorId من جدول supervisors
            DB::table('group_supervisor')->updateOrInsert(
                [
                    'supervisorId' => $supervisor->supervisorId,
                    'groupId' => $group->groupId,
                ],
                [
                    'status' => 'approved',
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now()
                ]
            );

            DB::commit();

            $this->command->info('✅ تم إنشاء المجموعة وقائد الفريق والربط بالمشرف بنجاح.');

        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('❌ حدث خطأ: ' . $e->getMessage());
        }
    }
}
