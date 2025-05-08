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
        Schema::create('stage_submissions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('project_stage_id');
            $table->timestamp('submitted_at')->nullable();
            $table->enum('status', ['pending', 'submitted', 'reviewed'])->default('pending');
            $table->decimal('grade', 5, 2)->nullable(); // يمكن استخدام float لو أردت
            $table->unsignedBigInteger('reviewed_by')->nullable(); // userId للمشرف الذي قام بالمراجعة
            $table->text('notes')->nullable();
            $table->timestamps();
    
            $table->foreign('project_stage_id')->references('id')->on('project_stages')->onDelete('cascade');
            $table->foreign('reviewed_by')->references('userId')->on('users')->onDelete('set null');
        });
    }
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stage_submissions');
    }
};
