<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
{
    Schema::table('meetings', function (Blueprint $table) {
        // طريقة أكثر أماناً لإسقاط المفتاح الخارجي
        $sm = Schema::getConnection()->getDoctrineSchemaManager();
        $indexes = $sm->listTableForeignKeys('meetings');
        
        foreach ($indexes as $index) {
            if ($index->getColumns()[0] === 'leader_id') {
                $table->dropForeign($index->getName());
                break;
            }
        }
        
        $table->dropColumn('leader_id');
    });
}
    public function down()
    {
        Schema::table('meetings', function (Blueprint $table) {
            // 1. إعادة إضافة العمود leader_id
            $table->unsignedBigInteger('leader_id');
            
            // 2. إعادة إنشاء المفتاح الخارجي
            $table->foreign('leader_id')
                  ->references('studentId')
                  ->on('students')
                  ->onDelete('cascade');
        });
    }
};