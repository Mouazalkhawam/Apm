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
            $table->unsignedBigInteger('resource_id')->nullable()->after('stage_id');
            $table->unsignedBigInteger('proposal_id')->nullable()->after('resource_id');
            $table->unsignedBigInteger('coordinator_id')->nullable()->after('supervisor_id');
            
            // إضافة الفهارس
            $table->index('resource_id');
            $table->index('proposal_id');
            $table->index('coordinator_id');
            
            // إضافة العلاقات الخارجية
            $table->foreign('resource_id')->references('resourceId')->on('resources')->onDelete('cascade');
            $table->foreign('proposal_id')->references('proposalId')->on('project_proposals')->onDelete('cascade');
            $table->foreign('coordinator_id')->references('coordinatorId')->on('project_coordinators')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('pending_tasks', function (Blueprint $table) {
            // حذف العلاقات الخارجية أولاً
            $table->dropForeign(['resource_id']);
            $table->dropForeign(['proposal_id']);
            $table->dropForeign(['coordinator_id']);
            
            // حذف الحقول
            $table->dropColumn(['resource_id', 'proposal_id', 'coordinator_id']);
        });
    }
};