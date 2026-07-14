"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Shield, WifiOff, AlertTriangle, CheckCircle } from "lucide-react";
import { ExamAntiCheat } from "@/lib/exam/anti-cheat";
import { saveAnswer } from "@/lib/exam/offline-storage";
import { SyncManager } from "@/lib/exam/sync-manager";
import { formatSeconds } from "@/lib/utils";

const EXAM_DATA = {
  session_id: "demo-session-001",
  exam_title: "UTS Matematika Kelas 9A",
  total_questions: 5,
  duration_seconds: 5400,
  anti_cheat_config: {
    fullscreen: true, tab_blur: true, clipboard: true,
    keyboard_shortcuts: true, right_click: true, screen_share: false,
    max_fullscreen_exits: 3, max_tab_blurs: 5, require_seb: false,
  },
  questions: [
    { id:"q1", type:"multiple_choice", content:{ text:"Diketahui x = 5 dan y = 3. Berapakah nilai dari <strong>x² + 2xy</strong>?", options:[{id:"a",text:"34"},{id:"b",text:"43"},{id:"c",text:"25"},{id:"d",text:"55"}] }},
    { id:"q2", type:"multiple_choice", content:{ text:"Jika 2x + 4 = 14, maka nilai x adalah...", options:[{id:"a",text:"3"},{id:"b",text:"4"},{id:"c",text:"5"},{id:"d",text:"7"}] }},
    { id:"q3", type:"true_false", content:{ text:"Bilangan π (pi) adalah bilangan rasional." }},
    { id:"q4", type:"multiple_choice", content:{ text:"Hasil dari 3³ + 4² adalah...", options:[{id:"a",text:"43"},{id:"b",text:"37"},{id:"c",text:"25"},{id:"d",text:"91"}] }},
    { id:"q5", type:"essay", content:{ text:"Jelaskan perbedaan antara bilangan prima dan bilangan komposit! Berikan masing-masing 3 contoh." }},
  ],
};

