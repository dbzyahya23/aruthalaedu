"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock, Users, BarChart2, Play, Settings } from "lucide-react";

const DUMMY_EXAMS = [
  { id: "1", title: "UTS Matematika Kelas 9A", mata_pelajaran: "Matematika", status: "published", duration_minutes: 90, start_at: "2026-07-15 08:00", end_at: "2026-07-15 10:30", siswa: 32, submitted: 28, avg_score: 76.5 },
  { id: "2", title: "Ulangan Harian IPA Bab 4", mata_pelajaran: "IPA", status: "closed", duration_minutes: 60, start_at: "2026-07-12 10:00", end_at: "2026-07-12 11:00", siswa: 30, submitted: 30, avg_score: 82.3 },
  { id: "3", title: "UTS Bahasa Indonesia Kelas 7B", mata_pelajaran: "Bahasa Indonesia", status: "draft", duration_minutes: 90, start_at: "2026-07-20 08:00", end_at: "2026-07-20 10:30", siswa: 35, submitted: 0, avg_score: null },
  { id: "4", title: "Quiz Matematika Kelas 8B", mata_pelajaran: "Matematika", status: "closed", duration_minutes: 45, start_at: "2026-07-10 09:00", end_at: "2026-07-10 10:00", siswa: 28, submitted: 27, avg_score: 68.4 },
  { id: "5", title: "UAS IPS Semester 1", mata_pelajaran: "IPS", status: "draft", duration_minutes: 120, start_at: "2026-08-01 07:30", end_at: "2026-08-01 10:00", siswa: 33, submitted: 0, avg_score: null },
];

const STATUS: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "badge-default" },
  published: { label: "Aktif", className: "badge-success" },
  closed: { label: "Selesai", className: "badge-default" },
};

const FILTERS = ["Semua", "Aktif", "Draft", "Selesai"];

export default function UjianPage() {
  const [filter, setFilter] = useState("Semua");

  const filtered = DUMMY_EXAMS.filter((e) => {
    if (filter === "Aktif") return e.status === "published";
    if (filter === "Draft") return e.status === "draft";
    if (filter === "Selesai") return e.status === "closed";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Ujian</h1>
          <p className="page-subtitle">Kelola semua paket ujian sekolah Anda</p>
        </div>
        <Link href="/ujian/buat" className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Ujian
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all border ${
              filter === f
                ? "bg-[#eef5ff] text-[#2f66e9] border-[#d8e6fb]"
                : "bg-white/70 text-gray-600 border-white/80 hover:bg-white"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((exam) => {
          const st = STATUS[exam.status];
          return (
            <div
              key={exam.id}
              className="card card-padding flex items-center gap-5 hover:border-[#d8e6fb] transition-all"
            >
              <div
                className={`w-1 self-stretch rounded-full shrink-0 ${
                  exam.status === "published"
                    ? "bg-green-500"
                    : exam.status === "draft"
                      ? "bg-gray-300"
                      : "bg-gray-200"
                }`}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-sm font-semibold text-gray-900">{exam.title}</h3>
                  <span className={st.className}>{st.label}</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {exam.duration_minutes} menit
                  </span>
                  <span>{exam.mata_pelajaran}</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {exam.siswa} siswa
                  </span>
                  <span>{exam.start_at}</span>
                </div>
              </div>

              {exam.status !== "draft" && (
                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {exam.submitted}/{exam.siswa}
                    </div>
                    <div className="text-[11px] text-gray-400">Submit</div>
                  </div>
                  {exam.avg_score !== null && (
                    <div className="text-center">
                      <div
                        className={`text-xl font-bold ${
                          exam.avg_score >= 75 ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {exam.avg_score.toFixed(1)}
                      </div>
                      <div className="text-[11px] text-gray-400">Rata-rata</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {exam.status === "published" && (
                  <Link
                    href={`/ujian/${exam.id}/monitor`}
                    className="btn-secondary text-xs py-2 px-3"
                  >
                    <Play className="w-3 h-3" /> Monitor
                  </Link>
                )}
                <Link
                  href={`/ujian/${exam.id}/hasil`}
                  className="btn-outline p-2"
                >
                  <BarChart2 className="w-4 h-4" />
                </Link>
                <Link href={`/ujian/${exam.id}`} className="btn-outline p-2">
                  <Settings className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
