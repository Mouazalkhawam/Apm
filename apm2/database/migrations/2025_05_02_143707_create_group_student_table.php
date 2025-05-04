<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_student', function (Blueprint $table) {
            $table->unsignedBigInteger('studentId');
            $table->unsignedBigInteger('groupid');
            $table->string('status')->default('pending');
            $table->timestamps();
        
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('cascade');
            $table->foreign('groupid')->references('groupid')->on('groups')->onDelete('cascade');
            $table->primary(['studentId', 'groupid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_student');
    }
};