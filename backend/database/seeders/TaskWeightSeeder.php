<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\TaskWeight;

class TaskWeightSeeder extends Seeder
{
    public function run(): void
    {
        $weights = [
            ['level' => 'low', 'weight' => 1],
            ['level' => 'medium', 'weight' => 3],
            ['level' => 'high', 'weight' => 5],
        ];

        foreach ($weights as $w) {
            TaskWeight::firstOrCreate(
                ['level' => $w['level']],
                ['id' => Str::uuid(), 'weight' => $w['weight']]
            );
        }
    }
}
