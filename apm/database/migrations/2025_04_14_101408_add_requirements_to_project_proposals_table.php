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
        Schema::table('project_proposals', function (Blueprint $table) {
            $table->text('functional_requirements')->nullable()->after('technology_stack');
            $table->text('non_functional_requirements')->nullable()->after('functional_requirements');
        });
    }

    public function down()
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            $table->dropColumn(['functional_requirements', 'non_functional_requirements']);
        });
    }
};
