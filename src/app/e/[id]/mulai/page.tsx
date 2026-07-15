"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Shield, WifiOff, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { ExamAntiCheat } from "@/lib/exam/anti-cheat";
import { saveAnswer } from "@/lib/exam/offline-storage";
import { SyncManager } from "@/lib/exam/sync-manager";
import { formatSeconds } from "@/lib/utils";

import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";

type AnswerVal = string | boolean | null;

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;500;600&display=swap');
  :root{--bg:#07090E;--surface:#0C0F18;--border:rgba(255,255,255,0.07);--border-a:rgba(88,101,242,0.35);--accent:#5865F2;--accent-dim:rgba(88,101,242,0.12);--green:#10B981;--green-dim:rgba(16,185,129,0.1);--amber:#F59E0B;--amber-dim:rgba(245,158,11,0.1);--red:#EF4444;--t1:#EEF0FF;--t2:#7C84AB;--t3:#3D4467;}
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--t1);font-family:Inter,sans-serif;user-select:none;-webkit-user-select:none;}
  textarea,input{user-select:text;-webkit-user-select:text;}
`;

import { Suspense } from "react";

export default function ExamRoomPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white" style={{background: "var(--bg)"}}>Memuat Ujian...</div>}>
      <ExamRoomClient params={params} />
    </Suspense>
  );
}

function ExamRoomClient({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const nextSearchParams = useSearchParams();
  const sessionId = nextSearchParams.get('session');
  
  const [examData, setExamData] = useState<any>(null);
  const [answers, setAnswers] = useState<Record<string, AnswerVal>>({});
  const [idx, setIdx] = useState(0);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [violations, setViolations] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [syncOk, setSyncOk] = useState(true);
  const acRef = useRef<ExamAntiCheat | null>(null);
  const syncRef = useRef<SyncManager | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetchExamData(id);
    });
  }, [params]);

  async function fetchExamData(examId: string) {
    if (!sessionId) return;
    const supabase = createClient();
    
    // Fetch exam
    const { data: exam } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (!exam) return;

    // Fetch exam_questions
    const { data: eq } = await supabase.from('exam_questions').select('question_id, urutan').eq('exam_id', examId).order('urutan', { ascending: true });
    if (!eq || eq.length === 0) return;
    const qIds = eq.map(x => x.question_id);
    
    // Fetch questions
    const { data: qs } = await supabase.from('questions').select('*').in('id', qIds);
    if (!qs) return;

    // Sort questions to match exam_questions.urutan
    const sortedQs = [];
    for (const id of qIds) {
      const q = qs.find(x => x.id === id);
      if (q) sortedQs.push(q);
    }

    const data = {
      session_id: sessionId,
      exam_title: exam.title,
      total_questions: sortedQs.length,
      duration_seconds: exam.duration_minutes * 60,
      anti_cheat_config: exam.anti_cheat_config || { fullscreen: false, tab_blur: false },
      questions: sortedQs
    };

    setExamData(data);
    setTimeLeft(data.duration_seconds);
    initExam(data);
  }

  function initExam(data: any) {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    setIsOffline(!navigator.onLine);

    const ac = new ExamAntiCheat({
      sessionId: data.session_id,
      config: data.anti_cheat_config,
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
      sessionId: data.session_id,
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
  }

  useEffect(() => {
    return () => {
      if (acRef.current) acRef.current.destroy();
      if (syncRef.current) syncRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const doSubmit = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    acRef.current?.destroy();
    await syncRef.current?.flushAll();
    
    // Kalkulasi Skor
    let correctCount = 0;
    if (examData && examData.questions) {
      examData.questions.forEach((q: any) => {
        const studentAns = answers[q.id];
        if (q.type === 'multiple_choice' && q.content?.options) {
           const correctOpt = q.content.options.find((o: any) => o.is_correct);
           if (correctOpt && studentAns === correctOpt.id) {
             correctCount++;
           }
        } else if (q.type === 'true_false' && q.content?.correct_answer !== undefined) {
           if (studentAns === q.content.correct_answer) {
             correctCount++;
           }
        }
      });
    }
    const finalScore = examData?.total_questions ? Math.round((correctCount / examData.total_questions) * 100) : 0;

    // Update session status in Supabase
    if (sessionId) {
      const supabase = createClient();
      await supabase.from('exam_sessions').update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        time_remaining: timeLeft,
        score: finalScore
      }).eq('id', sessionId);
    }

    if (document.fullscreenElement) { try { await document.exitFullscreen(); } catch {} }
    setSubmitted(true);
  }, [sessionId, timeLeft, examData, answers]);

  const setAnswer = useCallback((qid: string, val: AnswerVal) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
    if (examData) {
      saveAnswer(examData.session_id, qid, val as unknown as Record<string, unknown>);
    }
  }, [examData]);

  if (!examData) return <div className="min-h-screen flex items-center justify-center text-white" style={{background: "var(--bg)"}}>Memuat Soal Ujian...</div>;

  const q = examData.questions[idx];
  const answered = Object.keys(answers).length;
  const totalV = Object.values(violations).reduce((a, b) => a + b, 0);
  const pct = timeLeft / examData.duration_seconds;
  const timerColor = timeLeft < 300 ? "var(--red)" : timeLeft < 900 ? "var(--amber)" : "var(--green)";

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
        <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,textAlign:"left",marginBottom:24 }}>
          {[
            { l:"Soal Dijawab", v:`${answered}/${examData.total_questions}`, c:"var(--t1)" },
            { l:"Pelanggaran", v:totalV.toString(), c:totalV>0?"var(--amber)":"var(--green)" },
            { l:"Waktu Digunakan", v:formatSeconds(examData.duration_seconds-timeLeft), c:"var(--t1)" },
            { l:"Sinkronisasi", v:syncOk?"✓ Tersimpan":"⚠ Cek koneksi", c:syncOk?"var(--green)":"var(--amber)" },
          ].map(({ l,v,c }) => (
            <div key={l}><div style={{ fontSize:11,color:"var(--t3)",marginBottom:4 }}>{l}</div><div style={{ fontFamily:"Syne,sans-serif",fontWeight:700,color:c }}>{v}</div></div>
          ))}
        </div>
        <button onClick={() => window.location.href = "/overview"}
          style={{ width:"100%",padding:"14px",borderRadius:12,background:"var(--accent)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,transition:"all .2s" }}>
          Kembali ke Dashboard
        </button>
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
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <span style={{ fontFamily:"Syne,sans-serif",fontSize:13,fontWeight:600,color:"var(--t2)" }}>{examData.exam_title}</span>
          <div style={{ width:1,height:14,background:"var(--border)" }} />
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <Clock size={14} color={timerColor} />
            <span style={{ fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:14,color:timerColor,fontVariantNumeric:"tabular-nums" }}>{formatSeconds(timeLeft)}</span>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:16 }}>
          <span style={{ fontSize:12,color:"var(--t3)" }}>Soal {idx+1}/{examData.total_questions}</span>
          <div style={{ width:120,height:6,borderRadius:3,background:"var(--surface)",overflow:"hidden" }}>
            <div style={{ height:"100%",width:`${((idx+1)/examData.total_questions)*100}%`,background:"var(--accent)",transition:"width .3s" }} />
          </div>
          <button onClick={doSubmit} style={{ padding:"6px 14px",borderRadius:6,background:"var(--accent)",color:"#fff",fontSize:12,fontWeight:600,border:"none",cursor:"pointer" }}>Selesai</button>
        </div>
      </header>

      {/* MAIN */}
      <main style={{ flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"40px 20px" }}>
        <div style={{ width:"100%",maxWidth:640 }}>

          {/* Question card */}
          <div style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:32,marginBottom:20 }}>
            <div style={{ fontSize:12,fontWeight:600,color:"var(--t2)",marginBottom:12 }}>
              Soal {idx+1} dari {examData.total_questions}
            </div>
            <div style={{ fontSize:16,lineHeight:1.75,marginBottom:24 }}
              dangerouslySetInnerHTML={{ __html: q.content.text }} />

            {/* Multiple Choice */}
            {q.type === "multiple_choice" && (q.content.options ?? []).map((opt: any) => {
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
          <div style={{ marginBottom: 20 }}>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(40px,1fr))",gap:8 }}>
              {examData.questions.map((sq: any, i: number) => {
                const isAns = answers[sq.id] !== undefined;
                const isCur = idx === i;
                return (
                  <button key={sq.id} onClick={() => setIdx(i)}
                    style={{ aspectRatio:"1",borderRadius:8,fontSize:13,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s",
                      background:isCur?"var(--accent)":isAns?"var(--accent-dim)":"transparent",
                      border:`1px solid ${isCur?"var(--accent)":isAns?"var(--border-a)":"var(--border)"}`,
                      color:isCur?"#fff":isAns?"var(--accent)":"var(--t2)" }}>
                    {i+1}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div style={{ display:"flex",gap:12 }}>
            {idx > 0 && (
              <button type="button" onClick={()=>setIdx(i => Math.max(0, i-1))} style={{ flex:1,padding:"12px",borderRadius:8,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--t2)",fontSize:13,fontWeight:600,cursor:"pointer" }}>Sebelumnya</button>
            )}
            {idx < examData.total_questions - 1 ? (
              <button type="button" onClick={()=>setIdx(i => i+1)} style={{ flex:1,padding:"12px",borderRadius:8,background:"var(--accent)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>Selanjutnya</button>
            ) : (
              <button type="button" onClick={doSubmit} style={{ flex:1,padding:"12px",borderRadius:8,background:"var(--green)",border:"none",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer" }}>Kumpulkan</button>
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
