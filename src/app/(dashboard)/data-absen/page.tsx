"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { ClipboardCheck, Download, Loader2, Search } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

type AttendanceStatus = "Hadir" | "Izin" | "Sakit" | "Alpa" | "Libur";

type AttendanceRow = {
  id: string;
  tanggal: string;
  status: AttendanceStatus;
  jam_datang: string | null;
  jam_pulang: string | null;
  keterangan: string | null;
  siswa_id: string;
  siswa_name: string;
};

const STATUS_STYLE: Record<AttendanceStatus, string> = {
  Hadir: "bg-green-50 text-green-600 border border-green-200",
  Izin: "bg-blue-50 text-blue-600 border border-blue-200",
  Sakit: "bg-amber-50 text-amber-600 border border-amber-200",
  Alpa: "bg-red-50 text-red-600 border border-red-200",
  Libur: "bg-gray-100 text-gray-500 border border-gray-200",
};

export default function DataAbsenPage() {
  const identity = useDashboardIdentity();
  const supabase = createClient();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelasList, setKelasList] = useState<{ id: string; name: string }[]>([]);
  const [selectedKelas, setSelectedKelas] = useState("");

  // Fetch kelas list
  useEffect(() => {
    const fetchKelas = async () => {
      const { data } = await supabase.from("kelas").select("id, name").order("name");
      if (data) setKelasList(data);
    };
    fetchKelas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch attendance data
  const fetchData = useCallback(async () => {
    setLoading(true);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;

    let query = supabase
      .from("attendance")
      .select("id, tanggal, status, jam_datang, jam_pulang, keterangan, siswa_id, profiles!attendance_siswa_id_fkey(full_name)")
      .gte("tanggal", startDate)
      .lte("tanggal", endDate)
      .order("tanggal", { ascending: true });

    if (selectedKelas) {
      query = query.eq("kelas_id", selectedKelas);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Fetch data-absen error:", error);
      setRows([]);
    } else {
      const mapped: AttendanceRow[] = (data || []).map((d: Record<string, unknown>) => ({
        id: d.id as string,
        tanggal: d.tanggal as string,
        status: d.status as AttendanceStatus,
        jam_datang: d.jam_datang as string | null,
        jam_pulang: d.jam_pulang as string | null,
        keterangan: d.keterangan as string | null,
        siswa_id: d.siswa_id as string,
        siswa_name: (d.profiles as Record<string, string>)?.full_name || "Siswa",
      }));
      setRows(mapped);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, selectedKelas]);

  useEffect(() => {
    if (!identity.loading) fetchData();
  }, [fetchData, identity.loading]);

  // Stats
  const stats = useMemo(() => {
    const schoolDays = rows.filter((r) => r.status !== "Libur");
    const hadir = rows.filter((r) => r.status === "Hadir").length;
    const izinSakit = rows.filter((r) => r.status === "Izin" || r.status === "Sakit").length;
    const alpa = rows.filter((r) => r.status === "Alpa").length;
    const rate = schoolDays.length > 0 ? Math.round((hadir / schoolDays.length) * 100) : 0;
    return { rate, hadir, izinSakit, alpa };
  }, [rows]);

  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.siswa_name.toLowerCase().includes(q) || r.tanggal.includes(q) || r.status.toLowerCase().includes(q));
  }, [rows, search]);

  const formatDate = (d: string) => {
    const date = new Date(d + "T00:00:00");
    return new Intl.DateTimeFormat("id-ID", { weekday: "short", day: "numeric", month: "short" }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-padding flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Rekap Data Absen</h1>
            <p className="page-subtitle">Dasbor rekapitulasi absensi seluruh siswa per kelas.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/overview" className="btn-outline text-sm px-4 py-2 rounded-xl">← Kembali</Link>
          <button className="btn-secondary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 opacity-50 cursor-not-allowed">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Persentase Hadir", value: `${stats.rate}%`, color: "text-[#2f66e9]", bg: "bg-[#eef5ff]" },
          { label: "Total Hadir", value: stats.hadir, color: "text-green-600", bg: "bg-green-50" },
          { label: "Izin / Sakit", value: stats.izinSakit, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Alpa", value: stats.alpa, color: "text-red-600", bg: "bg-red-50" },
        ].map((s) => (
          <div key={s.label} className="card card-padding">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card card-padding">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
              <option value="">Semua Kelas</option>
              {kelasList.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(year, i).toLocaleString("id-ID", { month: "long" })}</option>
              ))}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="w-20 px-3 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Cari nama siswa..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all" />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#2f66e9]" />
            <span className="ml-2 text-sm text-gray-500">Memuat data absensi...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Belum ada data absensi untuk filter ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 mt-4">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider w-12">No</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nama Siswa</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Datang</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pulang</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((r, i) => (
                  <tr key={r.id} className={`hover:bg-[#f8fbff] transition-colors ${i % 2 === 1 ? "bg-gray-50/30" : ""}`}>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{r.siswa_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{formatDate(r.tanggal)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">{r.jam_datang || "-"}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium text-gray-600">{r.jam_pulang || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 truncate max-w-[200px]">{r.keterangan || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
