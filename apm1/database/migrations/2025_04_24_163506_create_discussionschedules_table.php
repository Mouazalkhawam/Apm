<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('schedules', function (Blueprint $table) {
            $table->id('scheduledId');
            $table->date('date');
            $table->enum('type', ['مرحلية', 'تحليلية', 'نهائية']);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('schedules');
    }
};
