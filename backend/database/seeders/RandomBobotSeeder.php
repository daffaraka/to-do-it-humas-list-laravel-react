<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Kpi;
use App\Models\Board;

class RandomBobotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Berikan nilai acak untuk WIG (Kpi)
        $kpis = Kpi::all();
        foreach ($kpis as $kpi) {
            $kpi->update([
                'bobot_kpi' => rand(10, 100)
            ]);
        }
        $this->command->info('Berhasil mengupdate bobot_kpi secara acak untuk ' . $kpis->count() . ' WIG.');

        // Berikan nilai acak untuk Program Kerja (Board)
        $boards = Board::all();
        foreach ($boards as $board) {
            $board->update([
                'bobot_board' => rand(5, 50)
            ]);
        }
        $this->command->info('Berhasil mengupdate bobot_board secara acak untuk ' . $boards->count() . ' Program Kerja.');
    }
}
