<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // For older MariaDB versions, use raw SQL to rename the column
        DB::statement('ALTER TABLE students CHANGE experience old_experience TEXT NULL');

        // Create the new JSON column
        Schema::table('students', function (Blueprint $table) {
            $table->json('experience')->nullable()->after('userId');
        });

        // Migrate the data
        $students = DB::table('students')->whereNotNull('old_experience')->get();
        
        foreach ($students as $student) {
            try {
                $jsonData = json_decode($student->old_experience, true);
                
                if (json_last_error() === JSON_ERROR_NONE) {
                    DB::table('students')
                        ->where('studentId', $student->studentId)
                        ->update(['experience' => $student->old_experience]);
                } else {
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

        // Drop the old column
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn('old_experience');
        });

        // Add media type column
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