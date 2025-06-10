<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->string('github_repo')->nullable()->after('studentId');
            $table->string('github_commit_url')->nullable()->after('github_repo');
            $table->text('commit_description')->nullable()->after('github_commit_url');
        });
    }

    public function down()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->dropColumn(['github_repo', 'github_commit_url', 'commit_description']);
        });
    }
};