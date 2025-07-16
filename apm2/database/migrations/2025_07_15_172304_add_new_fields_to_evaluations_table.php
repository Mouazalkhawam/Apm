<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('evaluations', function (Blueprint $table) {
            // حقول مخططات التصميم
            $table->integer('class_diagram')->nullable()->after('analytical_study');
            $table->integer('erd_diagram')->nullable()->after('class_diagram');
            
            // حقول التوثيق والعرض
            $table->integer('documentation')->nullable()->after('project_management');
            $table->integer('final_presentation')->nullable()->after('documentation');
            
          
        });
    }

    public function down()
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropColumn([
                'class_diagram',
                'erd_diagram',
                'documentation',
                'final_presentation'               
            ]);
        });
    }
};