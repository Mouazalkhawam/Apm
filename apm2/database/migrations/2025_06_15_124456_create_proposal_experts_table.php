<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('proposal_experts', function (Blueprint $table) {
            $table->id('expert_id');
            $table->unsignedBigInteger('proposal_id');
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('specialization')->nullable();
            $table->timestamps();

            $table->foreign('proposal_id')
                  ->references('proposalId')
                  ->on('project_proposals')
                  ->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('proposal_experts');
    }
};