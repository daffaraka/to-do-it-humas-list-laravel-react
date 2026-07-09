<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Insert Departments
        DB::table('departments')->insert([
            ['id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'name' => 'Departemen IT', 'created_at' => '2026-07-01 00:55:28', 'updated_at' => '2026-07-01 00:55:28'],
            ['id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'name' => 'Departemen Branding Strategi', 'created_at' => '2026-07-01 00:55:43', 'updated_at' => '2026-07-01 00:55:43'],
        ]);

        // Insert Roles
        DB::table('roles')->insert([
            ['id' => '019f1c70-1f62-718e-9094-ef2acec26511', 'name' => 'Admin', 'created_at' => '2026-06-30 23:48:57', 'updated_at' => '2026-06-30 23:48:57'],
            ['id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'name' => 'Staff', 'created_at' => '2026-06-30 23:48:57', 'updated_at' => '2026-06-30 23:48:57'],
            ['id' => '019f1ce5-1357-72a3-81a2-21d298cc5192', 'name' => 'Staff Humas Jagakarsa', 'created_at' => '2026-07-01 01:56:42', 'updated_at' => '2026-07-01 01:57:00'],
            ['id' => '019f1ce5-3c69-70a0-8ef3-27cdc89749e2', 'name' => 'Staff Humas Cinere', 'created_at' => '2026-07-01 01:56:53', 'updated_at' => '2026-07-01 01:57:08'],
            ['id' => '019f1ce5-b758-706e-9c9a-59732f89089e', 'name' => 'Staff Digital Marketing & Design Jagakarsa', 'created_at' => '2026-07-01 01:57:24', 'updated_at' => '2026-07-01 01:58:00'],
            ['id' => '019f1ce6-9bb7-7396-a2a2-a43b16beb72e', 'name' => 'Staff Digital Marketing & Design Cinere', 'created_at' => '2026-07-01 01:58:23', 'updated_at' => '2026-07-01 01:58:23'],
            ['id' => '019f1ce6-d3c2-725a-be76-b980410181f5', 'name' => 'Staff IT Support Jagakarsa', 'created_at' => '2026-07-01 01:58:37', 'updated_at' => '2026-07-01 01:58:37'],
            ['id' => '019f1ce6-fd5b-7000-9b34-7e9c50ea4c45', 'name' => 'Staff IT Support Cinere', 'created_at' => '2026-07-01 01:58:48', 'updated_at' => '2026-07-01 01:58:48'],
            ['id' => '019f1ce7-499e-7254-8707-b4aa5ee1048b', 'name' => 'Staff IT Support Pamulang', 'created_at' => '2026-07-01 01:59:07', 'updated_at' => '2026-07-01 01:59:07'],
            ['id' => '019f1ce7-7c1e-70ac-83f7-17308b63ec1f', 'name' => 'Staff IT Support BPS', 'created_at' => '2026-07-01 01:59:20', 'updated_at' => '2026-07-01 01:59:20'],
            ['id' => '019f1ce7-a88c-7078-9806-fcf5f7147810', 'name' => 'Staff Programmer BPS', 'created_at' => '2026-07-01 01:59:31', 'updated_at' => '2026-07-01 01:59:31'],
            ['id' => '019f1ce7-fc04-739d-84ce-a1cfd6961188', 'name' => 'Supervisor Branding Strategi', 'created_at' => '2026-07-01 01:59:53', 'updated_at' => '2026-07-01 01:59:53'],
            ['id' => '019f1ce8-4538-711e-b993-62728adc1cce', 'name' => 'Kepala Deparetemen IT & Branding Strategi', 'created_at' => '2026-07-01 02:00:11', 'updated_at' => '2026-07-01 02:00:11'],
        ]);

        // Insert Users
        DB::table('users')->insert([
            ['id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'name' => 'Admin', 'email' => 'admin@gmail.com', 'password' => '$2y$12$wlJro5.QMQQnNeXqejGSoeU7O50kzpwPBPS6I6QxAq9oTlhK4NFbm', 'department_id' => null, 'role_id' => '019f1c70-1f62-718e-9094-ef2acec26511', 'created_at' => '2026-06-30 23:48:58', 'updated_at' => '2026-06-30 23:48:58'],
            ['id' => '019f1c70-2154-739f-9280-2d6e544dc029', 'name' => 'Admin IT', 'email' => 'admin.it@alazhar.id', 'password' => '$2y$12$Ke9zbXtXBRx7y21aMrYzUO/hb14jhsN4B.L8t1.vDtr2499tjXiCy', 'department_id' => null, 'role_id' => '019f1c70-1f62-718e-9094-ef2acec26511', 'created_at' => '2026-06-30 23:48:58', 'updated_at' => '2026-06-30 23:48:58'],
            ['id' => '019f1cdc-4708-71df-a4eb-6935afa94af3', 'name' => 'Tommy Hendrawan', 'email' => 'tommy@gmail.com', 'password' => '$2y$12$QUNLR6/pEWgSb9RYZ8ESyevB5rvRYvLUXhv0Ml2hxZfij1/aPFOVi', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1ce8-4538-711e-b993-62728adc1cce', 'created_at' => '2026-07-01 01:47:05', 'updated_at' => '2026-07-01 02:00:28'],
            ['id' => '019f1cdc-ea5f-7299-a2c6-c7f7d3954461', 'name' => 'Vian Novianto', 'email' => 'vian@gmail.com', 'password' => '$2y$12$KIUU9OdK46AQG5M.E1mI2OGtxqagSozh02MaaMLdk.7G5ZiBhYEPi', 'department_id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'role_id' => '019f1ce7-fc04-739d-84ce-a1cfd6961188', 'created_at' => '2026-07-01 01:47:47', 'updated_at' => '2026-07-01 02:00:38'],
            ['id' => '019f1cdd-58f3-7276-ad70-10653ba7ae20', 'name' => 'Fajrul Fithri', 'email' => 'fajrul@gmail.com', 'password' => '$2y$12$9VQfe6tFHehXdE8MwAFPFOBeThbDEWtGtcNd122.eTlfnr/roN5wy', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1ce7-7c1e-70ac-83f7-17308b63ec1f', 'created_at' => '2026-07-01 01:48:16', 'updated_at' => '2026-07-01 02:00:47'],
            ['id' => '019f1cdd-b512-7373-8b10-5e1c92533803', 'name' => 'Daffa Raka', 'email' => 'daffa@gmail.com', 'password' => '$2y$12$kwr8pTsoWnLcrbO.nXpDU.ZRgwA7Yt/37iuFinCX/eZsCq7fjjR3a', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1c70-1f62-718e-9094-ef2acec26511', 'created_at' => '2026-07-01 01:48:39', 'updated_at' => '2026-07-01 01:48:39'],
            ['id' => '019f1cdf-256e-71d4-9dde-33fa30a05e66', 'name' => 'Tiara Novianti', 'email' => 'tiara@gmail.com', 'password' => '$2y$12$I/1v8VnjJeOcDzdkzAfTAOWGs4qjAfOQ3ge7Nm4ih5dxf.IEcVBW.', 'department_id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:50:13', 'updated_at' => '2026-07-01 01:50:13'],
            ['id' => '019f1cdf-a38f-7119-b3bd-c3573c5af46f', 'name' => 'Sinta Kartika', 'email' => 'sinta@gmail.com', 'password' => '$2y$12$As1DA7bzbsIDy6os0SRBu.2AziM6lBgdNplJ0yDTTg.zEUNfZE3/e', 'department_id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:50:46', 'updated_at' => '2026-07-01 01:50:46'],
            ['id' => '019f1ce0-c7c5-7131-af55-1aa803d08863', 'name' => 'Rafi Fadillah', 'email' => 'rafi@gmail.com', 'password' => '$2y$12$5uBQepcldtVpUjuIe.J9O.wcOGj8ocbyArtr3JA2KZHOp9OxHF8OS', 'department_id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:52:01', 'updated_at' => '2026-07-01 01:52:01'],
            ['id' => '019f1ce1-5da9-73e6-af98-9b53a27c33cf', 'name' => 'Aisyah Nurjannah', 'email' => 'asisyah@gmail.com', 'password' => '$2y$12$IrD4XwdV1Jrtb309yj3Kk.8Z.vEWqVGyCwSXx2mRdhkFlgs/CMpFq', 'department_id' => '019f1cad-3ce9-7147-aa96-d1299f7d48cf', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:52:39', 'updated_at' => '2026-07-01 01:52:39'],
            ['id' => '019f1ce2-0410-7049-b7c1-e82cfddaa03d', 'name' => 'Fikri Fadlu', 'email' => 'fikri@gmail.com', 'password' => '$2y$12$FZzEAFlrDVoj.VyXjnkG/eEYHAW4SGLiRxmmOB8GjASuzKIPxOVhW', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:53:22', 'updated_at' => '2026-07-01 01:53:22'],
            ['id' => '019f1ce2-6572-70b9-b099-1bf4b1454926', 'name' => 'Fathul Umam', 'email' => 'umam@gmail.com', 'password' => '$2y$12$nXK1LTgxhgPKVk3D8lmOf.tYe219Ktalhp9x7IWvQPGQj.sPc/0vq', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:53:46', 'updated_at' => '2026-07-01 01:53:46'],
            ['id' => '019f1ce2-d04a-73ef-b25d-cb2aa69b0786', 'name' => 'Reza Fikri', 'email' => 'reza@gmail.com', 'password' => '$2y$12$Usz5.YQHHRWYDfmVsLhEF.dgPcTnW9YmMMbqyDfPz7rm/dATYJaey', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'role_id' => '019f1c70-1f6a-70a5-a390-2ce1aec8b292', 'created_at' => '2026-07-01 01:54:14', 'updated_at' => '2026-07-01 01:54:14'],
        ]);

        // Insert KPIs
        DB::table('kpis')->insert([
            [
                'id' => '019f20a6-29f4-73ba-a458-a7466b9adb0f', 
                'title' => 'Penguatan Brand Sekolah  Avicenna dengan mempublikasikan Fasilitas & Program rutin melalui website dan sosial media', 
                'description' => '(minimum 90% mencapai target digital publikasi) untuk mendukung ruang Inspirative Zone (ruang curhat, pojok inspirasi, mading interkatif, podcast & student led talkshow) & ruang transfomasi KB-TK', 
                'department_id' => null, 
                'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 
                'target_date' => '2026-07-02', 
                'created_at' => '2026-07-01 19:26:28', 
                'updated_at' => '2026-07-01 19:40:10'
            ],
        ]);

        // Insert Boards
        DB::table('boards')->insert([
            ['id' => '019f209d-31f3-7055-be96-78a9e7fbddd0', 'title' => 'Design', 'description' => null, 'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'department_id' => null, 'kpi_id' => null, 'created_at' => '2026-07-01 19:16:40', 'updated_at' => '2026-07-01 19:16:40'],
            ['id' => '019f209d-3b71-7034-bfd8-4e7f1e3abb84', 'title' => 'Design', 'description' => null, 'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'department_id' => null, 'kpi_id' => null, 'created_at' => '2026-07-01 19:16:43', 'updated_at' => '2026-07-01 19:16:43'],
            ['id' => '019f209d-489b-7042-9d75-8f1f0649f444', 'title' => 'Design', 'description' => 'Design sekolah', 'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'department_id' => null, 'kpi_id' => null, 'created_at' => '2026-07-01 19:16:46', 'updated_at' => '2026-07-01 19:16:46'],
            ['id' => '019f209d-4b21-73b6-ae2f-977b32c000d0', 'title' => 'Design', 'description' => 'Design sekolah', 'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'department_id' => null, 'kpi_id' => null, 'created_at' => '2026-07-01 19:16:47', 'updated_at' => '2026-07-01 19:16:47'],
            ['id' => '019f20a6-bb0c-7030-95ff-861580dc6253', 'title' => 'Design dan Upload Sosmed', 'description' => 'Seluruh Design dan Upload Sosmed', 'user_id' => '019f1c70-2066-73a5-b6f0-fbf1fe4ae01a', 'department_id' => null, 'kpi_id' => '019f20a6-29f4-73ba-a458-a7466b9adb0f', 'created_at' => '2026-07-01 19:27:05', 'updated_at' => '2026-07-01 19:27:05'],
        ]);

        // Insert Tasks
        DB::table('tasks')->insert([
            ['id' => '019f20a5-1b3f-7257-bd75-3185e56902fc', 'title' => 'Design dan Upload', 'description' => 'Seluruh pekerjaan Design dan Upload', 'document_link' => null, 'pic_id' => null, 'board_id' => '019f209d-31f3-7055-be96-78a9e7fbddd0', 'request_date' => '2026-07-30', 'due_date' => '2027-07-30', 'priority' => 'low', 'column_id' => 'new', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'position' => 1, 'created_at' => '2026-07-01 19:25:19', 'updated_at' => '2026-07-01 19:25:19', 'attachment' => null, 'new_date' => '2026-07-01 19:25:19', 'proses_date' => null, 'end_date' => null],
            ['id' => '019f20b0-989f-7015-89b3-97c6209f9d52', 'title' => 'Design Hari Raya', 'description' => 'Test', 'document_link' => null, 'pic_id' => null, 'board_id' => '019f20a6-bb0c-7030-95ff-861580dc6253', 'request_date' => '2026-07-01', 'due_date' => '2026-07-02', 'priority' => 'low', 'column_id' => 'new', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'position' => 1, 'created_at' => '2026-07-01 19:37:52', 'updated_at' => '2026-07-01 19:37:52', 'attachment' => null, 'new_date' => '2026-07-01 19:37:52', 'proses_date' => null, 'end_date' => null],
            ['id' => '019f20b1-0f38-73b6-b70a-a399264bb5f6', 'title' => 'Upload Design Hari Raya', 'description' => 'Upload Design', 'document_link' => null, 'pic_id' => null, 'board_id' => '019f20a6-bb0c-7030-95ff-861580dc6253', 'request_date' => '2026-07-03', 'due_date' => '2026-07-04', 'priority' => 'low', 'column_id' => 'new', 'department_id' => '019f1cad-0447-7281-ac27-d11e720e840c', 'position' => 2, 'created_at' => '2026-07-01 19:38:22', 'updated_at' => '2026-07-01 19:38:22', 'attachment' => null, 'new_date' => '2026-07-01 19:38:22', 'proses_date' => null, 'end_date' => null],
        ]);

        // Insert Meetings
        DB::table('meetings')->insert([
            [
                'meeting_name' => 'Meeting Kordinasi IT',
                'meeting_description' => 'Membahas progress aplikasi To Do List dan kendala server.',
                'meeting_notes' => 'Siapkan laporan progress masing-masing tim.',
                'meeting_document' => null,
                'meeting_date_start' => now()->addDays(2)->format('Y-m-d H:i:s'),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'meeting_name' => 'Rapat Strategi Branding',
                'meeting_description' => 'Diskusi tentang penguatan branding sekolah Avicenna.',
                'meeting_notes' => null,
                'meeting_document' => null,
                'meeting_date_start' => now()->addDays(5)->format('Y-m-d H:i:s'),
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);
    }
}
