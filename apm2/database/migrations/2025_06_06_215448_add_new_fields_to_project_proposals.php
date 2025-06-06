<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // 1. أضف الحقول الجديدة أولاً
            if (!Schema::hasColumn('project_proposals', 'project_type')) {
                $table->enum('project_type', ['term-project', 'grad-project'])->default('term-project');
            }

            if (!Schema::hasColumn('project_proposals', 'problem_studies')) {
                $table->text('problem_studies')->nullable()->after('problem_background');
            }

            if (!Schema::hasColumn('project_proposals', 'solution_studies')) {
                $table->text('solution_studies')->nullable()->after('proposed_solution');
            }

            // 2. إضافة باقي الحقول الجديدة
            $columnsToAdd = [
                'platform' => 'string',
                'tools' => 'string',
                'programming_languages' => 'string',
                'database' => 'string',
                'packages' => 'text',
                'management_plan' => 'text',
                'team_roles' => 'text'
            ];

            foreach ($columnsToAdd as $column => $type) {
                if (!Schema::hasColumn('project_proposals', $column)) {
                    $table->{$type}($column)->nullable();
                }
            }

            // 3. معالجة تغيير اسم العمود بطريقة أكثر أماناً
            if (Schema::hasColumn('project_proposals', 'problem_statement') && 
                !Schema::hasColumn('project_proposals', 'problem_description')) {
                
                // الطريقة الآمنة لتغيير اسم العمود في MariaDB
                DB::statement('ALTER TABLE project_proposals CHANGE problem_statement problem_description TEXT');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('project_proposals', function (Blueprint $table) {
            // 1. التراجع عن تغيير اسم العمود
            if (Schema::hasColumn('project_proposals', 'problem_description') && 
                !Schema::hasColumn('project_proposals', 'problem_statement')) {
                
                DB::statement('ALTER TABLE project_proposals CHANGE problem_description problem_statement TEXT');
            }

            // 2. حذف الحقول الجديدة
            $columnsToDrop = [
                'project_type',
                'problem_studies',
                'solution_studies',
                'platform',
                'tools',
                'programming_languages',
                'database',
                'packages',
                'management_plan',
                'team_roles'
            ];

            foreach ($columnsToDrop as $column) {
                if (Schema::hasColumn('project_proposals', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};