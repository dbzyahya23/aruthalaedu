"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Wifi, WifiOff, Monitor, Clock, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";

export default function ExamLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [exam, setExam] = useState<any>(null);
  const [sessionError, setSessionError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetchExam(id);
    });
    const up = () => setOnline(true);
    const dn = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", dn); };
  }, [params]);

  async function fetchExam(examId: string) {
    const supabase = createClient();
    const { data, error } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (data) setExam(data);
  }

  const { user: userSession } = useUserRole();

  const handleStart = async () => {
    if (!agreed || !id || !exam) return;
    
    // Validasi Waktu Pelaksanaan
    const now = new Date();
    if (exam.start_at && now < new Date(exam.start_at)) {
      setSessionError(`Ujian belum dimulai. Ujian akan dibuka pada: ${new Date(exam.start_at).toLocaleString('id-ID')}`);
      return;
    }
    if (exam.end_at && now > new Date(exam.end_at)) {
      setSessionError(`Ujian sudah ditutup sejak: ${new Date(exam.end_at).toLocaleString('id-ID')}`);
      return;
    }

    setLoading(true);
    setSessionError("");
    
    const supabase = createClient();
    
    // Gunakan userId dari session bypass lokal jika ada, jika tidak, gunakan real auth
    let userId = userSession?.id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user ? user.id : 'b17a282a-6a38-4381-9dff-e8ff3865dfd8'; // Fallback
    }
    
    // Cek apakah sudah ada sesi yang sedang berjalan
    const { data: existingSessions, error: fetchErr } = await supabase
      .from('exam_sessions')
      .select('id, status, attempt_number')
      .eq('exam_id', exam.id)
      .eq('siswa_id', userId)
      .order('attempt_number', { ascending: false })
      .limit(1);

    if (fetchErr) {
      setSessionError("Gagal memeriksa sesi: " + fetchErr.message);
      setLoading(false);
      return;
    }

    if (existingSessions && existingSessions.length > 0) {
      const lastSession = existingSessions[0];
      if (lastSession.status === 'in_progress') {
        // Lanjutkan ujian yang belum selesai
        router.push(`/e/${id}/mulai?session=${lastSession.id}`);
        return;
      }
      
      // Jika ujian sudah selesai, cek max attempts
      if (lastSession.status === 'submitted') {
        if (lastSession.attempt_number >= exam.max_attempts) {
          setSessionError("Kamu sudah mencapai batas maksimal percobaan ujian ini.");
          setLoading(false);
          return;
        }
        
        // Buat percobaan baru
        const attemptNum = lastSession.attempt_number + 1;
        const { data: newSession, error: newErr } = await supabase.from('exam_sessions').insert({
          exam_id: exam.id,
          siswa_id: userId,
          status: 'in_progress',
          attempt_number: attemptNum,
          started_at: new Date().toISOString(),
          question_order: [],
          violation_count: 0,
          is_flagged: false,
        }).select().single();
        
        if (newErr) {
          setSessionError("Gagal memulai sesi ujian: " + newErr.message);
          setLoading(false);
          return;
        }
        router.push(`/e/${id}/mulai?session=${newSession.id}`);
        return;
      }
    }

    // Jika belum ada sesi sama sekali, buat sesi pertama
    const { data: session, error } = await supabase.from('exam_sessions').insert({
      exam_id: exam.id,
      siswa_id: userId,
      status: 'in_progress',
      attempt_number: 1,
      started_at: new Date().toISOString(),
      question_order: [],
      violation_count: 0,
      is_flagged: false,
    }).select().single();
    
    if (error) {
      console.error(error);
      setSessionError("Gagal memulai sesi ujian: " + error.message);
      setLoading(false);
      return;
    }

    router.push(`/e/${id}/mulai?session=${session.id}`);
  };

  const rules = exam ? [
    { icon: Monitor, text: "Ujian berjalan dalam mode layar penuh. Keluar dari fullscreen akan tercatat dan bisa menyebabkan force-submit." },
    { icon: Shield, text: "Perpindahan tab, copy-paste, dan shortcut keyboard diblokir selama ujian berlangsung." },
    { icon: Clock, text: `Durasi ${exam.duration_minutes} menit. Timer mulai berjalan saat kamu klik Mulai Ujian.` },
    { icon: WifiOff, text: "Jika internet mati, jawaban tersimpan otomatis di perangkat dan disinkronkan saat koneksi kembali." },
  ] : [];

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg, #07090E)", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
        :root { --bg:#07090E; --surface:#0C0F18; --border:rgba(255,255,255,0.07); --accent:#5865F2; --accent-dim:rgba(88,101,242,0.12); --border-a:rgba(88,101,242,0.35); --green:#10B981; --green-dim:rgba(16,185,129,0.1); --amber:#F59E0B; --t1:#EEF0FF; --t2:#7C84AB; --t3:#3D4467; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { color: var(--t1); }
      `}</style>

      <div style={{ position:"fixed",inset:0,background:"radial-gradient(ellipse 60% 40% at 50% 30%,rgba(88,101,242,0.06) 0%,transparent 60%)",pointerEvents:"none" }} />

      <div style={{ width:"100%",maxWidth:480,position:"relative" }}>
        {!exam ? (
          <div className="text-center py-10"><div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4"></div><p>Memuat Ujian...</p></div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent-dim)] flex items-center justify-center mx-auto mb-6 border border-[var(--border-a)]">
                <Shield size={28} className="text-[var(--accent)]" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-[var(--t1)] mb-3" style={{ fontFamily: "Syne, sans-serif" }}>
                {exam.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-sm text-[var(--t2)] font-medium">
                <span className="flex items-center gap-2">
                  <Clock size={16} /> {exam.duration_minutes} Menit
                </span>
                <span className="flex items-center gap-2">
                  {exam.mata_pelajaran}
                </span>
              </div>
            </div>

            {/* Offline warning */}
            {!online && (
              <div style={{ display:"flex",alignItems:"flex-start",gap:12,padding:14,borderRadius:12,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",marginBottom:16 }}>
                <AlertTriangle size={15} style={{ color:"var(--amber)",flexShrink:0,marginTop:1 }} />
                <p style={{ fontSize:13,color:"#FDE68A",lineHeight:1.6 }}>
                  <strong>Mode Offline.</strong> Kamu tetap bisa mulai ujian. Jawaban disimpan lokal dan sync otomatis saat online kembali.
                </p>
              </div>
            )}

            {/* Protection status */}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
              {[
                { label:"Fullscreen ON", active:true, green:true },
                { label:"Tab Monitor ON", active:true, green:true },
                { label:"Clipboard BLOCKED", active:true, green:false },
                { label:"Offline SIAP", active:true, green:true },
              ].map(({ label, active, green }) => active ? (
                <span key={label} style={{ display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:500,background:green?"var(--green-dim)":"rgba(239,68,68,0.1)",border:`1px solid ${green?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}`,color:green?"#6EE7B7":"#FCA5A5" }}>
                  <span style={{ width:5,height:5,borderRadius:"50%",background:green?"var(--green)":"#EF4444",display:"inline-block" }} />
                  {label}
                </span>
              ) : null)}
            </div>

            {/* Rules card */}
            <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:20,marginBottom:16 }}>
              <p style={{ fontSize:12,fontWeight:600,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:14 }}>SEBELUM MEMULAI</p>
              <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
                {rules.map(({ icon: Icon, text }, i) => (
                  <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:12 }}>
                    <div style={{ width:28,height:28,borderRadius:8,background:"var(--accent-dim)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                      <Icon size={13} color="var(--accent)" />
                    </div>
                    <p style={{ fontSize:13,color:"var(--t2)",lineHeight:1.6 }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Agreement */}
            <label style={{ display:"flex",alignItems:"flex-start",gap:12,cursor:"pointer",marginBottom:20 }}>
              <div onClick={() => setAgreed(!agreed)}
                style={{ width:20,height:20,borderRadius:6,flexShrink:0,marginTop:2,background:agreed?"var(--accent)":"transparent",border:`2px solid ${agreed?"var(--accent)":"var(--border)"}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s" }}>
                {agreed && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize:13,color:"var(--t2)",lineHeight:1.6 }}>
                Saya memahami aturan ujian ini dan bersedia mengerjakan dengan jujur tanpa bantuan dari orang lain atau sumber luar.
              </span>
            </label>

            {/* CTA */}
            {exam && (exam.start_at && new Date() < new Date(exam.start_at)) ? (
              <div style={{ width:"100%",padding:"16px",borderRadius:16,fontSize:15,fontWeight:700,fontFamily:"Syne,sans-serif",background:"rgba(255,255,255,0.05)",color:"var(--t3)",textAlign:"center",border:"1px solid var(--border)" }}>
                Ujian Dibuka: {new Date(exam.start_at).toLocaleString('id-ID')}
              </div>
            ) : exam && (exam.end_at && new Date() > new Date(exam.end_at)) ? (
              <div style={{ width:"100%",padding:"16px",borderRadius:16,fontSize:15,fontWeight:700,fontFamily:"Syne,sans-serif",background:"rgba(239,68,68,0.1)",color:"#FCA5A5",textAlign:"center",border:"1px solid rgba(239,68,68,0.2)" }}>
                Ujian Sudah Ditutup
              </div>
            ) : (
              <button onClick={handleStart} disabled={!agreed || loading || !exam}
                style={{ width:"100%",padding:"16px",borderRadius:16,fontSize:15,fontWeight:700,fontFamily:"Syne,sans-serif",background:agreed?"var(--accent)":"rgba(88,101,242,0.2)",color:agreed?"#fff":"rgba(165,172,255,0.4)",border:"none",cursor:agreed?"pointer":"not-allowed",transition:"all .2s",letterSpacing:.2 }}>
                {loading ? "Mempersiapkan soal..." : `Mulai Ujian · ${exam ? exam.duration_minutes : '-'} menit`}
              </button>
            )}
            {sessionError && (
              <div className="mt-4 p-4 rounded-xl text-red-500 bg-red-500/10 border border-red-500/20 text-sm text-center">
                {sessionError}
              </div>
            )}
          </>
        )}
        <p style={{ textAlign:"center",fontSize:11,color:"var(--t3)",marginTop:14 }}>
          Data ujian dilindungi sesuai UU PDP No. 27 Tahun 2022
        </p>
      </div>
    </div>
  );
}
