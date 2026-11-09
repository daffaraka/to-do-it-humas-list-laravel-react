<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('avicenna_way_sheets')->orderBy('id')->each(function ($sheet) {
            $rows = json_decode($sheet->rows, true) ?: [];
            $changed = false;
            foreach ($rows as &$row) {
                foreach ($row as &$cell) {
                    if ($cell === 'Perilaku yang diharapkan') {
                        $cell = '';
                        $changed = true;
                    }
                }
            }

            if ($changed) {
                DB::table('avicenna_way_sheets')->where('id', $sheet->id)->update([
                    'rows' => json_encode($rows),
                ]);
            }
        });
    }

    public function down(): void
    {
        // Placeholder values are intentionally not restored.
    }
};
