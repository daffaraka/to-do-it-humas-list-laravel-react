<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TaskUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tasks = \App\Models\Task::all();
        $users = \App\Models\User::all();

        if ($tasks->count() === 0 || $users->count() < 4) {
            return;
        }

        // Add 1-3 collaborators for some tasks to simulate data
        foreach ($tasks->take(20) as $task) {
            // Pick random users who are NOT the PIC
            $collaborators = $users->where('id', '!=', $task->pic_id)->random(rand(1, 3))->pluck('id');
            $task->collaborators()->syncWithoutDetaching($collaborators);
        }
    }
}
