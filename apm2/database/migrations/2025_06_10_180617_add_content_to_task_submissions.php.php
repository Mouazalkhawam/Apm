<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->text('content')->nullable()->after('studentId');
        });
    }

    public function down()
    {
        Schema::table('task_submissions', function (Blueprint $table) {
            $table->dropColumn('content');
        });
    }
};