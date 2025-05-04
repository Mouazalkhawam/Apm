<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('group_supervisor', function (Blueprint $table) {
            $table->unsignedBigInteger('supervisorId');
            $table->unsignedBigInteger('groupid');
            $table->string('status')->default('pending');
            $table->timestamps();
        
            $table->foreign('supervisorId')->references('supervisorId')->on('supervisors')->onDelete('cascade');
            $table->foreign('groupid')->references('groupid')->on('groups')->onDelete('cascade');
            $table->primary(['supervisorId', 'groupid']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('group_supervisor');
    }
};