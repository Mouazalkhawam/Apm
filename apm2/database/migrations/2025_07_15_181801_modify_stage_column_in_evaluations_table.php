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
    DB::statement("ALTER TABLE evaluations MODIFY COLUMN stage ENUM('discussion', 'analytical', 'final', 'مرحلية', 'تحليلية', 'نهائية')");
}

public function down()
{
    DB::statement("ALTER TABLE evaluations MODIFY COLUMN stage ENUM('discussion', 'analytical', 'final')");
}
};
