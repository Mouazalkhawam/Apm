<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('department_heads', function (Blueprint $table) {
            $table->id('headId');  
            $table->unsignedBigInteger('userId'); 
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade'); 
            $table->timestamps();
        });
    }

    public function down() {
        Schema::dropIfExists('department_heads');
    }
};

