# Dokumentasi Struktur MVC (React & Laravel)

Berikut adalah pemetaan *routing*, komponen *view* (React), *API hit* (Laravel Backend), dan penjelasan fitur dari setiap halaman yang ada di aplikasi To-Do List Humas IT.

---

### 1. KPI Dashboard
* **Routing Frontend**: `/kpi`
* **View (React Component)**: `KpiPage`
* **API Hits (Backend)**: 
  * `GET /api/kpis` - Mengambil daftar KPI.
  * `POST /api/kpis` - Membuat KPI baru.
  * `PUT/PATCH /api/kpis/{id}` - Memperbarui data KPI.
  * `DELETE /api/kpis/{id}` - Menghapus KPI.
* **Penjelasan Fitur**:
  Halaman ini digunakan untuk mengelola **Key Performance Indicators (KPI)**. Pengguna dapat melihat capaian atau target besar, menambahkan KPI baru, serta mengedit detailnya seperti Judul, Deskripsi, dan Target Tanggal selesai dari setiap KPI.

---

### 2. Main Jobs (Boards)
* **Routing Frontend**: `/jobs`
* **View (React Component)**: `JobsPage`
* **API Hits (Backend)**:
  * `GET /api/boards` - Mengambil daftar Main Job.
  * `POST /api/boards` - Membuat Main Job baru.
  * `PUT/PATCH /api/boards/{id}` - Mengedit Main Job.
  * `DELETE /api/boards/{id}` - Menghapus Main Job.
* **Penjelasan Fitur**:
  Halaman untuk mengelola proyek atau pekerjaan utama (*Main Jobs* / *Boards*). Sebuah Main Job dapat dikaitkan dengan KPI tertentu. Pengguna bisa membuat dan mengedit proyek besar sebelum memecahnya menjadi tugas-tugas kecil.

---

### 3. Board Detail / Kanban (To-Do List)
* **Routing Frontend**: `/board/:id`
* **View (React Component)**: `BoardPage` (beserta komponen `CardModal` untuk detail)
* **API Hits (Backend)**:
  * `GET /api/boards/{id}` - Mengambil detail dari suatu Main Job.
  * `GET /api/tasks?boardId={id}` - Mengambil daftar tugas (Task/Card) di dalam Main Job tersebut.
  * `POST /api/tasks` - Membuat tugas baru.
  * `PATCH /api/tasks/{id}` - Memperbarui status kolom tugas, target tanggal, deskripsi, dll.
  * `DELETE /api/tasks/{id}` - Menghapus tugas.
  * `GET / POST /api/tasks/{id}/comments` - Mengambil dan menambahkan komentar tugas.
* **Penjelasan Fitur**:
  Halaman inti berupa papan Kanban interaktif (New, Progress, Done). Pengguna bisa memindahkan kartu tugas secara visual, mengatur tenggat waktu, prioritas, *checklist*, memberikan komentar, serta melampirkan berkas pada tiap tugas.

---

### 4. My Jobs (Tugas Saya)
* **Routing Frontend**: `/view-jobs`
* **View (React Component)**: `ViewJobsPage`
* **API Hits (Backend)**:
  * `GET /api/tasks/my-jobs` - Mengambil seluruh tugas yang di-*assign* ke pengguna saat ini.
* **Penjelasan Fitur**:
  Halaman yang merangkum semua tugas spesifik yang harus dikerjakan oleh *Person In Charge (PIC)* atau pengguna yang sedang *login*. Ini memudahkan pengguna agar tidak perlu mencari tugasnya di setiap *board* yang berbeda.

---

### 5. Kalender (Calendar)
* **Routing Frontend**: `/calendar`
* **View (React Component)**: `CalendarPage`
* **API Hits (Backend)**:
  * `GET /api/tasks` (atau yang terkait kalender) - Mengambil tugas-tugas dengan parameter tanggal.
* **Penjelasan Fitur**:
  Menyajikan visualisasi penjadwalan. Semua tugas dan Main Job yang memiliki target waktu (*Target Date* atau *Due Date*) akan ditampilkan dalam bentuk kalender agar tim lebih mudah memantau *timeline* pengerjaan proyek.

---

### 6. Rapat (Meetings)
* **Routing Frontend**: `/meetings`
* **View (React Component)**: `MeetingsPage`
* **API Hits (Backend)**:
  * `GET /api/meetings` - Mengambil daftar jadwal rapat.
  * `POST /api/meetings` - Membuat jadwal rapat baru.
* **Penjelasan Fitur**:
  Modul untuk mencatat, menjadwalkan, dan mengelola agenda rapat atau pertemuan tim (biasanya memuat informasi tanggal rapat, peserta, dan notulensi).

---

### 7. Master Data
* **Routing Frontend**: `/master`
* **View (React Component)**: `MasterDataPage`
* **API Hits (Backend)**:
  * `GET, POST, PUT, DELETE /api/departments` - Manajemen departemen.
  * `GET, POST, PUT, DELETE /api/users` - Manajemen data pengguna/pegawai.
  * `GET, POST, PUT, DELETE /api/roles` - Manajemen hak akses/role.
* **Penjelasan Fitur**:
  Halaman pengaturan yang ditujukan bagi admin untuk mengelola data master penunjang aplikasi, seperti menambah akun pegawai baru, mengatur hak akses, serta divisi/departemen tempat mereka bernaung.

---

### Integrasi dengan Komponen Global
Selain halaman-halaman utama di atas, aplikasi juga memiliki sistem notifikasi bawaan yang selalu berjalan di latar belakang (Layout / Navbar):
* **API Hits**: `GET /api/notifications`
* **Fitur**: Memberikan peringatan atau pemberitahuan *real-time* kepada pengguna saat ada komentar baru, tugas yang mendekati *deadline*, atau saat ditandai (`@mention`) oleh pengguna lain.
