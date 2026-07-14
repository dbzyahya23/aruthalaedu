"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, AlertTriangle, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { formatSeconds } from "@/lib/utils";
import { createSafeClient } from "@/lib/supabase/client";

interface MonitorSession {
  id: string;
  siswa: string;
  nisn: string;
  status: string;
  progress: number;
  total: number;
  time_remaining: number;
  violations: number;
  is_flagged: boolean;
  score?: number;
}

interface ViolationEvent {
  id: string;
  sessionId: string;
  type: string;
  occurredAt: string;
}

const DUMMY_SESSIONS: MonitorSession[] = [
  { id: "s1", siswa: "Budi Santoso", nisn: "1234567890", status: "in_progress", progress: 14, total: 20, time_remaining: 2400, violations: 0, is_flagged: false },
  { id: "s2", siswa: "Ani Rahayu", nisn: "1234567891", status: "in_progress", progress: 17, total: 20, time_remaining: 1800, violations: 2, is_flagged: false },
  { id: "s3", siswa: "Candra Putra", nisn: "1234567892", status: "submitted", progress: 20, total: 20, time_remaining: 0, violations: 1, is_flagged: false, score: 82 },
  { id: "s4", siswa: "Dewi Lestari", nisn: "1234567893", status: "in_progress", progress: 8, total: 20, time_remaining: 3600, violations: 5, is_flagged: true },
  { id: "s5", siswa: "Eko Prasetyo", nisn: "1234567894", status: "not_started", progress: 0, total: 20, time_remaining: 5400, violations: 0, is_flagged: false },
  { id: "s6", siswa: "Fira Amelia", nisn: "1234567895", status: "in_progress", progress: 20, total: 20, time_remaining: 600, violations: 0, is_flagged: false },
  { id: "s7", siswa: "Gilang Ramadan", nisn: "1234567896", status: "submitted", progress: 20, total: 20, time_remaining: 0, violations: 0, is_flagged: false, score: 95 },
  { id: "s8", siswa: "Hana Putri", nisn: "1234567897", status: "in_progress", progress: 11, total: 20, time_remaining: 2100, violations: 3, is_flagged: true },
];

const STATUS_CARD: Record<string, { border: string; bg: string; dot: string }> = {
  not_started: { border: "var(--border)", bg: "transparent", dot: "var(--t3)" },
  in_progress: { border: "rgba(88,101,242,0.3)", bg: "var(--accent-dim)", dot: "var(--accent)" },
  submitted: { border: "rgba(16,185,129,0.25)", bg: "var(--green-dim)", dot: "var(--green)" },
};

