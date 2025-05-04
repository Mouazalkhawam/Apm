<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // نوع الإشعار (مثال: proposal_submitted, status_changed)
            $table->morphs('notifiable'); // علاقة مع المستخدمين أو أي نموذج آخر
            $table->text('data'); // بيانات الإشعار (JSON)
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('notifications');
    }
};  