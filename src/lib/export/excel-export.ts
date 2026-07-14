"use client";

import type { ExamSession, ExamViolation, Exam } from "@/types";
import { formatDateTime } from "@/lib/utils";

// ─── EXCEL EXPORT ─────────────────────────────────────────────────────────────

export async function exportResultsToExcel(
  exam: Exam,
  sessions: ExamSession[]
): Promise<void> {
  const XLSX = await import("xlsx");

  const wsData = [
    ["Laporan Hasil Ujian", "", "", "", "", ""],
    [`Ujian: ${exam.title}`, "", "", "", "", ""],
    [`Diekspor: ${formatDateTime(new Date())}`, "", "", "", "", ""],
    [],
    ["No", "Nama Siswa", "NISN", "Nilai", "Status", "Pelanggaran", "Waktu Submit", "Flagged"],
    ...sessions.map((s, i) => [
      i + 1,
      s.siswa?.full_name ?? "-",
      s.siswa?.nisn ?? "-",
      s.score !== undefined ? s.score.toFixed(1) : "-",
      s.score !== undefined && exam.passing_score
        ? s.score >= exam.passing_score ? "Lulus" : "Tidak Lulus"
        : "-",
      s.violation_count,
      s.submitted_at ? formatDateTime(s.submitted_at) : "Belum Submit",
      s.is_flagged ? "⚠️ Ya" : "Tidak",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 14 }, { wch: 20 }, { wch: 10 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hasil Ujian");
  XLSX.writeFile(wb, `${exam.title.replace(/[^a-zA-Z0-9]/g, "_")}_hasil.xlsx`);
}

export async function exportAntiCheatLog(
  exam: Exam,
  violations: ExamViolation[],
  sessions: ExamSession[]
): Promise<void> {
  const XLSX = await import("xlsx");

  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  const wsData = [
    ["Log Anti-Cheat", "", "", "", ""],
    [`Ujian: ${exam.title}`, "", "", "", ""],
    [`Diekspor: ${formatDateTime(new Date())}`, "", "", "", ""],
    [],
    ["Waktu", "Nama Siswa", "NISN", "Jenis Pelanggaran", "Ke-", "Detail"],
    ...violations.map((v) => {
      const session = sessionMap.get(v.session_id);
      return [
        formatDateTime(v.occurred_at),
        session?.siswa?.full_name ?? "-",
        session?.siswa?.nisn ?? "-",
        formatViolationType(v.violation_type),
        v.count_at_time,
        v.metadata ? JSON.stringify(v.metadata) : "-",
      ];
    }),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 30 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Log Anti-Cheat");
  XLSX.writeFile(wb, `${exam.title.replace(/[^a-zA-Z0-9]/g, "_")}_anticheat.xlsx`);
}

export function formatViolationType(type: string): string {
  const map: Record<string, string> = {
    fullscreen_exit: "Keluar Fullscreen",
    tab_blur: "Pindah Tab/Window",
    copy_paste: "Copy/Paste",
    keyboard_shortcut: "Shortcut Keyboard",
    right_click: "Klik Kanan",
    screen_share: "Screen Sharing",
  };
  return map[type] ?? type;
}
