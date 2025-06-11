<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->dropForeign(['leader_id']);
            $table->dropColumn('leader_id');
        });
    }

    public function down()
    {
        Schema::table('meetings', function (Blueprint $table) {
            $table->unsignedBigInteger('leader_id');
            $table->foreign('leader_id')->references('studentId')->on('students')->onDelete('cascade');
        });
    }
};