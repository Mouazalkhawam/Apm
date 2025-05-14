<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_student', function (Blueprint $table) {
            $table->boolean('is_leader')->default(false)->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('group_student', function (Blueprint $table) {
            $table->dropColumn('is_leader');
        });
    }
};