<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $columns = [
            'Nama',
            'Tanggal',
            'Perilaku yang sudah dilakukan (Kemarin)',
            '7 Habits',
            'Fasilitator',
            'Perilaku Favorit (Beri simbol bintang pada salah satu nama)',
            'Irisan Nilai Avicenna Way Lainnya',
        ];

        DB::table('avicenna_way_sheets')->orderBy('id')->each(function ($sheet) use ($columns) {
            $rows = json_decode($sheet->rows, true) ?: [[]];
            $rows = array_map(function (array $row) use ($columns) {
                return array_pad(array_slice($row, 0, count($columns)), count($columns), '');
            }, $rows);

            DB::table('avicenna_way_sheets')->where('id', $sheet->id)->update([
                'columns' => json_encode($columns),
                'rows' => json_encode($rows),
            ]);
        });
    }

    public function down(): void
    {
        // The previous column labels are not restored to avoid overwriting user-entered data.
    }
};
