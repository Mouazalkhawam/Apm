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
        Schema::create('project_proposals', function (Blueprint $table) {
            $table->id('proposalId');
            $table->unsignedBigInteger('leader_id');
            $table->string('title');
            $table->text('problem_statement');
            $table->text('problem_background');
            $table->string('problem_mindmap_path')->nullable();
            $table->text('proposed_solution');
            $table->string('methodology', 50)->default('Agile'); // التعديل هنا
            $table->json('technology_stack')->nullable();
            $table->timestamps();
        
            $table->foreign('leader_id')->references('studentId')->on('students')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_proposals');
    }
};
