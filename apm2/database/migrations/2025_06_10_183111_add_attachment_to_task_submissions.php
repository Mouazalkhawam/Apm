<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->string('attachment_path')->nullable()->after('commit_description');
            $table->string('attachment_name')->nullable()->after('attachment_path');
            $table->integer('attachment_size')->nullable()->after('attachment_name');
        });
    }

    public function down()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->dropColumn(['attachment_path', 'attachment_name', 'attachment_size']);
        });
    }
};