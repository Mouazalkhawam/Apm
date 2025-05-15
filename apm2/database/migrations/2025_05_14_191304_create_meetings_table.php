<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('leader_id');
            $table->unsignedBigInteger('supervisor_id');
            $table->text('description')->nullable();
            $table->dateTime('meeting_time');
            $table->enum('status', ['proposed', 'tentative', 'confirmed', 'canceled'])->default('proposed');
            $table->timestamps();
            
            // تعريف المفاتيح الخارجية مع الأسماء الصحيحة للحقول
            $table->foreign('group_id')->references('groupid')->on('groups')->onDelete('cascade');
            $table->foreign('leader_id')->references('studentId')->on('students')->onDelete('cascade');
            $table->foreign('supervisor_id')->references('supervisorId')->on('supervisors')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('meetings');
    }
};