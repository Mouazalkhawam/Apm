<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pending_tasks', function (Blueprint $table) {
            // إضافة الحقول الجديدة
            $table->unsignedBigInteger('group_id')->nullable()->after('related_id');
            $table->unsignedBigInteger('task_id')->nullable()->after('group_id');
            $table->unsignedBigInteger('stage_id')->nullable()->after('task_id');
            
            // إضافة الفهارس
            $table->index('group_id');
            $table->index('task_id');
            $table->index('stage_id');
        });
    }

    public function down(): void
    {
        Schema::table('pending_tasks', function (Blueprint $table) {
            $table->dropColumn(['group_id', 'task_id', 'stage_id']);
        });
    }
};