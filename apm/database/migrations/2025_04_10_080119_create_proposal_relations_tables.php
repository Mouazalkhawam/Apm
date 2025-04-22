<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // جدول أعضاء الفريق (طلاب)
        Schema::create('proposal_team_members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proposal_id');
            $table->unsignedBigInteger('student_id');
            
            $table->foreign('proposal_id')->references('proposalId')->on('project_proposals')->onDelete('cascade');
            $table->foreign('student_id')->references('studentId')->on('students')->onDelete('cascade');
        });

        // جدول المشرفين على المقترح
        Schema::create('proposal_supervisors', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proposal_id');
            $table->unsignedBigInteger('supervisor_id');
            
            $table->foreign('proposal_id')->references('proposalId')->on('project_proposals')->onDelete('cascade');
            $table->foreign('supervisor_id')->references('supervisorId')->on('supervisors')->onDelete('cascade');
        });

        // جدول الخبراء (إن كنت تريدها)
        Schema::create('proposal_experts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proposal_id');
            $table->string('name');
            $table->string('specialization')->nullable();
            $table->string('phone')->nullable();
            
            $table->foreign('proposal_id')->references('proposalId')->on('project_proposals')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proposal_relations_tables');
    }
};
