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
            $table->uuid('kategori_program_id')->nullable();
            $table->foreign('kategori_program_id')->references('id')->on('kategori_program_kerjas')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('boards', function (Blueprint $table) {
            $table->dropForeign(['kategori_program_id']);
            $table->dropColumn('kategori_program_id');
        });
    }
};
