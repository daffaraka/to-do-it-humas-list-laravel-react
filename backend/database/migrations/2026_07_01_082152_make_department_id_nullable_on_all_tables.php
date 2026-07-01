<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = ['users', 'kpis', 'boards', 'tasks'];
        
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                // Drop existing foreign key
                $table->dropForeign(['department_id']);
                // Make column nullable
                $table->uuid('department_id')->nullable()->change();
                // Add foreign key with nullOnDelete
                $table->foreign('department_id')
                      ->references('id')
                      ->on('departments')
                      ->nullOnDelete();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['users', 'kpis', 'boards', 'tasks'];
        
        foreach ($tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                // Drop existing foreign key
                $table->dropForeign(['department_id']);
                // Make column not nullable again
                $table->uuid('department_id')->nullable(false)->change();
                // Re-add foreign key without nullOnDelete
                $table->foreign('department_id')
                      ->references('id')
                      ->on('departments');
            });
        }
    }
};
