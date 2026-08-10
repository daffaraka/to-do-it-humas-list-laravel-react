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
        Schema::create('labels', function (Blueprint $table) {
            $table->string('id')->primary(); // we use 'l1', 'l9' etc.
            $table->string('name');
            $table->string('color');
            $table->timestamps();
        });

        // Seed default labels using Tailwind classes
        DB::table('labels')->insert([
            ['id' => 'l1', 'name' => 'Bug', 'color' => 'bg-red-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l2', 'name' => 'Feature', 'color' => 'bg-indigo-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l3', 'name' => 'Enhancement', 'color' => 'bg-purple-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l4', 'name' => 'Documentation', 'color' => 'bg-cyan-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l5', 'name' => 'Design', 'color' => 'bg-pink-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l6', 'name' => 'Urgent', 'color' => 'bg-amber-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l8', 'name' => 'Frontend', 'color' => 'bg-blue-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l9', 'name' => 'Publikasi', 'color' => 'bg-emerald-500 text-white', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 'l10', 'name' => 'Meeting', 'color' => 'bg-purple-500 text-white', 'created_at' => now(), 'updated_at' => now()],
        ]);

        Schema::table('task_labels', function (Blueprint $table) {
            $table->foreign('label_id')->references('id')->on('labels')->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('task_labels', function (Blueprint $table) {
            $table->dropForeign(['label_id']);
        });

        Schema::dropIfExists('labels');
    }
};
