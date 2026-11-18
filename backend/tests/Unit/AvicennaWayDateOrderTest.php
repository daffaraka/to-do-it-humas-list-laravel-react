<?php

namespace Tests\Unit;

use App\Http\Controllers\API\AvicennaWayController;
use ReflectionMethod;
use Tests\TestCase;

class AvicennaWayDateOrderTest extends TestCase
{
    public function test_it_sorts_rows_descending_by_date_with_undated_rows_last(): void
    {
        $controller = app(AvicennaWayController::class);
        $method = new ReflectionMethod(AvicennaWayController::class, 'sortRowsByDateDescending');
        $method->setAccessible(true);

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

        $rows = [
            ['Budi', '2026-11-15', 'A1', '', '', '', '', ''],
            ['Andi', '', 'Tanpa tanggal 1', '', '', '', '', ''],
            ['Citra', '2026-11-18', 'Terbaru 1', '', '', '', '1', ''],
            ['Dewi', '2026-11-18', 'Terbaru 2', '', '', '', '', ''],
            ['Eka', null, 'Tanpa tanggal 2', '', '', '', '', ''],
            ['Fajar', '2026-11-17', 'Tengah', '', '', '', '', ''],
        ];

        $sorted = $method->invoke($controller, $columns, $rows);

        $this->assertSame([
            ['Citra', '2026-11-18', 'Terbaru 1', '', '', '', '1', ''],
            ['Dewi', '2026-11-18', 'Terbaru 2', '', '', '', '', ''],
            ['Fajar', '2026-11-17', 'Tengah', '', '', '', '', ''],
            ['Budi', '2026-11-15', 'A1', '', '', '', '', ''],
            ['Andi', '', 'Tanpa tanggal 1', '', '', '', '', ''],
            ['Eka', null, 'Tanpa tanggal 2', '', '', '', '', ''],
        ], $sorted);
    }
}
