"use client";

import { useState } from "react";
import { ArrowLeft, Download, AlertTriangle, CheckCircle, XCircle, BarChart2, FileDown, FileSpreadsheet, ShieldAlert, Trophy } from "lucide-react";
import Link from "next/link";

const RESULTS = [
  { id: "1", nama: "Budi Santoso", nisn: "1234567890", score: 85, max: 100, time: 4320, violations: 0, flagged: false, status: "submitted" },
  { id: "2", nama: "Ani Rahayu", nisn: "1234567891", score: 92, max: 100, time: 3800, violations: 2, flagged: false, status: "submitted" },
  { id: "3", nama: "Candra Putra", nisn: "1234567892", score: 68, max: 100, time: 5100, violations: 5, flagged: true, status: "submitted" },
  { id: "4", nama: "Dewi Lestari", nisn: "1234567893", score: 76, max: 100, time: 4500, violations: 1, flagged: false, status: "submitted" },
  { id: "5", nama: "Eko Prasetyo", nisn: "1234567894", score: null, max: 100, time: null, violations: 0, flagged: false, status: "not_started" },
  { id: "6", nama: "Fira Amelia", nisn: "1234567895", score: 88, max: 100, time: 4100, violations: 0, flagged: false, status: "submitted" },
  { id: "7", nama: "Gilang Ramadan", nisn: "1234567896", score: 95, max: 100, time: 3500, violations: 0, flagged: false, status: "submitted" },
  { id: "8", nama: "Hana Putri", nisn: "1234567897", score: 45, max: 100, time: 5400, violations: 8, flagged: true, status: "submitted" },
];

const PASSING = 70;

