<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
  // database/migrations/xxxx_create_peer_evaluations_table.php
    public function up()
    {
        Schema::create('peer_evaluations', function (Blueprint $table) {
            $table->id('evaluation_id');
            $table->unsignedBigInteger('evaluator_user_id');
            $table->unsignedBigInteger('evaluated_user_id');
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('criteria_id');
            $table->integer('rate')->between(1, 5);
            $table->timestamps();

            // Foreign Keys
            $table->foreign('evaluator_user_id')->references('userId')->on('users');
            $table->foreign('evaluated_user_id')->references('userId')->on('users');
            $table->foreign('group_id')->references('groupid')->on('groups');
            $table->foreign('criteria_id')->references('criteria_id')->on('evaluation_criteria');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peer_evaluations');
    }
};
