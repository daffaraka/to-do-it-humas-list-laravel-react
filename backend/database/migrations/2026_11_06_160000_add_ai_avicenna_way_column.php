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
            'Irisan Nilai Avicenna Way Lainnya',
            'Fasilitator',
            'Perilaku Favorit (Beri simbol bintang pada salah satu nama)',
            'AI Avicenna Way',
        ];

        DB::table('avicenna_way_sheets')->orderBy('id')->each(function ($sheet) use ($columns) {
            $oldColumns = json_decode($sheet->columns, true) ?: [];
            $oldRows = json_decode($sheet->rows, true) ?: [];
            $rows = array_map(function (array $row) use ($columns, $oldColumns) {
                $values = [];
                foreach ($columns as $column) {
                    $index = array_search($column, $oldColumns, true);
                    $values[] = $index === false ? '' : ($row[$index] ?? '');
                }
                return $values;
            }, $oldRows);

            DB::table('avicenna_way_sheets')->where('id', $sheet->id)->update([
                'columns' => json_encode($columns),
                'rows' => json_encode($rows ?: [array_fill(0, count($columns), '')]),
            ]);
        });
    }

    public function down(): void {}
};
