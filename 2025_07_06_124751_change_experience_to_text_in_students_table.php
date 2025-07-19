<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // الخطوة 1: إنشاء حقل مؤقت لتخزين البيانات القديمة
        Schema::table('students', function (Blueprint $table) {
            $table->text('temp_experience')->nullable()->after('experience');
        });

        // الخطوة 2: تحويل البيانات من JSON إلى نص عادي
        $students = DB::table('students')->whereNotNull('experience')->get();
        
        foreach ($students as $student) {
            try {
                $experienceData = json_decode($student->experience, true);
                $textContent = '';
                
                if (is_array($experienceData)) {
                    foreach ($experienceData as $item) {
                        if (isset($item['content'])) {
                            $textContent .= $item['content'] . "\n\n";
                        }
                    }
                } else {
                    $textContent = $student->experience;
                }
                
                DB::table('students')
                    ->where('studentId', $student->studentId)
                    ->update(['temp_experience' => trim($textContent)]);
            } catch (\Exception $e) {
                // في حالة الخطأ، ننسخ البيانات كما هي
                DB::table('students')
                    ->where('studentId', $student->studentId)
                    ->update(['temp_experience' => $student->experience]);
            }
        }

        // الخطوة 3: حذف الحقل القديم وإعادة تسمية الحقل المؤقت
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('experience');
            $table->renameColumn('temp_experience', 'experience');
            $table->dropColumn('experience_media_type');
        });
    }

    public function down()
    {
        // للتراجع عن التغييرات
        Schema::table('students', function (Blueprint $table) {
            $table->json('temp_experience')->nullable()->after('experience');
        });

        // تحويل البيانات من نص إلى JSON
        $students = DB::table('students')->whereNotNull('experience')->get();
        
        foreach ($students as $student) {
            DB::table('students')
                ->where('studentId', $student->studentId)
                ->update([
                    'temp_experience' => json_encode([
                        [
                            'type' => 'text',
                            'content' => $student->experience
                        ]
                    ])
                ]);
        }

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('experience');
            $table->renameColumn('temp_experience', 'experience');
            $table->string('experience_media_type')->nullable()->after('experience');
        });
    }
};