<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('alumni', function (Blueprint $table) {
            $table->id('alumniId');  
            $table->unsignedBigInteger('userId'); 
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade'); 
            $table->year('graduationYear');
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('alumni');
    }
};