export default function MonitorClient({ examId }: { examId: string }) {
  const [sessions, setSessions] = useState<MonitorSession[]>(DUMMY_SESSIONS);
  const [elapsed, setElapsed] = useState(0);
  const [recentViolations, setRecentViolations] = useState<ViolationEvent[]>([]);
  const [realtimeAvailable, setRealtimeAvailable] = useState(false);

  const submitted = useMemo(() => sessions.filter((s) => s.status === "submitted").length, [sessions]);
  const inProgress = useMemo(() => sessions.filter((s) => s.status === "in_progress").length, [sessions]);
  const notStarted = useMemo(() => sessions.filter((s) => s.status === "not_started").length, [sessions]);
  const flagged = useMemo(() => sessions.filter((s) => s.is_flagged).length, [sessions]);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((value) => value + 1);
      setSessions((prev) => prev.map((session) =>
        session.status === "in_progress"
          ? { ...session, time_remaining: Math.max(0, session.time_remaining - 1) }
          : session
      ));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const supabase = createSafeClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`exam-violations-${examId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "exam_violations" },
        (payload) => {
          const row = payload.new as Record<string, any>;
          if (!row) return;
          if (row.exam_id && row.exam_id !== examId) return;

          const sessionId = row.session_id ?? `session-${Date.now()}`;
          const violationType = row.violation_type ?? "pelanggaran";
          const eventId = row.id ?? `${sessionId}-${Date.now()}`;

          setRecentViolations((prev) => [
            {
              id: eventId,
              sessionId,
              type: violationType,
              occurredAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
            },
            ...prev,
          ].slice(0, 5));

          setSessions((current) => {
            const existing = current.find((session) => session.id === sessionId);
            if (existing) {
              return current.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      violations: session.violations + 1,
                      is_flagged: true,
                    }
                  : session
              );
            }

            return [
              {
                id: sessionId,
                siswa: `Siswa ${sessionId.slice(-4)}`,
                nisn: "-",
                status: "in_progress",
                progress: 0,
                total: 20,
                time_remaining: 0,
                violations: 1,
                is_flagged: true,
              },
              ...current,
            ];
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeAvailable(true);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [examId]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/ujian" style={{ color: "var(--t2)", border: "1px solid var(--border)", padding: "8px", borderRadius: 8, display: "flex" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700 }}>Live Monitor</h1>
            <p style={{ fontSize: 13, color: "var(--t2)" }}>UTS Matematika Kelas 9A · {sessions.length} siswa</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
            style={{ background: "var(--green-dim)", color: "#6EE7B7", border: "1px solid rgba(16,185,129,0.25)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block", animation: "blink 2s infinite" }} />
            LIVE · {formatSeconds(elapsed)} berlalu
          </span>
          <span style={{ fontSize: 12, color: realtimeAvailable ? "#6EE7B7" : "var(--t2)", padding: "0 10px" }}>
            {realtimeAvailable ? "Realtime aktif" : "Realtime tidak tersedia"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Mengerjakan", val: inProgress, icon: Clock, color: "var(--accent)", bg: "var(--accent-dim)" },
          { label: "Selesai", val: submitted, icon: CheckCircle, color: "var(--green)", bg: "var(--green-dim)" },
          { label: "Belum Mulai", val: notStarted, icon: XCircle, color: "var(--t3)", bg: "rgba(255,255,255,0.04)" },
          { label: "Pelanggaran", val: flagged, icon: AlertTriangle, color: "var(--amber)", bg: "var(--amber-dim)" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 28, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Peserta Ujian</span>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Users size={16} /> {sessions.length} siswa
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {['No','Nama Siswa','NISN','Status','Pengerjaan','Pelanggaran',''].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((r, i) => {
              const isFlagged = r.is_flagged;
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: isFlagged ? "rgba(245,158,11,0.04)" : "transparent" }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--t3)" }}>{i + 1}</td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 500 }}>{r.siswa}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)", fontFamily: "monospace" }}>{r.nisn}</td>
                  <td className="px-5 py-3.5" style={{ color: isFlagged ? "var(--amber)" : "var(--t2)" }}>{r.status.replace('_', ' ')}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)" }}>{r.progress}/{r.total}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)" }}>{formatSeconds(r.time_remaining)}</td>
                  <td className="px-5 py-3.5">
                    <button style={{ fontSize: 12, color: "var(--accent)" }}>Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl p-4 mt-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 13, color: "var(--t2)", fontWeight: 600 }}>Pelanggaran Terbaru</div>
            <div style={{ fontSize: 11, color: "var(--t3)" }}>Streaming dari Supabase Realtime</div>
          </div>
          <div style={{ fontSize: 12, color: realtimeAvailable ? "#6EE7B7" : "var(--t2)" }}>
            {realtimeAvailable ? "Realtime aktif" : "Realtime tidak tersedia"}
          </div>
        </div>

        {recentViolations.length === 0 ? (
          <div style={{ color: "var(--t2)", fontSize: 13 }}>Menunggu pelanggaran baru...</div>
        ) : (
          <div className="space-y-3">
            {recentViolations.map((item) => (
              <div key={item.id} className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{item.type.replace(/_/g, " ")}</span>
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{item.occurredAt}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--t2)" }}>
                  {item.sessionId} tercatat pelanggaran.
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
