<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Task;
use App\Models\Board;
use App\Models\Department;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class TaskSeeder extends Seeder
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
            $this->command->warn('Tabel boards atau departments masih kosong. Silakan isi dulu (lewat UI atau seeder lain) sebelum menjalankan TaskSeeder.');
            return;
        }

        $realTasks = [
            ['title' => 'Pembuatan Press Release Kegiatan Tahunan', 'desc' => 'Menyusun draft press release untuk acara tahunan perusahaan dan mendistribusikannya ke media partner.'],
            ['title' => 'Update Konten Website Profil Perusahaan', 'desc' => 'Melakukan pembaruan pada halaman About Us dan penambahan milestone terbaru perusahaan.'],
            ['title' => 'Desain Banner Promosi Bulan Depan', 'desc' => 'Membuat desain banner untuk campaign promosi bulanan, ukuran untuk web dan media sosial.'],
            ['title' => 'Pemeliharaan Server Database Utama', 'desc' => 'Melakukan patching keamanan bulanan dan optimasi query pada server database utama.'],
            ['title' => 'Audit Keamanan Aplikasi Internal', 'desc' => 'Melakukan penetration testing skala kecil pada aplikasi HRIS internal perusahaan.'],
            ['title' => 'Koordinasi dengan Tim Event Organizer', 'desc' => 'Meeting lanjutan dengan tim EO untuk membahas rundown acara peluncuran produk baru.'],
            ['title' => 'Penyusunan Laporan Social Media Bulanan', 'desc' => 'Mengumpulkan data analitik dari Instagram, Facebook, dan Twitter untuk laporan performa bulan ini.'],
            ['title' => 'Pembuatan Video Profil Singkat', 'desc' => 'Shooting dan editing video berdurasi 1 menit untuk perkenalan layanan baru.'],
            ['title' => 'Setup Jaringan Wi-Fi Kantor Cabang', 'desc' => 'Mengonfigurasi router mikrotik dan access point untuk kantor cabang baru.'],
            ['title' => 'Migrasi Email Karyawan ke Sistem Baru', 'desc' => 'Memindahkan data email dari server lama ke Google Workspace untuk tim operasional.'],
            ['title' => 'Penyusunan Draft MoU dengan Mitra Bisnis', 'desc' => 'Menyiapkan dokumen MoU untuk kerjasama strategis dengan vendor IT.'],
            ['title' => 'Kunjungan Media (Media Visit)', 'desc' => 'Melakukan kunjungan ke redaksi media cetak lokal untuk menjalin silaturahmi.'],
            ['title' => 'Review Kinerja Vendor Hosting', 'desc' => 'Mengevaluasi uptime dan respon tim support dari vendor hosting langganan.'],
            ['title' => 'Pembuatan SOP Pelayanan Publik', 'desc' => 'Menyusun standar operasional prosedur untuk penanganan keluhan pelanggan di media sosial.'],
            ['title' => 'Pengembangan Fitur Export Laporan (PDF)', 'desc' => 'Menambahkan fitur export laporan berformat PDF di aplikasi dashboard admin.'],
            ['title' => 'Monitoring Sentimen Publik (Social Listening)', 'desc' => 'Memantau percakapan netizen terkait brand kita selama masa kampanye iklan.'],
            ['title' => 'Instalasi Antivirus di Komputer Staf Baru', 'desc' => 'Memasang dan mengonfigurasi endpoint protection di 5 laptop karyawan baru.'],
            ['title' => 'Pembuatan Konten TikTok Edukasi', 'desc' => 'Brainstorming ide dan rekaman untuk 3 konten TikTok bertema edukasi penggunaan produk.'],
            ['title' => 'Optimalisasi SEO Website Utama', 'desc' => 'Memperbaiki meta tags, image alt, dan internal linking untuk meningkatkan skor SEO.'],
            ['title' => 'Pelatihan Public Speaking untuk Manajemen', 'desc' => 'Menyelenggarakan sesi workshop public speaking khusus untuk jajaran manajer.'],
            ['title' => 'Update Dokumentasi API Backend', 'desc' => 'Menulis dokumentasi Swagger untuk endpoint API versi 2.0 yang baru rilis.'],
            ['title' => 'Desain Merchandise Perusahaan', 'desc' => 'Membuat desain untuk tumbler, kaos, dan totebag untuk suvenir acara tahunan.'],
            ['title' => 'Perbaikan Bug Form Pendaftaran', 'desc' => 'Investigasi dan perbaikan masalah double-submit pada form registrasi pelanggan baru.'],
            ['title' => 'Evaluasi Kampanye Digital Ads', 'desc' => 'Menganalisa efektivitas budget iklan di Google Ads dan Facebook Ads selama bulan lalu.'],
            ['title' => 'Persiapan Konferensi Pers', 'desc' => 'Menyiapkan materi presentasi, daftar jurnalis, dan logistik untuk konferensi pers rilis produk.'],
            ['title' => 'Backup Rutin Data Aplikasi', 'desc' => 'Memastikan sistem backup otomatis berjalan dengan baik dan melakukan tes restore.'],
            ['title' => 'Penulisan Artikel Blog Mingguan', 'desc' => 'Menulis artikel blog SEO friendly dengan topik "Tips Efisiensi Kerja di Era Digital".'],
            ['title' => 'Setting Perangkat Video Conference', 'desc' => 'Memasang TV, kamera, dan mic untuk ruang meeting eksekutif lantai 3.'],
            ['title' => 'Pembuatan Katalog Produk Digital', 'desc' => 'Mengkompilasi foto dan deskripsi produk ke dalam format PDF yang interaktif.'],
            ['title' => 'Survey Kepuasan Karyawan Internal', 'desc' => 'Mendesain form kuesioner dan menyebarkannya ke seluruh divisi perusahaan.'],
        ];

        $priorities = ['low', 'medium', 'high'];
        $columns = ['new', 'progress', 'done'];

        $this->command->info('Menyiapkan 30 task random...');

        foreach ($realTasks as $i => $taskData) {
            $board = $boards->random();
            // Optional: Match department to board or pick random
            $dept = $board->department_id ? Department::find($board->department_id) : $departments->random();
            $pic = $users->isNotEmpty() ? $users->random()->id : null;

            // Random hari (mulai dari -15 hari kebelakang hingga +15 hari ke depan)
            $randomDays = rand(-15, 15);
            $reqDate = Carbon::now()->addDays($randomDays);
            
            // Due date beberapa hari setelah request
            $dueDate = (clone $reqDate)->addDays(rand(1, 14));
            
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

            Task::create([
                'title' => $taskData['title'],
                'description' => $taskData['desc'],
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
        }

        $this->command->info('30 Task berhasil dibuat!');
    }
}
