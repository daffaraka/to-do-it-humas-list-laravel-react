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
        Schema::table('kpis', function (Blueprint $table) {
            $table->decimal('bobot', 8, 2)->nullable();
        });

        Schema::table('boards', function (Blueprint $table) {
            $table->decimal('bobot', 8, 2)->nullable();
        });

        // Update existing records
        DB::table('kpis')->update(['bobot' => 100]);
        DB::table('boards')->update(['bobot' => 0]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kpis', function (Blueprint $table) {
            $table->dropColumn('bobot');
        });

        Schema::table('boards', function (Blueprint $table) {
            $table->dropColumn('bobot');
        });
    }
};