type AnswerVal = string | boolean | null;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  :root{--bg:#07090E;--surface:#0C0F18;--border:rgba(255,255,255,0.07);--border-a:rgba(88,101,242,0.35);--accent:#5865F2;--accent-dim:rgba(88,101,242,0.12);--green:#10B981;--green-dim:rgba(16,185,129,0.1);--amber:#F59E0B;--amber-dim:rgba(245,158,11,0.1);--red:#EF4444;--t1:#EEF0FF;--t2:#7C84AB;--t3:#3D4467;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--t1);font-family:Inter,sans-serif;user-select:none;-webkit-user-select:none;}
  textarea,input{user-select:text;-webkit-user-select:text;}
`;

export default function ExamRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerVal>>({});
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    params.then(({ id }) => setId(id));
  }, [params]);
  const [timeLeft, setTimeLeft] = useState(EXAM_DATA.duration_seconds);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [violations, setViolations] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [syncOk, setSyncOk] = useState(true);
  const acRef = useRef<ExamAntiCheat | null>(null);
  const syncRef = useRef<SyncManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const q = EXAM_DATA.questions[idx];
  const answered = Object.keys(answers).length;
  const totalV = Object.values(violations).reduce((a, b) => a + b, 0);
  const pct = timeLeft / EXAM_DATA.duration_seconds;
  const timerColor = timeLeft < 300 ? "var(--red)" : timeLeft < 900 ? "var(--amber)" : "var(--green)";

  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setIsOffline(!navigator.onLine);

    const ac = new ExamAntiCheat({
      sessionId: EXAM_DATA.session_id,
      config: EXAM_DATA.anti_cheat_config,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      token: typeof window !== "undefined" ? (sessionStorage.getItem("siswa_token") ?? "") : "",
    });
    ac.onViolation = (e) => setViolations(v => ({ ...v, [e.type]: e.count }));
    ac.onLock = (r) => { setIsLocked(true); setLockReason(r); };
    ac.onForceSubmit = () => doSubmit();
    ac.init();
    acRef.current = ac;

    const sync = new SyncManager({
      sessionId: EXAM_DATA.session_id,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      token: typeof window !== "undefined" ? (sessionStorage.getItem("siswa_token") ?? "") : "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      onSyncSuccess: () => setSyncOk(true),
      onSyncError: () => setSyncOk(false),
    });
    sync.start();
    syncRef.current = sync;

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current!); doSubmit(); return 0; }
        return t - 1;
      });
    }, 1000);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
      ac.destroy();
      sync.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    acRef.current?.destroy();
    await syncRef.current?.flushAll();
    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    setSubmitted(true);
  }, []);

  const setAnswer = useCallback((qid: string, val: AnswerVal) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    saveAnswer(EXAM_DATA.session_id, qid, val as unknown as Record<string, unknown>);
  }, []);

  const unlockFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsLocked(false);
      setLockReason("");
    } catch {
      setLockReason("Mohon izinkan mode layar penuh agar ujian dapat dilanjutkan.");
    }
  };

  // ── SUBMITTED ─────────────────────────────────────────────
  if (submitted) return (
    <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--bg)",fontFamily:"Inter,sans-serif",padding:24 }}>
      <style>{CSS}</style>
      <div style={{ textAlign:"center",maxWidth:380 }}>
        <div style={{ width:64,height:64,borderRadius:"50%",background:"var(--green-dim)",border:"1px solid rgba(16,185,129,.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
          <CheckCircle size={30} color="var(--green)" />
        </div>
        <h1 style={{ fontFamily:"Syne,sans-serif",fontSize:28,fontWeight:800,marginBottom:10 }}>Ujian Selesai!</h1>
        <p style={{ color:"var(--t2)",fontSize:15,marginBottom:28,lineHeight:1.7 }}>Jawabanmu sudah berhasil dikumpulkan. Hasil akan diumumkan oleh guru.</p>
        <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left" }}>
          {[
            { l:"Soal Dijawab", v:`${answered}/${EXAM_DATA.total_questions}`, c:"var(--t1)" },
            { l:"Pelanggaran", v:totalV.toString(), c:totalV>0?"var(--amber)":"var(--green)" },
            { l:"Waktu Digunakan", v:formatSeconds(EXAM_DATA.duration_seconds-timeLeft), c:"var(--t1)" },
            { l:"Sinkronisasi", v:syncOk?"✓ Tersimpan":"⚠ Cek koneksi", c:syncOk?"var(--green)":"var(--amber)" },
          ].map(({ l,v,c }) => (
            <div key={l}><div style={{ fontSize:11,color:"var(--t3)",marginBottom:4 }}>{l}</div><div style={{ fontFamily:"Syne,sans-serif",fontWeight:700,color:c }}>{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",background:"var(--bg)",fontFamily:"Inter,sans-serif" }}>
      <style>{CSS}</style>

      {/* LOCK OVERLAY */}
      {isLocked && (
        <div style={{ position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.9)",backdropFilter:"blur(10px)" }}>
          <div style={{ textAlign:"center",maxWidth:360,padding:"0 32px" }}>
            <div style={{ width:64,height:64,borderRadius:"50%",background:"rgba(239,68,68,0.15)",border:"2px solid var(--red)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px" }}>
              <AlertTriangle size={28} color="var(--red)" />
            </div>
            <h2 style={{ fontFamily:"Syne,sans-serif",fontSize:22,fontWeight:800,marginBottom:10 }}>Ujian Terkunci</h2>
            <p style={{ color:"var(--t2)",fontSize:14,lineHeight:1.7,marginBottom:24 }}>{lockReason || "Mode layar penuh diperlukan untuk keamanan ujian."}</p>
            <button type="button" onClick={unlockFullscreen}
              style={{ width:"100%",padding:"14px",borderRadius:12,background:"var(--accent)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14 }}>
              Kembali ke Layar Penuh
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ height:56,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px",background:"var(--surface)",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
        {/* Left: brand + title */}
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <Shield size={15} color="var(--accent)" />
          <span style={{ fontFamily:"Syne,sans-serif",fontSize:13,fontWeight:600,color:"var(--t2)" }}>{EXAM_DATA.exam_title}</span>
        </div>

        {/* Center: progress bar */}
        <div style={{ display:"flex",alignItems:"center",gap:10,position:"absolute",left:"50%",transform:"translateX(-50%)" }}>
          <span style={{ fontSize:12,color:"var(--t3)" }}>Soal {idx+1}/{EXAM_DATA.total_questions}</span>
          <div style={{ width:100,height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${((idx+1)/EXAM_DATA.total_questions)*100}%`,background:"var(--accent)",transition:"width .3s" }} />
          </div>
          <span style={{ fontSize:12,color:"var(--t3)" }}>{answered} dijawab</span>
        </div>

        {/* Right: status + timer */}
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          {isOffline && (
            <span style={{ display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:100,fontSize:11,fontWeight:500,background:"var(--amber-dim)",border:"1px solid rgba(245,158,11,.3)",color:"#FDE68A" }}>
              <WifiOff size={10} /> Offline — Aman
            </span>
          )}
          {!isOffline && (
            <div style={{ width:6,height:6,borderRadius:"50%",background:syncOk?"var(--green)":"var(--amber)" }} />
          )}
          {totalV > 0 && (
            <span style={{ display:"flex",alignItems:"center",gap:4,padding:"3px 9px",borderRadius:100,fontSize:11,background:"var(--amber-dim)",color:"#FDE68A",border:"1px solid rgba(245,158,11,.3)" }}>
              <AlertTriangle size={10} /> {totalV}×
            </span>
          )}
          {/* Circular timer */}
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"5px 12px",borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid var(--border)" }}>
            <svg width="28" height="28" viewBox="0 0 28 28" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
              <circle cx="14" cy="14" r="11" fill="none" stroke={timerColor} strokeWidth="2.5"
                strokeDasharray={`${2*Math.PI*11}`} strokeDashoffset={`${2*Math.PI*11*(1-pct)}`}
                style={{ transition:"stroke-dashoffset 1s linear,stroke .5s" }} strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily:"Syne,sans-serif",fontSize:14,fontWeight:700,color:timerColor,minWidth:48,letterSpacing:.5 }}>
              {formatSeconds(timeLeft)}
            </span>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px" }}>
        <div style={{ width:"100%",maxWidth:640 }}>

          {/* Question card */}
          <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:32,marginBottom:20 }}>
            <div style={{ fontSize:11,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,marginBottom:12 }}>
              Soal {idx+1} dari {EXAM_DATA.total_questions}
            </div>
            <div style={{ fontSize:16,lineHeight:1.75,marginBottom:24 }}
              dangerouslySetInnerHTML={{ __html: q.content.text }} />

            {/* Multiple Choice */}
            {q.type === "multiple_choice" && (q.content.options ?? []).map((opt) => {
              const sel = answers[q.id] === opt.id;
              return (
                <button type="button" key={opt.id} onClick={() => setAnswer(q.id, opt.id)}
                  style={{ width:"100%",display:"flex",alignItems:"center",gap:14,padding:"12px 16px",marginBottom:10,borderRadius:12,textAlign:"left",background:sel?"var(--accent-dim)":"rgba(255,255,255,0.02)",border:`1px solid ${sel?"var(--border-a)":"var(--border)"}`,color:sel?"var(--t1)":"var(--t2)",cursor:"pointer",transition:"all .13s",fontFamily:"inherit",fontSize:14 }}>
                  <span style={{ width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontWeight:700,fontSize:13,background:sel?"var(--accent)":"rgba(255,255,255,0.06)",color:sel?"#fff":"var(--t3)",transition:"all .13s" }}>
                    {opt.id.toUpperCase()}
                  </span>
                  {opt.text}
                </button>
              );
            })}

            {/* True/False */}
            {q.type === "true_false" && (
              <div style={{ display:"flex",gap:12 }}>
                {([true, false] as boolean[]).map(val => {
                  const sel = answers[q.id] === val;
                  return (
                    <button type="button" key={String(val)} onClick={() => setAnswer(q.id, val)}
                      style={{ flex:1,padding:"14px",borderRadius:12,fontWeight:700,fontSize:14,fontFamily:"Syne,sans-serif",background:sel?val?"var(--green-dim)":"rgba(239,68,68,0.12)":"rgba(255,255,255,0.02)",border:`1px solid ${sel?val?"rgba(16,185,129,.4)":"rgba(239,68,68,.4)":"var(--border)"}`,color:sel?val?"#6EE7B7":"#FCA5A5":"var(--t2)",cursor:"pointer",transition:"all .13s" }}>
                      {val ? "✓  Benar" : "✕  Salah"}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Essay */}
            {q.type === "essay" && (
              <textarea
                value={(answers[q.id] as string) ?? ""}
                onChange={e => setAnswer(q.id, e.target.value)}
                rows={6} placeholder="Tulis jawabanmu di sini..."
                style={{ width:"100%",background:"rgba(255,255,255,0.03)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 16px",fontSize:14,color:"var(--t1)",outline:"none",resize:"vertical",lineHeight:1.7,fontFamily:"Inter,sans-serif" }} />
            )}
          </div>

          {/* Navigation */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <button type="button" onClick={() => setIdx(i => Math.max(0,i-1))} disabled={idx===0}
              style={{ padding:"10px 20px",borderRadius:12,background:"transparent",border:"1px solid var(--border)",color:"var(--t2)",cursor:idx===0?"not-allowed":"pointer",opacity:idx===0?0.4:1,fontFamily:"inherit",fontSize:14 }}>
              ← Sebelumnya
            </button>

            {/* Dot navigator */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center",maxWidth:240 }}>
              {EXAM_DATA.questions.map((sq, i) => {
                const ans = answers[sq.id];
                const done = ans !== undefined && ans !== null && ans !== "";
                return (
                  <button type="button" key={sq.id} onClick={() => setIdx(i)}
                    style={{ width:28,height:28,borderRadius:8,fontSize:12,fontWeight:700,background:i===idx?"var(--accent)":done?"var(--green-dim)":"rgba(255,255,255,0.05)",border:`1px solid ${i===idx?"var(--accent)":done?"rgba(16,185,129,.3)":"var(--border)"}`,color:i===idx?"#fff":done?"#6EE7B7":"var(--t3)",cursor:"pointer",fontFamily:"inherit",transition:"all .13s" }}>
                    {i+1}
                  </button>
                );
              })}
            </div>

            {idx < EXAM_DATA.total_questions - 1 ? (
              <button type="button" onClick={() => setIdx(i => i+1)}
                style={{ padding:"10px 20px",borderRadius:12,background:"var(--accent)",border:"none",color:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:14 }}>
                Berikutnya →
              </button>
            ) : (
              <button type="button" onClick={doSubmit}
                style={{ padding:"10px 20px",borderRadius:12,background:"var(--green)",border:"none",color:"#fff",cursor:"pointer",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14 }}>
                ✓ Kumpulkan
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Status footer */}
      <footer style={{ height:36,display:"flex",alignItems:"center",justifyContent:"center",gap:20,borderTop:"1px solid var(--border)",background:"var(--surface)",flexShrink:0 }}>
        {["Fullscreen","Anti-Tab","Clipboard Block","Offline Ready"].map(l => (
          <span key={l} style={{ display:"flex",alignItems:"center",gap:5,fontSize:11,color:"var(--t3)" }}>
            <span style={{ width:5,height:5,borderRadius:"50%",background:"var(--green)",display:"inline-block" }} />
            {l}
          </span>
        ))}
      </footer>
    </div>
  );
}
