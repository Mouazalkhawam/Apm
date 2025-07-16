<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('group_student', function (Blueprint $table) {
            $table->float('individual_grade')->nullable()->after('is_leader');
        });
    }

    public function down()
    {
        Schema::table('group_student', function (Blueprint $table) {
            $table->dropColumn('individual_grade');
        });
    }
};