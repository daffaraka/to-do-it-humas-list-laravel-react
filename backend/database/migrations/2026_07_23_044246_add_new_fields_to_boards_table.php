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
        Schema::table('boards', function (Blueprint $table) {
            $table->text('kondisi_aktual')->nullable();
            $table->text('target_akhir_tahun')->nullable();
            $table->text('output_akhir')->nullable();
            $table->string('prioritas')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->dropColumn(['kondisi_aktual', 'target_akhir_tahun', 'output_akhir', 'prioritas']);
        });
    }
};
