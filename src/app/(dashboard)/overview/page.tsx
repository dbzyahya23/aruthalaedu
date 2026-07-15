"use client";

import { ClipboardList, Users, BookOpen, TrendingUp, ArrowRight, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

const STATS = [
  { label: "Total Ujian", value: "24", change: "+3 bulan ini", icon: ClipboardList, color: "blue" as const },
  { label: "Total Siswa", value: "847", change: "+12 minggu ini", icon: Users, color: "green" as const },
  { label: "Bank Soal", value: "312", change: "+28 soal baru", icon: BookOpen, color: "amber" as const },
  { label: "Rata-rata Nilai", value: "78.4", change: "+2.1 dari bulan lalu", icon: TrendingUp, color: "purple" as const },
];

const RECENT_UJIAN = [
  { id: "1", title: "UTS Matematika Kelas 9A", status: "published", siswa: 32, submitted: 28, date: "2026-07-15 08:00" },
  { id: "2", title: "Ulangan Harian IPA Bab 4", status: "closed", siswa: 30, submitted: 30, date: "2026-07-12 10:00" },
  { id: "3", title: "UTS Bahasa Indonesia Kelas 7", status: "draft", siswa: 35, submitted: 0, date: "2026-07-20 08:00" },
  { id: "4", title: "Quiz Matematika Kelas 8B", status: "closed", siswa: 28, submitted: 27, date: "2026-07-10 09:00" },
];

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "badge-default" },
  published: { label: "Aktif", className: "badge-success" },
  closed: { label: "Selesai", className: "badge-default" },
};

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Selamat datang 👋</h1>
        <p className="page-subtitle">Berikut ringkasan aktivitas ujian sekolah Anda hari ini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="card card-padding">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{s.value}</p>
                <p className="text-xs text-gray-400 mt-2">{s.change}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${s.color === "blue"
                    ? "bg-[#eef5ff] text-[#2f66e9]"
                    : s.color === "green"
                      ? "bg-green-50 text-green-600"
                      : s.color === "amber"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-purple-50 text-purple-600"
                  }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: "/ujian/buat", label: "Buat Ujian Baru", icon: ClipboardList, desc: "Siapkan soal dan jadwalkan ujian", color: "bg-blue-50 text-blue-600" },
          { href: "/bank-soal/buat", label: "Tambah Soal", icon: BookOpen, desc: "Tambahkan soal ke bank soal", color: "bg-green-50 text-green-600" },
          { href: "/data-siswa/import", label: "Import Siswa", icon: Users, desc: "Upload data siswa dari CSV/Excel", color: "bg-amber-50 text-amber-600" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="card card-padding flex items-center gap-4 group hover:border-[#d8e6fb] hover:shadow-[0_22px_50px_rgba(57,111,190,0.12)] transition-all"
          >
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${a.color}`}>
              <a.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 mb-0.5">{a.label}</div>
              <div className="text-xs text-gray-500">{a.desc}</div>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/80">
          <h2 className="text-base font-semibold text-gray-900">Ujian Terbaru</h2>
          <Link href="/ujian" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Lihat semua →
          </Link>
        </div>
        <div>
          {RECENT_UJIAN.map((u) => {
            const st = STATUS_STYLE[u.status];
            return (
              <Link
                key={u.id}
                href={`/ujian/${u.id}`}
                className="flex items-center gap-4 px-6 py-4 border-b border-white/60 last:border-0 hover:bg-white/70 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">{u.title}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {u.date}
                    </span>
                    <span>{u.siswa} siswa</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {u.status === "published" && (
                    <span className="text-xs text-gray-500">
                      {u.submitted}/{u.siswa} submit
                    </span>
                  )}
                  {u.status === "closed" && u.submitted < u.siswa && (
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertTriangle className="w-3 h-3" /> {u.siswa - u.submitted} belum submit
                    </span>
                  )}
                  <span className={st.className}>{st.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
