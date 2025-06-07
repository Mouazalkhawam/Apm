<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('academic_period_project', function (Blueprint $table) {
            $table->unsignedBigInteger('academic_period_id');
            $table->unsignedBigInteger('project_projectid');
            
            $table->foreign('academic_period_id')
                  ->references('id')
                  ->on('academic_periods')
                  ->onDelete('cascade');
                  
            $table->foreign('project_projectid')
                  ->references('projectid')
                  ->on('projects')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('academic_period_project');
    }
};