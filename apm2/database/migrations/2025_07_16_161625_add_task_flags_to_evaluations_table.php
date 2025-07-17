<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->boolean('is_task_related')
                  ->default(false)
                  ->comment('0: not related to specific task, 1: related to student main task');
            
            $table->boolean('is_extra_task')
                  ->default(false)
                  ->comment('0: not extra task, 1: extra task deserving bonus');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn(['is_task_related', 'is_extra_task']);
        });
    }
};