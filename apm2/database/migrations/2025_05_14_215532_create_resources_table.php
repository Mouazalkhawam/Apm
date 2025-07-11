<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
 // database/migrations/xxxx_create_resources_table.php
    public function up()
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id('resourceId');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['tool', 'reference', 'article']);
            $table->string('filePath')->nullable(); // للملفات المرفوعة
            $table->string('link')->nullable(); // للموارد الخارجية
            $table->foreignId('created_by')->constrained('users', 'userId');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users', 'userId');
            $table->timestamp('reviewed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
