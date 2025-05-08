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
        Schema::create('project_stages', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_id');
            $table->string('title'); // مثل: "تحليل النظام", "التصميم", ...
            $table->text('description')->nullable();
            $table->date('due_date'); // لا حاجة لتاريخ البداية
            $table->integer('order')->default(0); // ترتيب المرحلة ضمن المشروع
            $table->timestamps();
    
            $table->foreign('project_id')->references('projectid')->on('projects')->onDelete('cascade');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_stages');
    }
};
