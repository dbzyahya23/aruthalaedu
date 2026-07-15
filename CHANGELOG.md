# Changelog & History Log
Semua perubahan (Updates, Bug Fixes, New Features) pada Dasbor AruthalaEdu akan didokumentasikan di sini untuk mempermudah pelacakan.

---

## [2026-07-14] - Fase 1: Siklus Ujian Selesai
### Ditambahkan (Added)
- **Auto-Grading System:** Tombol "Hitung Nilai Otomatis" di halaman Hasil Ujian. Sistem secara otomatis mencocokkan `exam_answers` dengan kunci jawaban di tabel `questions` (Pilihan Ganda & True/False) dan menyimpan `score` ke `exam_sessions`.
- **Riwayat Ujian Siswa:** Penambahan *tab* baru "Riwayat Ujian" di Dasbor Siswa (`overview/page.tsx`) untuk menampilkan ujian yang sudah selesai (*submitted*) beserta nilai akhirnya.
- **Rules Agents.md:** Menambahkan aturan ke-7 tentang pencatatan History Log pada setiap pembaruan.

### Diubah (Changed)
- **Monitor Ujian Real-Time:** Penyesuaian `MonitorClient.tsx` untuk mengambil angka metrik *progress* (berapa soal terjawab) langsung berdasarkan jumlah rekaman dari tabel `exam_answers`. Total pertanyaan sekarang dinamis merujuk pada *count* dari tabel `exam_questions`.

### Diperbaiki (Fixed)
- **React Hydration & Rules of Hooks Crash:** Memperbaiki bug fatal di `/ujian/[id]/mulai/page.tsx` di mana pemanggilan Hook `useCallback` (`setAnswer`) tidak sengaja diletakkan setelah kode `if (!examData) return`, yang memicu *render crash* beruntun ketika ujian dimuat.
- **Unique Constraint Bug (`exam_sessions`):** Memperbaiki celah logika di mana tombol "Mulai Ujian" selalu mencoba melakukan *INSERT* sesi baru dengan `attempt_number: 1` secara buta. Sistem kini memeriksa eksistensi *session* dan melanjutkan ujian yang belum selesai (*resume*) atau menambah `attempt_number` baru. Serta menyesuaikan *fetching* `siswa_id` dari *Local Storage Bypass* (bukan Supabase Auth Guru/Admin).

---

## [2026-07-14] - Fase 2: Manajemen Data Master
### Ditambahkan (Added)
- **Fitur Hapus (Delete) Soal:** Penambahan *button* tong sampah pada halaman `/bank-soal/page.tsx` beserta konfirmasinya untuk menghapus soal secara permanen dari *database* (`questions`).
- **Template Import Siswa:** Pembuatan file `template_import_siswa.csv` di direktori `public/templates` dan link "Unduh Template CSV" pada halaman Import Siswa agar guru memiliki format baku (nisn, nama_lengkap, kelas, tanggal_lahir) untuk pengisian massal.

### Diubah (Changed)
- **UI Bank Soal:** Penyesuaian tajuk tabel (*table headers*) di halaman Bank Soal agar sejalan dengan kolom isian data (5 kolom).
- **Import Data Siswa (CSV):** Menginkorporasikan validasi sesi *Guru/Admin* dengan menarik `sekolah_id` (menggunakan `useUserRole()`) lalu menyuntikkannya ke dalam susunan data *payload* *CSV*, sehingga *database* tidak memproduksi profil *orphan* (yatim piatu tanpa entitas sekolah).
- **Pembersihan Data Ujian (Data Cleanup):** Melakukan eksekusi *database* secara langsung untuk menghapus 3 ujian uji coba (*dummy*), dan mendistribusikan genap 10 soal ke 2 ujian yang tersisa agar konsisten.

### Diperbaiki (Fixed)
- **Data Kebocoran Daftar Siswa:** Memperbaiki *query fetch* pada `/data-siswa/page.tsx` di mana tabel secara serampangan menarik *seluruh* data siswa lintas sekolah. Kini daftar difilter spesifik (`.eq('sekolah_id', user.sekolah_id)`) berkat penggunaan `useUserRole`.
- **Foreign Key Constraint Hapus Soal:** Menambahkan *error handling* bersahabat (*friendly message*) pada tombol Delete Bank Soal untuk mencegat *PostgreSQL Foreign Key Violation* (kode 23503) agar UI tidak sekadar mengeluarkan pesan gagal teknis saat soal masih dipakai dalam struktur ujian yang sedang berjalan.
- **Hapus Ujian:** Menambahkan tombol Hapus (*Delete*) dengan ikon tempat sampah di halaman Utama Ujian (`/ujian/page.tsx`). Tombol ini secara pintar akan terlebih dahulu menghapus semua sesi (*exam_sessions*) yang menempel pada ujian tersebut sebelum menghapus data ujiannya (*cascade delete manual*), menghindari *Foreign Key Constraint Error*.

---

