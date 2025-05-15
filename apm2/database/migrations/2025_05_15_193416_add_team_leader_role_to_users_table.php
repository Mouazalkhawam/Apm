<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'student', 
                'supervisor', 
                'coordinator', 
                'department_head', 
                'alumni', 
                'team_leader' // أضف هنا
            ])->default('student')->change();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', [
                'student', 
                'supervisor', 
                'coordinator', 
                'department_head', 
                'alumni' // أزل team_leader هنا
            ])->default('student')->change();
        });
    }
};