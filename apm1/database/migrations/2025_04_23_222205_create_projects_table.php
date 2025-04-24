<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id('projectid'); // المفتاح الأساسي
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('startdate');
            $table->date('enddate');
            $table->enum('status', ['pending', 'in_progress', 'completed'])->default('pending');
            $table->unsignedBigInteger('headid');
            $table->foreign('headid')->references('id')->on('users')->onDelete('cascade');
            $table->timestamps(); // لازم هدول عشان created_at, updated_at
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