function formatTime(s: number | null) {
  if (s === null) return "-";
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function HasilClient({ examId }: { examId: string }) {
  const [sort, setSort] = useState<"score" | "name" | "time">("score");

  const sorted = [...RESULTS].sort((a, b) => {
    if (sort === "score") return (b.score ?? -1) - (a.score ?? -1);
    if (sort === "name") return a.nama.localeCompare(b.nama);
    if (sort === "time") return (a.time ?? 9999) - (b.time ?? 9999);
    return 0;
  });

  const submitted = RESULTS.filter(r => r.status === "submitted");
  const scores = submitted.filter(r => r.score !== null).map(r => r.score as number);
  const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const lulus = scores.filter(s => s >= PASSING).length;
  const flaggedCount = RESULTS.filter(r => r.flagged).length;

  const handleExport = async () => {
    const { exportResultsToExcel } = await import("@/lib/export/excel-export");
    void exportResultsToExcel;
    alert("Export Excel sedang disiapkan...");
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/ujian" style={{ color: "var(--t2)", border: "1px solid var(--border)", padding: 8, borderRadius: 8, display: "flex" }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontFamily: "var(--fd)", fontSize: 22, fontWeight: 700 }}>Hasil Ujian</h1>
            <p style={{ fontSize: 13, color: "var(--t2)" }}>UTS Matematika Kelas 9A · KKM {PASSING} · Exam ID {examId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)" }}>
            <Download size={15} /> Export Excel
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--t1)" }}>
            <FileDown size={15} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Rata-rata", val: avg.toFixed(1), icon: BarChart2, color: "var(--accent)", bg: "var(--accent-dim)" },
          { label: "Lulus KKM", val: `${lulus}/${submitted.length}`, icon: CheckCircle, color: "var(--green)", bg: "var(--green-dim)" },
          { label: "Belum Submit", val: `${RESULTS.length - submitted.length}`, icon: XCircle, color: "var(--amber)", bg: "var(--amber-dim)" },
          { label: "Flagged", val: `${flaggedCount}`, icon: ShieldAlert, color: "var(--red)", bg: "rgba(239,68,68,0.1)" },
        ].map(({ label, val, icon: Icon, color, bg }) => (
          <div key={label} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-2">
              <span style={{ fontSize: 12, color: "var(--t2)" }}>{label}</span>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                <Icon size={14} color={color} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--fd)", fontSize: 26, fontWeight: 800, color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Summary Cards */}
      {/* Distribution Bar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="p-5 rounded-xl lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 600 }}>Distribusi Nilai</h3>
              <div style={{ fontSize: 11, color: "var(--t3)" }}>Bisa dipakai backend untuk analitik hasil ujian</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ border: "1px solid var(--border)", color: "var(--t2)" }}>Exam ID {examId}</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {['<50', '50-59', '60-69', '70-79', '80-89', '90-100'].map((range, i) => {
              const ranges = [[0, 50], [50, 60], [60, 70], [70, 80], [80, 90], [90, 101]];
              const [lo, hi] = ranges[i];
              const count = scores.filter(s => s >= lo && s < hi).length;
              const pct = scores.length ? (count / scores.length) * 100 : 0;
              const isPass = lo >= PASSING;
              return (
                <div key={range} className="flex flex-col items-center gap-1 flex-1">
                  <span style={{ fontSize: 11, color: "var(--t3)" }}>{count}</span>
                  <div style={{ width: "100%", background: "rgba(255,255,255,0.05)", borderRadius: 4, height: "100%", display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", background: isPass ? "var(--green)" : "var(--red)", borderRadius: 4, height: `${Math.max(pct, 3)}%`, transition: "height 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: "var(--t3)" }}>{range}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-5 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 style={{ fontFamily: "var(--fd)", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Aksi cepat</h3>
          <div className="space-y-3">
            {[
              { label: "Export Excel", tone: "var(--accent)" },
              { label: "Export PDF", tone: "var(--green)" },
              { label: "Kirim pengumuman", tone: "var(--amber)" },
              { label: "Lock hasil", tone: "var(--red)" },
            ].map((action) => (
              <button key={action.label} className="w-full rounded-2xl px-4 py-3 text-left text-sm" style={{ border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)", color: action.tone }}>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Detail Nilai</span>
          <div className="flex gap-2 flex-wrap">
            {['score', 'name', 'time'].map(s => (
              <button key={s} onClick={() => setSort(s as typeof sort)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: sort === s ? "var(--accent-dim)" : "transparent", border: `1px solid ${sort === s ? "var(--border-a)" : "var(--border)"}`, color: sort === s ? "#A5ACFF" : "var(--t2)" }}>
                {s === "score" ? "Nilai" : s === "name" ? "Nama" : "Waktu"}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {['No', 'Nama Siswa', 'NISN', 'Nilai', 'Status', 'Waktu', 'Pelanggaran', ''].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, color: "var(--t3)", fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r, i) => {
              const isLulus = r.score !== null && r.score >= PASSING;
              return (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)", background: r.flagged ? "rgba(245,158,11,0.04)" : "transparent" }}>
                  <td className="px-5 py-3.5" style={{ color: "var(--t3)" }}>{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {r.flagged && <AlertTriangle size={13} style={{ color: "var(--amber)", flexShrink: 0 }} />}
                      <span style={{ fontWeight: 500 }}>{r.nama}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)", fontFamily: "monospace" }}>{r.nisn}</td>
                  <td className="px-5 py-3.5">
                    {r.score !== null ? (
                      <span style={{ fontFamily: "var(--fd)", fontWeight: 700, fontSize: 15, color: isLulus ? "var(--green)" : "var(--red)" }}>
                        {r.score}
                      </span>
                    ) : <span style={{ color: "var(--t3)" }}>-</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {r.status === "not_started" ? (
                      <span style={{ fontSize: 12, color: "var(--t3)" }}>Belum mulai</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: isLulus ? "var(--green-dim)" : "var(--red-dim,rgba(239,68,68,0.1))", color: isLulus ? "#6EE7B7" : "#FCA5A5" }}>
                        {isLulus ? "Lulus" : "Tidak Lulus"}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5" style={{ color: "var(--t2)" }}>{formatTime(r.time)}</td>
                  <td className="px-5 py-3.5">
                    {r.violations > 0 ? (
                      <span style={{ fontSize: 12, color: r.flagged ? "var(--amber)" : "var(--t2)" }}>{r.violations}×</span>
                    ) : <span style={{ color: "var(--t3)", fontSize: 12 }}>-</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <button style={{ fontSize: 12, color: "var(--accent)" }}>Detail</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
