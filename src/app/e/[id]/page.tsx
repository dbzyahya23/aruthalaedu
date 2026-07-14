"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, Wifi, WifiOff, Monitor, Clock, AlertTriangle } from "lucide-react";

const DUMMY_EXAM = {
  title: "UTS Matematika Kelas 9A",
  duration_minutes: 90,
  total_questions: 20,
  anti_cheat: { fullscreen: true, tab_blur: true, seb: false },
};

export default function ExamLandingPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const router = useRouter();
  const [online, setOnline] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setId(id));
    const up = () => setOnline(true);
    const dn = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", dn);
    setOnline(navigator.onLine);
    return () => { window.removeEventListener("online", up); window.removeEventListener("offline", dn); };
  }, [params]);

  const handleStart = async () => {
    if (!agreed || !id) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    router.push(`/e/${id}/mulai`);
  };

  const rules = [
    { icon: Monitor, text: "Ujian berjalan dalam mode layar penuh. Keluar dari fullscreen akan tercatat dan bisa menyebabkan force-submit." },
    { icon: Shield, text: "Perpindahan tab, copy-paste, dan shortcut keyboard diblokir selama ujian berlangsung." },
    { icon: Clock, text: `Durasi ${DUMMY_EXAM.duration_minutes} menit. Timer mulai berjalan saat kamu klik Mulai Ujian.` },
    { icon: WifiOff, text: "Jika internet mati, jawaban tersimpan otomatis di perangkat dan disinkronkan saat koneksi kembali." },
  ];

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
        {/* Logo */}
        <div style={{ textAlign:"center",marginBottom:32 }}>
          <div style={{ width:52,height:52,borderRadius:16,background:"var(--accent)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px" }}>
            <Shield size={24} color="white" />
          </div>
          <div style={{ fontSize:12,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:10 }}>Aruthala Edu</div>
          <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:24,fontWeight:800,marginBottom:8,lineHeight:1.2 }}>
            {DUMMY_EXAM.title}
          </h1>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:16,fontSize:13,color:"var(--t2)" }}>
            <span>{DUMMY_EXAM.total_questions} soal</span>
            <span style={{ color:"var(--t3)" }}>·</span>
            <span>{DUMMY_EXAM.duration_minutes} menit</span>
            <span style={{ color:"var(--t3)" }}>·</span>
            <span style={{ display:"flex",alignItems:"center",gap:5 }}>
              {online
                ? <><Wifi size={12} style={{ color:"var(--green)" }} /> Online</>
                : <><WifiOff size={12} style={{ color:"var(--amber)" }} /> Offline</>}
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
        <button onClick={handleStart} disabled={!agreed || loading}
          style={{ width:"100%",padding:"16px",borderRadius:16,fontSize:15,fontWeight:700,fontFamily:"Syne,sans-serif",background:agreed?"var(--accent)":"rgba(88,101,242,0.2)",color:agreed?"#fff":"rgba(165,172,255,0.4)",border:"none",cursor:agreed?"pointer":"not-allowed",transition:"all .2s",letterSpacing:.2 }}>
          {loading ? "Mempersiapkan soal..." : `Mulai Ujian · ${DUMMY_EXAM.duration_minutes} menit`}
        </button>

        <p style={{ textAlign:"center",fontSize:11,color:"var(--t3)",marginTop:14 }}>
          Data ujian dilindungi sesuai UU PDP No. 27 Tahun 2022
        </p>
      </div>
    </div>
  );
}
