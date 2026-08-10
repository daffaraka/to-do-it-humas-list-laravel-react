<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Board;
use App\Models\Department;
use App\Models\User;
use App\Models\TaskLabel;
use Carbon\Carbon;

class TestPublikasiMeetingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $boards = Board::all();
        $departments = Department::all();
        $users = User::all();

        if ($boards->isEmpty() || $departments->isEmpty()) {
            $this->command->warn('Tabel boards atau departments masih kosong.');
            return;
        }

        $tasksData = [
            // Publikasi
            ['title' => 'Review Naskah Berita Website', 'desc' => 'Mengecek draft berita sebelum dipublikasikan ke website resmi.', 'type' => 'publikasi'],
            ['title' => 'Jadwal Konten Instagram Agustus', 'desc' => 'Menyusun content plan untuk IG bulan ini.', 'type' => 'publikasi'],
            ['title' => 'Press Release Acara Launching', 'desc' => 'Membuat draft press release untuk disebar ke media massa.', 'type' => 'publikasi'],
            // Meeting
            ['title' => 'Meeting Kordinasi Mingguan IT', 'desc' => 'Meeting rutin dengan tim developer membahas sprint.', 'type' => 'meeting'],
            ['title' => 'Meeting Evaluasi Vendor', 'desc' => 'Evaluasi performa vendor layanan cloud kuartal ini.', 'type' => 'meeting'],
            ['title' => 'Townhall Bulanan Perusahaan', 'desc' => 'Persiapan materi townhall meeting.', 'type' => 'meeting'],
        ];

        $priorities = ['low', 'medium', 'high'];
        $columns = ['new', 'progress', 'done'];

        $this->command->info('Membuat data test Publikasi dan Meeting...');

        foreach ($tasksData as $i => $data) {
            $board = $boards->random();
            $dept = $board->department_id ? Department::find($board->department_id) : $departments->random();
            $pic = $users->isNotEmpty() ? $users->random()->id : null;

            // Random tanggal antara hari ini sampai +7 hari
            $randomDays = rand(0, 7);
            $reqDate = Carbon::now()->addDays($randomDays);
            $dueDate = (clone $reqDate)->addDays(rand(1, 7));
            $columnId = $columns[array_rand($columns)];
            
            $newDate = null;
            $prosesDate = null;
            $endDate = null;

            if ($columnId === 'new') {
                $newDate = Carbon::now()->addDays($randomDays);
            } elseif ($columnId === 'progress') {
                $newDate = Carbon::now()->addDays($randomDays - 2);
                $prosesDate = Carbon::now()->addDays($randomDays);
            } elseif ($columnId === 'done') {
                $newDate = Carbon::now()->addDays($randomDays - 4);
                $prosesDate = Carbon::now()->addDays($randomDays - 2);
                $endDate = Carbon::now()->addDays($randomDays);
            }

            $task = Task::create([
                'title' => $data['title'],
                'description' => $data['desc'],
                'board_id' => $board->id,
                'department_id' => $dept ? $dept->id : $departments->random()->id,
                'pic_id' => $pic,
                'request_date' => $reqDate->format('Y-m-d'),
                'due_date' => $dueDate->format('Y-m-d'),
                'priority' => $priorities[array_rand($priorities)],
                'column_id' => $columnId,
                'position' => $i,
                'new_date' => $newDate,
                'proses_date' => $prosesDate,
                'end_date' => $endDate,
            ]);

            // Assign Label (Badge)
            $labelId = $data['type'] === 'publikasi' ? 'l9' : 'l10';
            TaskLabel::create([
                'task_id' => $task->id,
                'label_id' => $labelId
            ]);
        }

        $this->command->info('Test data Publikasi & Meeting berhasil dibuat!');
    }
}
