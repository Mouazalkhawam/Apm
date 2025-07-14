<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EvaluationCriteriaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run()
    {
        $now = Carbon::now();

        // معايير تقييم المشرفين
        $supervisorCriteria = [
            [
                'title' => 'جودة الإشراف والمتابعة',
                'description' => 'مدى فعالية الإشراف والمتابعة المستمرة (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'الدعم الفني المقدم',
                'description' => 'جودة الدعم الفني والإرشادات المقدمة (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'جودة الملاحظات والتغذية الراجعة',
                'description' => 'فائدة الملاحظات المقدمة ووضوحها (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'التوافر والاستجابة',
                'description' => 'سرعة الاستجابة والتوفر عند الحاجة (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ]
        ];

        // معايير تقييم إدارة المشاريع
        $projectManagementCriteria = [
            [
                'title' => 'فعالية التخطيط للمشروع',
                'description' => 'مدى كفاءة التخطيط المسبق للمشروع (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'توزيع المهام والمسؤوليات',
                'description' => 'وضوح توزيع المهام والمسؤوليات بين أعضاء الفريق (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'إدارة الجدول الزمني',
                'description' => 'الالتزام بالجدول الزمني للمشروع (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'توفير الموارد',
                'description' => 'مدى كفاية الموارد المقدمة للمشروع (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ],
            [
                'title' => 'التقييم والمتابعة',
                'description' => 'فعالية نظام التقييم والمتابعة للمشروع (من 1 إلى 5)',
                'created_at' => $now,
                'updated_at' => $now
            ]
        ];

        // دمج المصفوفتين
        $allCriteria = array_merge($supervisorCriteria, $projectManagementCriteria);

        // إضافة المعايير إلى قاعدة البيانات
        DB::table('evaluation_criteria')->insert($allCriteria);
    }
}