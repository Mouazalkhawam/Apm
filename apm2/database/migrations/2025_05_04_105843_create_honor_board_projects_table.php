<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('honor_board_project', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id'); // سيتم ربطه بـ projectid في جدول projects
            $table->timestamp('featured_at')->useCurrent();
            $table->text('notes')->nullable();
            $table->timestamps();

            // تعريف المفتاح الخارجي بشكل منفصل
            $table->foreign('project_id')
                  ->references('projectid') // لأن المفتاح الأساسي في projects يسمى projectid
                  ->on('projects')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        // حذف المفتاح الخارجي أولاً
        Schema::table('honor_board_project', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
        });

        // ثم حذف الجدول
        Schema::dropIfExists('honor_board_project');
    }
};