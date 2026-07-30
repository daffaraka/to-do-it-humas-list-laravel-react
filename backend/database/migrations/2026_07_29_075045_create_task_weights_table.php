<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('task_weights', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('level')->unique(); // 'low', 'medium', 'high'
            $table->integer('weight');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('task_weights');
    }
};
