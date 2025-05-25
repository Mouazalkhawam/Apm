<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('university_number', 20)
                  ->nullable()
                  ->after('userId')
                  ->comment('الرقم الجامعي');

            $table->string('major', 100)
                  ->nullable()
                  ->after('university_number')
                  ->comment('التخصص');

            $table->integer('academic_year')
                  ->nullable()
                  ->after('major')
                  ->comment('السنة الدراسية');
        });
    }

    public function down()
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['university_number', 'major', 'academic_year']);
        });
    }
};