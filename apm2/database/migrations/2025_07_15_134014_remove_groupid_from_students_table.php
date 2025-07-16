<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            // إزالة المفتاح الخارجي أولاً
            $table->dropForeign(['groupId']);
            
            // ثم إزالة الحقول
            $table->dropColumn(['individual_grade', 'groupId']);
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->float('individual_grade')->nullable()->after('academic_year');
            $table->unsignedBigInteger('groupId')->nullable()->after('individual_grade');
            
            $table->foreign('groupId')->references('groupid')->on('groups')->onDelete('set null');
        });
    }
};