<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('students', function (Blueprint $table) {
            $table->id('studentId');  
            $table->unsignedBigInteger('userId'); 
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade');            
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('students');
    }
};