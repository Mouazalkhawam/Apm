<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('schedules', function (Blueprint $table) {
            // إضافة الحقول الجديدة
            $table->unsignedBigInteger('group_id')->nullable()->after('type');
            $table->time('time')->nullable()->after('group_id');
            $table->string('location')->nullable()->after('time');
            $table->text('notes')->nullable()->after('location');

            // إضافة المفتاح الخارجي
            $table->foreign('group_id')
                  ->references('groupid')
                  ->on('groups')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('schedules', function (Blueprint $table) {
            // حذف المفتاح الخارجي أولاً
            $table->dropForeign(['group_id']);
            
            // حذف الحقول المضافة
            $table->dropColumn(['group_id', 'time', 'location', 'notes']);
        });
    }
};