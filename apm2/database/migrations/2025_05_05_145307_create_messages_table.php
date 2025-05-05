<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        if (!Schema::hasTable('messages')) {
            Schema::create('messages', function (Blueprint $table) {
                $table->id('message_id');
                
                // الحقول التي تريد الاحتفاظ بها
                $table->unsignedBigInteger('sender_id');
                $table->unsignedBigInteger('receiver_id');
                $table->text('content');
                $table->boolean('is_read')->default(false);
                $table->timestamp('created_at')->useCurrent();
                $table->timestamp('sent_at')->useCurrent();
                $table->softDeletes();
                
                // إضافة الفهارس
                $table->index('sender_id');
                $table->index('receiver_id');
            });

            // إضافة القيود الخارجية بشكل منفصل
            Schema::table('messages', function (Blueprint $table) {
                $table->foreign('sender_id')
                      ->references('userId')
                      ->on('users')
                      ->onDelete('cascade')
                      ->onUpdate('cascade');
                      
                $table->foreign('receiver_id')
                      ->references('userId')
                      ->on('users')
                      ->onDelete('cascade')
                      ->onUpdate('cascade');
            });
        }
    }

    public function down()
    {
        Schema::table('messages', function (Blueprint $table) {
            // حذف القيود الخارجية بأسمائها الصحيحة
            $table->dropForeign(['messages_sender_id_foreign']);
            $table->dropForeign(['messages_receiver_id_foreign']);
        });
        
        Schema::dropIfExists('messages');
    }
};