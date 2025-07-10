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
        Schema::table('project_proposals', function (Blueprint $table) {
            $table->enum('status', ['needs_revision', 'approved'])
                  ->default('needs_revision')
                  ->after('problem_mindmap_path')
                  ->comment('حالة المقترح: بحاجة لإصلاح أو مقبول');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }
};