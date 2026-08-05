<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            // Index for calendar date range queries
            $table->index('due_date');
            $table->index('request_date');
            // Composite index for column + date (used in filtered kanban)
            $table->index(['column_id', 'due_date']);
            // Index board_id for boardId filter queries
            $table->index('board_id');
            // Index pic_id for myJobs queries
            $table->index(['pic_id', 'column_id']);
        });
    }

    public function down(): void
    {
        Schema::table('tasks', function (Blueprint $table) {
            $table->dropIndex(['due_date']);
            $table->dropIndex(['request_date']);
            $table->dropIndex(['column_id', 'due_date']);
            $table->dropIndex(['board_id']);
            $table->dropIndex(['pic_id', 'column_id']);
        });
    }
};
