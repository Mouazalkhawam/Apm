<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // إضافة حقل group_id
            $table->unsignedBigInteger('group_id')->nullable()->after('proposalId');
            
            // إضافة العلاقة الخارجية
            $table->foreign('group_id')
                  ->references('groupid')
                  ->on('groups')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // حذف العلاقة الخارجية أولاً
            $table->dropForeign(['group_id']);
            
            // حذف الحقل
            $table->dropColumn('group_id');
        });
    }
};