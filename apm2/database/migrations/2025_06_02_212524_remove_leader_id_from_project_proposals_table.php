<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // حذف العلاقة الخارجية أولاً
            $table->dropForeign(['leader_id']);
            
            // حذف الحقل
            $table->dropColumn('leader_id');
        });
    }

    public function down()
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // إعادة الحقل في حالة التراجع
            $table->unsignedBigInteger('leader_id');
            
            // إعادة العلاقة الخارجية
            $table->foreign('leader_id')
                  ->references('studentId')
                  ->on('students')
                  ->onDelete('cascade');
        });
    }
};