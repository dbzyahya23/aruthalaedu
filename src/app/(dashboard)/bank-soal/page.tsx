"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye } from "lucide-react";

const MAPEL = ["Semua", "Matematika", "IPA", "IPS", "Bahasa Indonesia", "Bahasa Inggris", "PKn", "Agama"];
const TINGKAT = ["Semua", "Kelas 7", "Kelas 8", "Kelas 9", "Kelas 10", "Kelas 11", "Kelas 12"];

const DUMMY_QUESTIONS = [
  { id: "1", type: "multiple_choice", mata_pelajaran: "Matematika", tingkat: 9, topik: "Aljabar", difficulty: "sedang", scope: "sekolah", usage_count: 12, content: { text: "Diketahui x = 5 dan y = 3. Berapakah nilai dari x² + 2xy?" }, created_at: "2026-06-15" },
  { id: "2", type: "essay", mata_pelajaran: "Bahasa Indonesia", tingkat: 8, topik: "Teks Narasi", difficulty: "sulit", scope: "private", usage_count: 3, content: { text: "Jelaskan struktur teks narasi dan berikan contohnya!" }, created_at: "2026-06-10" },
  { id: "3", type: "multiple_choice", mata_pelajaran: "IPA", tingkat: 7, topik: "Fotosintesis", difficulty: "mudah", scope: "yayasan", usage_count: 28, content: { text: "Proses fotosintesis terjadi di bagian sel tumbuhan yang disebut...?" }, created_at: "2026-06-08" },
  { id: "4", type: "true_false", mata_pelajaran: "PKn", tingkat: 9, topik: "Pancasila", difficulty: "mudah", scope: "sekolah", usage_count: 5, content: { text: "Pancasila disahkan pada tanggal 1 Juni 1945." }, created_at: "2026-06-05" },
  { id: "5", type: "multiple_choice", mata_pelajaran: "Matematika", tingkat: 10, topik: "Trigonometri", difficulty: "sulit", scope: "private", usage_count: 0, content: { text: "Nilai dari sin 30° × cos 60° + tan 45° adalah..." }, created_at: "2026-06-02" },
];

const TYPE_LABEL: Record<string, string> = {
  multiple_choice: "Pilihan Ganda",
  essay: "Esai",
  true_false: "Benar/Salah",
  fill_blank: "Isian",
};

const DIFF_STYLE: Record<string, string> = {
  mudah: "badge-success",
  sedang: "badge-warning",
  sulit: "badge-danger",
};

const SCOPE_STYLE: Record<string, { label: string; className: string }> = {
  private: { label: "Pribadi", className: "text-gray-500" },
  sekolah: { label: "Sekolah", className: "text-blue-600" },
  yayasan: { label: "Yayasan", className: "text-green-600" },
};

export default function BankSoalPage() {
  const [search, setSearch] = useState("");
  const [mapel, setMapel] = useState("Semua");
  const [tingkat, setTingkat] = useState("Semua");

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Bank Soal</h1>
          <p className="page-subtitle">312 soal tersimpan di perpustakaan sekolah Anda</p>
        </div>
        <Link href="/bank-soal/buat" className="btn-primary">
          <Plus className="w-4 h-4" /> Buat Soal
        </Link>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-48 card px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari soal..."
            className="bg-transparent outline-none flex-1 text-sm text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <select
          value={mapel}
          onChange={(e) => setMapel(e.target.value)}
          className="input-field w-auto"
        >
          {MAPEL.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={tingkat}
          onChange={(e) => setTingkat(e.target.value)}
          className="input-field w-auto"
        >
          {TINGKAT.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/80">
              {["Soal", "Tipe", "Mapel · Kelas", "Kesulitan", "Scope", "Dipakai", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left font-medium text-xs text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DUMMY_QUESTIONS.map((q) => {
              const scope = SCOPE_STYLE[q.scope];
              return (
                <tr key={q.id} className="border-b border-white/60 hover:bg-white/70 transition-colors">
                  <td className="px-5 py-4 max-w-xs">
                    <div className="text-gray-900 truncate">{q.content.text}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{q.topik}</div>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{TYPE_LABEL[q.type]}</td>
                  <td className="px-5 py-4">
                    <div className="text-gray-900">{q.mata_pelajaran}</div>
                    <div className="text-[11px] text-gray-400">Kelas {q.tingkat}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={DIFF_STYLE[q.difficulty ?? "sedang"]}>{q.difficulty}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-medium ${scope.className}`}>{scope.label}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{q.usage_count}×</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/80">
          <span className="text-sm text-gray-500">Menampilkan 1–20 dari 312 soal</span>
          <div className="flex gap-1">
            {["1", "2", "3", "...", "16"].map((p) => (
              <button
                key={p}
                className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-colors ${
                  p === "1"
                    ? "bg-[#2f66e9] text-white"
                    : "text-gray-600 hover:bg-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