## [2026-07-14] - Fase 3: Pembuatan & Manajemen Ujian Tingkat Lanjut
### Ditambahkan (Added)
- **Panel Pengaturan Pemilihan Soal:** Merombak total halaman Pengaturan Ujian (`/ujian/[id]/page.tsx`). Halaman ini sekarang mengambil seluruh data dari Bank Soal (`questions`) dan menampilkannya sebagai daftar interaktif yang dapat dicentang (*checkbox*) oleh Guru.
- **Logika Penyimpanan Soal Ujian:** Sistem kini mampu menyimpan soal yang dicentang secara massal dengan menghapus daftar lama di `exam_questions` dan menyisipkan baris pemetaan soal baru secara atomik.

### Diperbaiki (Fixed)
- **Tirai Hak Akses (RBAC) URL Siswa:** Menambahkan skrip inspeksi `useUserRole` ke halaman Utama Ujian (`/ujian/page.tsx`) dan halaman Bank Soal (`/bank-soal/page.tsx`). Jika seorang pengguna ber-role `SISWA` nekat mengakses URL ini, sistem akan memblokir komponen UI dari *rendering* dan melempar (*redirect*) siswa tersebut kembali ke Beranda (`/overview`). Celah URL eksploitasi telah ditutup!

---

## [2026-07-14] - Fase 4: Penyempurnaan Keamanan & Ekspor Laporan
### Ditambahkan (Added)
- **Fitur Ekspor Nilai Excel:** Mengimplementasikan pembuatan laporan Excel `.xlsx` secara instan menggunakan pustaka `xlsx`. Guru kini dapat mengunduh seluruh tabel nilai siswa (lengkap beserta total pelanggaran *anti-cheat* dan status pengerjaan) melalui tombol "Export Excel" di halaman Hasil Ujian (`/ujian/[id]/hasil/page.tsx`).

---

## [2026-07-15] - Fase 5: Sinkronisasi Data Nyata & Validasi Waktu Ujian
### Ditambahkan (Added)
- **Data Soal Real (SNBT/UNBK):** Menghancurkan seluruh data dummy di *Bank Soal* dan menginjeksi 15 soal asli dengan bobot tinggi dari berbagai mata pelajaran (Matematika, Biologi, Fisika, Sejarah, Bahasa Inggris). Setiap soal kini dilengkapi opsi jawaban penuh (A, B, C, D) yang fungsional dan penjelasan logis (pembahasan).
- **Pemblokir Waktu Ujian (Time Restrictor):** Menambahkan algoritma validasi `start_at` dan `end_at` pada halaman pendaratan siswa (`src/app/e/[id]/page.tsx`). Tombol "Mulai Ujian" kini akan berubah secara dinamis menjadi indikator waktu jika jadwal ujian belum tiba, atau menjadi peringatan jika batas waktu sudah kedaluwarsa.

### Diperbaiki (Fixed)
- **Zona Waktu (Timezone) Buat Ujian:** Memperbaiki pengiriman format data tanggal dari halaman Buat Ujian (`src/app/(dashboard)/ujian/buat/page.tsx`). Sistem kini mengonversi parameter waktu lokal ke dalam ISOString (UTC) agar sinkron secara absolut dengan pangkalan data Supabase, mencegah konflik perbedaan jam komputer.
- **Bug Visibilitas Input Tanggal:** Memperbaiki masalah ketidakmampuan mengisi tanggal dan waktu saat membuat ujian akibat bentrok pewarnaan mode gelap (`colorScheme: "dark"`) pada *background* putih terang. Input kalender kini sepenuhnya terlihat jelas.
- **Navigasi Ujian Siswa:** Menambahkan tombol **Kembali ke Dashboard** pada halaman sukses submit ujian. Siswa tidak lagi terjebak di layar akhir setelah mengumpulkan jawaban.
- **Kalkulasi Skor Otomatis:** Memodifikasi `doSubmit()` pada halaman ujian siswa. Sistem kini secara otomatis menghitung kecocokan jawaban siswa dengan kunci jawaban (*is_correct*) saat disubmit dan menyimpannya ke tabel `exam_sessions`. Nilai kini akan langsung muncul di *dashboard* siswa.
- **Pemetaan Kolom Live Monitor:** Memperbaiki kesalahan pemetaan kolom pada `MonitorClient.tsx` di mana kolom "Pelanggaran" sebelumnya salah menampilkan data "Sisa Waktu Ujian".
- **Real-Time Progress & Live Timer:** Menambahkan *listener* `Supabase Realtime` untuk tabel `exam_answers` di layar Live Monitor Guru. Angka progres siswa (contoh: 2/15) kini akan bertambah secara otomatis tanpa memuat ulang layar. *Live timer* juga dikalibrasi agar menghitung selisih waktu dari jadwal `start_at` ujian.
- **Keamanan Hak Akses:** Menutup celah akses menu (seperti `/akademik`, `/data-siswa`, `/data-siswa/import`) yang sebelumnya masih bisa diintip oleh siswa melalui URL *direct routing*. Sistem kini mendeteksi status `isSiswa` dan segera melempar mereka ke `/overview`.
