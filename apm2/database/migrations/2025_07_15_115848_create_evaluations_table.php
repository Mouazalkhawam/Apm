<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id('evaluationId');
            $table->unsignedBigInteger('groupId');
            $table->unsignedBigInteger('scheduleId')->nullable(); // تغيير من discussionId إلى scheduleId
            $table->enum('type', ['individual', 'group']);
            $table->unsignedBigInteger('studentId')->nullable();
            $table->enum('stage', ['discussion', 'analytical', 'final']);
            
            // معايير التقييم
            $table->integer('problem_definition')->nullable();
            $table->integer('theoretical_study')->nullable();
            $table->integer('reference_study')->nullable();
            $table->integer('analytical_study')->nullable();
            $table->integer('front_back_connection')->nullable();
            $table->integer('requirements_achievement')->nullable();
            $table->integer('project_management')->nullable();
            
            // معايير فردية
            $table->integer('punctuality')->nullable();
            $table->integer('participation')->nullable();
            $table->integer('helpfulness')->nullable();
            $table->integer('task_completion')->nullable();
            
            $table->text('notes')->nullable();
            $table->boolean('is_final')->default(false);
            $table->timestamps();

            // المفاتيح الخارجية المعدلة
            $table->foreign('groupId')->references('groupid')->on('groups')->onDelete('cascade');
            $table->foreign('scheduleId')->references('scheduledId')->on('schedules')->onDelete('set null');
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('evaluations');
    }
};