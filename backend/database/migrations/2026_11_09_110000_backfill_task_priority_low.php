<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tasks')
            ->whereNull('priority')
            ->update(['priority' => 'low']);
    }

    public function down(): void
    {
        // Existing task priorities are intentionally not reverted.
    }
};
