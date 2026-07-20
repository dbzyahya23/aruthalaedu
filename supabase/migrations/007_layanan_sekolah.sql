-- ============================================================
-- ARUTHALA EDU — LAYANAN SEKOLAH (School Services)
-- Migration: 007_layanan_sekolah.sql
-- Tabel: attendance, materials, library_books, library_loans,
--        announcements, extracurriculars, extracurricular_members
-- Storage: aruthala-materials bucket
-- ============================================================

-- ── ATTENDANCE (Absensi Harian) ──────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    siswa_id        UUID NOT NULL REFERENCES profiles(id),
    kelas_id        UUID REFERENCES kelas(id),
    tanggal         DATE NOT NULL,
    status          VARCHAR(10) NOT NULL CHECK (status IN ('Hadir','Izin','Sakit','Alpa','Libur')),
    jam_datang      TIME,
    jam_pulang      TIME,
    keterangan      TEXT,
    recorded_by     UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(siswa_id, tanggal)
);

CREATE INDEX IF NOT EXISTS idx_attendance_siswa ON attendance(siswa_id, tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_kelas ON attendance(kelas_id, tanggal);
CREATE INDEX IF NOT EXISTS idx_attendance_sekolah ON attendance(sekolah_id, tanggal);

-- ── MATERIALS (File Materi Pembelajaran) ─────────────────────
CREATE TABLE IF NOT EXISTS materials (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    uploaded_by     UUID NOT NULL REFERENCES profiles(id),
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    mata_pelajaran  VARCHAR(100),
    tingkat         INTEGER,
    file_url        TEXT NOT NULL,
    file_type       VARCHAR(10) NOT NULL,
    file_size_bytes BIGINT,
    is_published    BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_materials_sekolah ON materials(sekolah_id, mata_pelajaran);

-- ── LIBRARY_BOOKS (Katalog Perpustakaan) ─────────────────────
CREATE TABLE IF NOT EXISTS library_books (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    title           VARCHAR(255) NOT NULL,
    author          VARCHAR(255),
    isbn            VARCHAR(20),
    category        VARCHAR(50) NOT NULL,
    cover_color     VARCHAR(7) DEFAULT '#2f66e9',
    total_stock     INTEGER NOT NULL DEFAULT 0,
    available_stock INTEGER NOT NULL DEFAULT 0,
    added_by        UUID REFERENCES profiles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_sekolah ON library_books(sekolah_id, category);

-- ── LIBRARY_LOANS (Peminjaman Buku) ──────────────────────────
CREATE TABLE IF NOT EXISTS library_loans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id         UUID NOT NULL REFERENCES library_books(id) ON DELETE CASCADE,
    siswa_id        UUID NOT NULL REFERENCES profiles(id),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id),
    borrowed_at     DATE NOT NULL DEFAULT CURRENT_DATE,
    due_at          DATE NOT NULL,
    returned_at     DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed','returned','overdue')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_loans_siswa ON library_loans(siswa_id, status);
CREATE INDEX IF NOT EXISTS idx_loans_book ON library_loans(book_id, status);

-- ── ANNOUNCEMENTS (Pengumuman Kesiswaan) ─────────────────────
CREATE TABLE IF NOT EXISTS announcements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    yayasan_id      UUID NOT NULL REFERENCES yayasan(id),
    created_by      UUID NOT NULL REFERENCES profiles(id),
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    type            VARCHAR(30) NOT NULL CHECK (type IN ('Pengumuman','Kegiatan','Prestasi','Ekskul')),
    target_audience VARCHAR(20) NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all','siswa','guru','kelas')),
    target_kelas_id UUID REFERENCES kelas(id),
    is_pinned       BOOLEAN NOT NULL DEFAULT false,
    published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_sekolah ON announcements(sekolah_id, published_at DESC);

-- ── EXTRACURRICULARS (Ekskul) ────────────────────────────────
CREATE TABLE IF NOT EXISTS extracurriculars (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sekolah_id      UUID NOT NULL REFERENCES sekolah(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    pembina_id      UUID REFERENCES profiles(id),
    schedule        VARCHAR(100),
    max_members     INTEGER DEFAULT 30,
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ekskul_sekolah ON extracurriculars(sekolah_id);

-- ── EXTRACURRICULAR_MEMBERS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS extracurricular_members (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ekskul_id       UUID NOT NULL REFERENCES extracurriculars(id) ON DELETE CASCADE,
    siswa_id        UUID NOT NULL REFERENCES profiles(id),
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    UNIQUE(ekskul_id, siswa_id)
);

-- ── TRIGGERS (updated_at) ────────────────────────────────────
CREATE TRIGGER set_updated_at_attendance BEFORE UPDATE ON attendance FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_materials BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_library_books BEFORE UPDATE ON library_books FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_updated_at_announcements BEFORE UPDATE ON announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurriculars ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracurricular_members ENABLE ROW LEVEL SECURITY;

-- ── ATTENDANCE POLICIES ──────────────────────────────────────
CREATE POLICY "siswa_own_attendance" ON attendance
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "staff_manage_attendance" ON attendance
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── MATERIALS POLICIES ───────────────────────────────────────
CREATE POLICY "sekolah_view_materials" ON materials
    FOR SELECT USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "staff_manage_materials" ON materials
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── LIBRARY_BOOKS POLICIES ───────────────────────────────────
CREATE POLICY "sekolah_view_books" ON library_books
    FOR SELECT USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "staff_manage_books" ON library_books
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── LIBRARY_LOANS POLICIES ───────────────────────────────────
CREATE POLICY "siswa_own_loans" ON library_loans
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "staff_manage_loans" ON library_loans
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── ANNOUNCEMENTS POLICIES ───────────────────────────────────
CREATE POLICY "sekolah_view_announcements" ON announcements
    FOR SELECT USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "staff_manage_announcements" ON announcements
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── EXTRACURRICULARS POLICIES ────────────────────────────────
CREATE POLICY "sekolah_view_ekskul" ON extracurriculars
    FOR SELECT USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "staff_manage_ekskul" ON extracurriculars
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- ── EXTRACURRICULAR_MEMBERS POLICIES ─────────────────────────
CREATE POLICY "siswa_own_ekskul" ON extracurricular_members
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "staff_manage_ekskul_members" ON extracurricular_members
    FOR ALL USING (
        ekskul_id IN (SELECT id FROM extracurriculars WHERE sekolah_id = get_my_sekolah_id())
        AND is_sekolah_staff()
    );

-- ── SUPABASE STORAGE BUCKET ─────────────────────────────────
-- Note: Storage bucket creation is handled via Supabase Dashboard or CLI.
-- The following policies assume the bucket "aruthala-materials" exists.
-- Bucket policies will be applied via Supabase Storage API.
