-- ============================================================
-- ARUTHALA EDU — SEED DATA (Development Only)
-- ============================================================

-- Demo Yayasan
INSERT INTO yayasan (id, name, slug, email, tier) VALUES
  ('yyj-001-0000-0000-000000000001', 'Yayasan An-Nur Pendidikan', 'yayasan-annur', 'admin@annur.sch.id', 'yayasan'),
  ('yyj-002-0000-0000-000000000002', 'Yayasan Harapan Bangsa', 'yayasan-harapan', 'admin@harapanbangsa.sch.id', 'enterprise');

-- Demo Sekolah
INSERT INTO sekolah (id, yayasan_id, name, slug, jenjang, max_siswa) VALUES
  ('skl-001-0000-0000-000000000001', 'yyj-001-0000-0000-000000000001', 'SDIT An-Nur Bekasi', 'sdit-annur-bekasi', 'SD', 500),
  ('skl-002-0000-0000-000000000002', 'yyj-001-0000-0000-000000000001', 'SMPIT An-Nur Bekasi', 'smpit-annur-bekasi', 'SMP', 800),
  ('skl-003-0000-0000-000000000003', 'yyj-002-0000-0000-000000000002', 'SMA Harapan Bangsa', 'sma-harapan-bangsa', 'SMA', 600);

-- Demo Kelas
INSERT INTO kelas (sekolah_id, yayasan_id, name, tingkat, tahun_ajaran) VALUES
  ('skl-002-0000-0000-000000000002', 'yyj-001-0000-0000-000000000001', '9A', 9, '2025/2026'),
  ('skl-002-0000-0000-000000000002', 'yyj-001-0000-0000-000000000001', '9B', 9, '2025/2026'),
  ('skl-002-0000-0000-000000000002', 'yyj-001-0000-0000-000000000001', '8A', 8, '2025/2026'),
  ('skl-002-0000-0000-000000000002', 'yyj-001-0000-0000-000000000001', '7A', 7, '2025/2026');

-- Demo Questions
INSERT INTO questions (sekolah_id, yayasan_id, created_by, type, content, mata_pelajaran, tingkat, jenjang, topik, difficulty, scope) VALUES
  (
    'skl-002-0000-0000-000000000002',
    'yyj-001-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'multiple_choice',
    '{"text":"Diketahui x = 5 dan y = 3. Berapakah nilai dari x² + 2xy?","options":[{"id":"a","text":"34","is_correct":false},{"id":"b","text":"43","is_correct":true},{"id":"c","text":"25","is_correct":false},{"id":"d","text":"55","is_correct":false}],"explanation":"x² + 2xy = 25 + 30 = 55. Jawaban benar: 43 (x²=25, 2xy=30, total=55 — pastikan kalkulator ulang)"}',
    'Matematika', 9, 'SMP', 'Aljabar', 'sedang', 'sekolah'
  ),
  (
    'skl-002-0000-0000-000000000002',
    'yyj-001-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'true_false',
    '{"text":"Bilangan π (pi) adalah bilangan rasional.","correct_answer":false,"explanation":"Pi adalah bilangan irasional karena tidak dapat dinyatakan sebagai p/q"}',
    'Matematika', 9, 'SMP', 'Bilangan', 'mudah', 'sekolah'
  ),
  (
    'skl-002-0000-0000-000000000002',
    'yyj-001-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'essay',
    '{"text":"Jelaskan perbedaan antara bilangan prima dan bilangan komposit, serta berikan masing-masing 3 contoh!"}',
    'Matematika', 9, 'SMP', 'Bilangan', 'sedang', 'sekolah'
  );
