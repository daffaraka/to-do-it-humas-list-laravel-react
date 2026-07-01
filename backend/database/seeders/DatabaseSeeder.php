<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Departments
        $deptIT = Department::create(['name' => 'IT']);
        $deptHumas = Department::create(['name' => 'Humas']);
        $deptJaringan = Department::create(['name' => 'Jaringan']);

        // 2. Create Roles
        $roleAdmin = Role::create(['name' => 'Admin']);
        $roleStaff = Role::create(['name' => 'Staff']);


        $adminIT = User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'department_id' => $deptIT->id,
            'role_id' => $roleAdmin->id,
        ]);


        // 3. Create Users
        $adminIT = User::create([
            'name' => 'Admin IT',
            'email' => 'admin.it@alazhar.id',
            'password' => Hash::make('password'),
            'department_id' => $deptIT->id,
            'role_id' => $roleAdmin->id,
        ]);

        $staffHumas = User::create([
            'name' => 'Staff Humas',
            'email' => 'staff.humas@alazhar.id',
            'password' => Hash::make('password'),
            'department_id' => $deptHumas->id,
            'role_id' => $roleStaff->id,
        ]);

        $staffJaringan = User::create([
            'name' => 'Staff Jaringan',
            'email' => 'staff.jaringan@alazhar.id',
            'password' => Hash::make('password'),
            'department_id' => $deptJaringan->id,
            'role_id' => $roleStaff->id,
        ]);

        // 4. Create KPIs
        $kpi1 = \App\Models\Kpi::create([
            'title' => 'Pengembangan Sistem Internal',
            'description' => 'Target penyelesaian aplikasi internal yayasan',
            'department_id' => $deptIT->id,
            'user_id' => $adminIT->id,
            'target_date' => now()->addMonths(3),
        ]);

        $kpiHumas = \App\Models\Kpi::create([
            'title' => 'Peningkatan Brand Awareness PPDB',
            'description' => 'Target publikasi promosi PPDB Yayasan Al-Azhar',
            'department_id' => $deptHumas->id,
            'user_id' => $staffHumas->id,
            'target_date' => now()->addMonths(2),
        ]);

        // 5. Create Boards
        $boardApp = \App\Models\Board::create([
            'title' => 'To-Do List App',
            'description' => 'Board untuk tracking pengembangan to-do list app',
            'user_id' => $adminIT->id,
            'department_id' => $deptIT->id,
            'kpi_id' => $kpi1->id,
        ]);

        $boardJaringan = \App\Models\Board::create([
            'title' => 'Maintenance Jaringan',
            'description' => 'Board perbaikan infrastruktur jaringan rutin',
            'user_id' => $staffJaringan->id,
            'department_id' => $deptJaringan->id,
        ]);

        $boardHumas = \App\Models\Board::create([
            'title' => 'Publikasi & Media PPDB',
            'description' => 'Board promosi PPDB dan media sosial yayasan',
            'user_id' => $staffHumas->id,
            'department_id' => $deptHumas->id,
            'kpi_id' => $kpiHumas->id,
        ]);

        // 6. Create Tasks (IT Board)
        $task1 = \App\Models\Task::create([
            'title' => 'Setup Laravel Backend',
            'description' => 'Migrasi dari Express ke Laravel 12 beserta Sanctum',
            'board_id' => $boardApp->id,
            'department_id' => $deptIT->id,
            'pic_id' => $adminIT->id,
            'priority' => 'high',
            'column_id' => 'done',
            'position' => 0,
            'request_date' => now()->subDays(2),
            'due_date' => now(),
        ]);

        $task2 = \App\Models\Task::create([
            'title' => 'Setup Vite React',
            'description' => 'Ubah frontend-next ke Vite dan konfigurasi Tailwind v4',
            'board_id' => $boardApp->id,
            'department_id' => $deptIT->id,
            'pic_id' => $adminIT->id,
            'priority' => 'medium',
            'column_id' => 'progress',
            'position' => 1,
            'request_date' => now()->subDays(1),
            'due_date' => now()->addDays(4),
        ]);

        $task3 = \App\Models\Task::create([
            'title' => 'Integrasi API Sanctum',
            'description' => 'Integrasi middleware token bearer antara frontend React dan backend Laravel',
            'board_id' => $boardApp->id,
            'department_id' => $deptIT->id,
            'pic_id' => $adminIT->id,
            'priority' => 'high',
            'column_id' => 'progress',
            'position' => 2,
            'request_date' => now(),
            'due_date' => now()->addDays(3),
        ]);

        $task4 = \App\Models\Task::create([
            'title' => 'Refactoring CSS & Responsive Layout',
            'description' => 'Penyesuaian tata letak Kanban agar responsif di mobile dan tablet',
            'board_id' => $boardApp->id,
            'department_id' => $deptIT->id,
            'pic_id' => $adminIT->id,
            'priority' => 'low',
            'column_id' => 'new',
            'position' => 3,
            'request_date' => now()->addDays(1),
            'due_date' => now()->addDays(5),
        ]);

        // Jaringan Tasks
        \App\Models\Task::create([
            'title' => 'Pengecekan Access Point Gedung Pusat',
            'description' => 'Melakukan restart dan pengecekan sinyal drop di lantai 2 gedung pusat',
            'board_id' => $boardJaringan->id,
            'department_id' => $deptJaringan->id,
            'pic_id' => $staffJaringan->id,
            'priority' => 'high',
            'column_id' => 'done',
            'position' => 0,
            'request_date' => now()->subDays(3),
            'due_date' => now()->subDays(2),
        ]);

        \App\Models\Task::create([
            'title' => 'Instalasi Switch Hub Lantai 3',
            'description' => 'Pemasangan switch hub gigabit baru di rak server lantai 3',
            'board_id' => $boardJaringan->id,
            'department_id' => $deptJaringan->id,
            'pic_id' => $staffJaringan->id,
            'priority' => 'medium',
            'column_id' => 'progress',
            'position' => 1,
            'request_date' => now()->subDays(1),
            'due_date' => now()->addDays(2),
        ]);

        \App\Models\Task::create([
            'title' => 'Konfigurasi Router Mikrotik Utama',
            'description' => 'Update firewall rule dan load balancing untuk ISP cadangan',
            'board_id' => $boardJaringan->id,
            'department_id' => $deptJaringan->id,
            'pic_id' => $staffJaringan->id,
            'priority' => 'high',
            'column_id' => 'new',
            'position' => 2,
            'request_date' => now(),
            'due_date' => now()->addDays(3),
        ]);

        // Humas Tasks
        \App\Models\Task::create([
            'title' => 'Desain Banner Promosi PPDB',
            'description' => 'Membuat aset desain banner ukuran 4x3 meter untuk gerbang depan yayasan',
            'board_id' => $boardHumas->id,
            'department_id' => $deptHumas->id,
            'pic_id' => $staffHumas->id,
            'priority' => 'high',
            'column_id' => 'done',
            'position' => 0,
            'request_date' => now()->subDays(4),
            'due_date' => now()->subDays(2),
        ]);

        \App\Models\Task::create([
            'title' => 'Pembuatan Video Profil Sekolah',
            'description' => 'Mengambil stock shot kegiatan siswa dan melakukan editing video pendek durasi 2 menit',
            'board_id' => $boardHumas->id,
            'department_id' => $deptHumas->id,
            'pic_id' => $staffHumas->id,
            'priority' => 'medium',
            'column_id' => 'progress',
            'position' => 1,
            'request_date' => now()->subDays(1),
            'due_date' => now()->addDays(5),
        ]);

        \App\Models\Task::create([
            'title' => 'Posting Instagram Feed Harian',
            'description' => 'Membuat konten dan caption untuk promosi beasiswa prestasi PPDB Al-Azhar',
            'board_id' => $boardHumas->id,
            'department_id' => $deptHumas->id,
            'pic_id' => $staffHumas->id,
            'priority' => 'low',
            'column_id' => 'new',
            'position' => 2,
            'request_date' => now(),
            'due_date' => now()->addDays(2),
        ]);

        // 7. Create Checklists
        \App\Models\Checklist::create([
            'task_id' => $task1->id,
            'text' => 'Buat Migration',
            'completed' => true,
        ]);

        \App\Models\Checklist::create([
            'task_id' => $task1->id,
            'text' => 'Buat Controller',
            'completed' => true,
        ]);

        \App\Models\Checklist::create([
            'task_id' => $task2->id,
            'text' => 'Inisialisasi Project React + Vite',
            'completed' => true,
        ]);

        \App\Models\Checklist::create([
            'task_id' => $task2->id,
            'text' => 'Instalasi Zustand & Axios',
            'completed' => false,
        ]);
    }
}
