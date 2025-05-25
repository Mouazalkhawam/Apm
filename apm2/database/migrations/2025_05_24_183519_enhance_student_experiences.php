<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // 1. أولاً نغير اسم الحقل القديم مؤقتاً
        Schema::table('students', function (Blueprint $table) {
            $table->renameColumn('experience', 'old_experience');
        });

        // 2. ننشئ الحقل الجديد كـ JSON
        Schema::table('students', function (Blueprint $table) {
            $table->json('experience')->nullable()->after('userId');
        });

        // 3. ننقل البيانات القديمة مع التحويل إلى JSON
        $students = DB::table('students')->whereNotNull('old_experience')->get();
        
        foreach ($students as $student) {
            try {
                $jsonData = json_decode($student->old_experience, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    // إذا كانت البيانات بالفعل JSON
                    DB::table('students')
                        ->where('studentId', $student->studentId)
                        ->update(['experience' => $student->old_experience]);
                } else {
                    // إذا كانت بيانات نصية عادية
                    DB::table('students')
                        ->where('studentId', $student->studentId)
                        ->update([
                            'experience' => json_encode([
                                [
                                    'type' => 'text',
                                    'content' => $student->old_experience
                                ]
                            ])
                        ]);
                }
            } catch (\Exception $e) {
                // معالجة البيانات التالفة
                DB::table('students')
                    ->where('studentId', $student->studentId)
                    ->update([
                        'experience' => json_encode([
                            [
                                'type' => 'text',
                                'content' => 'Experience data migrated from old format'
                            ]
                        ])
                    ]);
            }
        }

        // 4. أخيراً نحذف الحقل القديم
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('old_experience');
        });

        // 5. إضافة حقل نوع الوسائط
        Schema::table('students', function (Blueprint $table) {
            $table->string('experience_media_type')->nullable()
                  ->comment('text, image, video, mixed')
                  ->after('experience');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->text('experience')->nullable()->change();
            $table->dropColumn('experience_media_type');
        });
    }
};