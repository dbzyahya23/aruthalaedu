-- ============================================================
-- ARUTHALA EDU — ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE yayasan ENABLE ROW LEVEL SECURITY;
ALTER TABLE sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper functions for extracting JWT claims
CREATE OR REPLACE FUNCTION get_my_yayasan_id() RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT (auth.jwt() ->> 'yayasan_id')::uuid;
$$;

CREATE OR REPLACE FUNCTION get_my_sekolah_id() RETURNS UUID LANGUAGE sql STABLE AS $$
    SELECT (auth.jwt() ->> 'sekolah_id')::uuid;
$$;

CREATE OR REPLACE FUNCTION get_my_role() RETURNS TEXT LANGUAGE sql STABLE AS $$
    SELECT auth.jwt() ->> 'role';
$$;

CREATE OR REPLACE FUNCTION is_super_admin() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() = 'SUPER_ADMIN';
$$;

CREATE OR REPLACE FUNCTION is_yayasan_admin_or_above() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() IN ('SUPER_ADMIN', 'YAYASAN_ADMIN');
$$;

CREATE OR REPLACE FUNCTION is_sekolah_staff() RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
    SELECT get_my_role() IN ('SUPER_ADMIN', 'YAYASAN_ADMIN', 'KEPALA_SEKOLAH', 'OPERATOR', 'GURU');
$$;

-- ── YAYASAN POLICIES ─────────────────────────────────────────
CREATE POLICY "super_admin_all_yayasan" ON yayasan
    FOR ALL USING (is_super_admin());

CREATE POLICY "yayasan_member_select" ON yayasan
    FOR SELECT USING (id = get_my_yayasan_id());

-- ── SEKOLAH POLICIES ─────────────────────────────────────────
CREATE POLICY "super_admin_all_sekolah" ON sekolah
    FOR ALL USING (is_super_admin());

CREATE POLICY "yayasan_admin_manage_sekolah" ON sekolah
    FOR ALL USING (yayasan_id = get_my_yayasan_id() AND is_yayasan_admin_or_above());

CREATE POLICY "sekolah_member_select" ON sekolah
    FOR SELECT USING (id = get_my_sekolah_id() OR yayasan_id = get_my_yayasan_id());

-- ── PROFILES POLICIES ────────────────────────────────────────
CREATE POLICY "own_profile" ON profiles
    FOR ALL USING (id = auth.uid());

CREATE POLICY "sekolah_staff_see_profiles" ON profiles
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

CREATE POLICY "yayasan_admin_manage_profiles" ON profiles
    FOR ALL USING (
        yayasan_id = get_my_yayasan_id()
        AND is_yayasan_admin_or_above()
    );

-- ── KELAS POLICIES ───────────────────────────────────────────
CREATE POLICY "sekolah_kelas" ON kelas
    FOR ALL USING (sekolah_id = get_my_sekolah_id());

CREATE POLICY "yayasan_kelas" ON kelas
    FOR SELECT USING (yayasan_id = get_my_yayasan_id());

-- ── QUESTIONS POLICIES ───────────────────────────────────────
-- Guru sees: own questions + sekolah scope + yayasan scope
CREATE POLICY "guru_see_questions" ON questions
    FOR SELECT USING (
        is_super_admin()
        OR created_by = auth.uid()
        OR (scope = 'sekolah' AND sekolah_id = get_my_sekolah_id())
        OR (scope = 'yayasan' AND yayasan_id = get_my_yayasan_id())
    );

CREATE POLICY "guru_insert_questions" ON questions
    FOR INSERT WITH CHECK (
        is_sekolah_staff()
        AND (sekolah_id = get_my_sekolah_id() OR sekolah_id IS NULL)
    );

CREATE POLICY "guru_update_own_questions" ON questions
    FOR UPDATE USING (created_by = auth.uid() OR is_yayasan_admin_or_above());

CREATE POLICY "guru_delete_own_questions" ON questions
    FOR DELETE USING (created_by = auth.uid() OR is_yayasan_admin_or_above());

-- ── EXAMS POLICIES ───────────────────────────────────────────
CREATE POLICY "sekolah_exams" ON exams
    FOR ALL USING (sekolah_id = get_my_sekolah_id() AND is_sekolah_staff());

-- Siswa can see published exams (to join)
CREATE POLICY "siswa_see_published_exams" ON exams
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND status = 'published'
        AND get_my_role() = 'SISWA'
    );

-- ── EXAM QUESTIONS POLICIES ──────────────────────────────────
CREATE POLICY "sekolah_exam_questions" ON exam_questions
    FOR ALL USING (
        exam_id IN (SELECT id FROM exams WHERE sekolah_id = get_my_sekolah_id())
    );

-- ── EXAM SESSIONS POLICIES ───────────────────────────────────
-- Siswa sees only own sessions
CREATE POLICY "siswa_own_sessions" ON exam_sessions
    FOR SELECT USING (siswa_id = auth.uid());

CREATE POLICY "siswa_insert_session" ON exam_sessions
    FOR INSERT WITH CHECK (siswa_id = auth.uid() AND sekolah_id = get_my_sekolah_id());

CREATE POLICY "siswa_update_own_session" ON exam_sessions
    FOR UPDATE USING (siswa_id = auth.uid());

-- Staff sees all sessions in their sekolah
CREATE POLICY "staff_see_sekolah_sessions" ON exam_sessions
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

-- ── EXAM ANSWERS POLICIES ────────────────────────────────────
CREATE POLICY "siswa_own_answers" ON exam_answers
    FOR ALL USING (
        session_id IN (
            SELECT id FROM exam_sessions WHERE siswa_id = auth.uid()
        )
    );

CREATE POLICY "staff_see_answers" ON exam_answers
    FOR SELECT USING (
        session_id IN (
            SELECT id FROM exam_sessions WHERE sekolah_id = get_my_sekolah_id()
        )
        AND is_sekolah_staff()
    );

-- ── EXAM VIOLATIONS POLICIES ─────────────────────────────────
-- Siswa can INSERT their own violations but NOT SELECT (prevent gaming)
CREATE POLICY "siswa_insert_violations" ON exam_violations
    FOR INSERT WITH CHECK (siswa_id = auth.uid());

-- Staff can see violations in their sekolah
CREATE POLICY "staff_see_violations" ON exam_violations
    FOR SELECT USING (
        sekolah_id = get_my_sekolah_id()
        AND is_sekolah_staff()
    );

-- ── AUDIT LOGS POLICIES ──────────────────────────────────────
-- Admins can read, nobody can write via API (service role only)
CREATE POLICY "admin_read_audit" ON audit_logs
    FOR SELECT USING (
        (yayasan_id = get_my_yayasan_id() AND is_yayasan_admin_or_above())
        OR (sekolah_id = get_my_sekolah_id() AND get_my_role() IN ('KEPALA_SEKOLAH', 'OPERATOR'))
        OR is_super_admin()
    );

-- Revoke direct write access (only via service role in edge functions)
REVOKE INSERT, UPDATE, DELETE ON audit_logs FROM authenticated;
GRANT INSERT ON audit_logs TO service_role;
