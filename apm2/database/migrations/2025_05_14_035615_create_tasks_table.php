<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_stage_id');
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('assigned_to'); // FK to students.studentId
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->date('due_date');
            $table->unsignedBigInteger('assigned_by'); // FK to users.userId
            $table->timestamps();
        
            $table->foreign('project_stage_id')->references('id')->on('project_stages')->onDelete('cascade');
            $table->foreign('assigned_to')->references('studentId')->on('students')->onDelete('cascade');
            $table->foreign('assigned_by')->references('userId')->on('users')->onDelete('cascade');
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
