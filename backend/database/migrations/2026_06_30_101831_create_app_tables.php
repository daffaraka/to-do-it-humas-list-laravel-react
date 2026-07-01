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
        Schema::create('kpis', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('department_id')->constrained('departments');
            $table->foreignUuid('user_id')->constrained('users');
            $table->date('target_date');
            $table->timestamps();
        });

        Schema::create('boards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('user_id')->constrained('users');
            $table->foreignUuid('department_id')->constrained('departments');
            $table->foreignUuid('kpi_id')->nullable()->constrained('kpis')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->text('description');
            $table->string('document_link')->nullable();
            $table->foreignUuid('pic_id')->nullable()->constrained('users');
            $table->foreignUuid('board_id')->constrained('boards')->cascadeOnDelete();
            $table->date('request_date')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('low');
            $table->enum('column_id', ['new', 'progress', 'done'])->default('new');
            $table->foreignUuid('department_id')->constrained('departments');
            $table->integer('position')->default(0);
            $table->timestamps();
        });

        Schema::create('checklists', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('text');
            $table->boolean('completed')->default(false);
            $table->timestamps();
        });

        Schema::create('task_labels', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->string('label_id');
            $table->unique(['task_id', 'label_id']);
            $table->timestamps();
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('text');
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->string('link')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('task_labels');
        Schema::dropIfExists('checklists');
        Schema::dropIfExists('tasks');
        Schema::dropIfExists('boards');
        Schema::dropIfExists('kpis');
    }
};
