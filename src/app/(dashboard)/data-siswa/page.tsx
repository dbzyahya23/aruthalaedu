"use client";

import Link from "next/link";
import { Upload, Search } from "lucide-react";

const SISWA = [
  { id: "1", nama: "Budi Santoso", nisn: "1234567890", kelas: "9A", status: "active" },
  { id: "2", nama: "Ani Rahayu", nisn: "1234567891", kelas: "9A", status: "active" },
  { id: "3", nama: "Candra Putra", nisn: "1234567892", kelas: "9B", status: "active" },
  { id: "4", nama: "Dewi Lestari", nisn: "1234567893", kelas: "8A", status: "active" },
  { id: "5", nama: "Eko Prasetyo", nisn: "1234567894", kelas: "7A", status: "inactive" },
];

export default function SiswaPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Data Siswa</h1>
          <p className="page-subtitle">847 siswa terdaftar di sekolah ini</p>
        </div>
        <Link href="/data-siswa/import" className="btn-primary">
          <Upload className="w-4 h-4" /> Import Siswa
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 card px-3 py-2.5 max-w-xs flex-1">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Cari nama atau NISN..."
            className="bg-transparent outline-none flex-1 text-sm placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/80">
              {["Nama", "NISN", "Kelas", "Status", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SISWA.map((s) => (
              <tr key={s.id} className="border-b border-white/60 hover:bg-white/70 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-[#eef5ff] text-[#2f66e9]">
                      {s.nama[0]}
                    </div>
                    <span className="font-medium text-gray-900">{s.nama}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">{s.nisn}</td>
                <td className="px-5 py-3.5 text-gray-600">{s.kelas}</td>
                <td className="px-5 py-3.5">
                  <span className={s.status === "active" ? "badge-success" : "badge-default"}>
                    {s.status === "active" ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Detail
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
