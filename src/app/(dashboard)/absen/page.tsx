"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { CalendarCheck, Search, Plus, X, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useDashboardIdentity } from "@/components/layout/useDashboardIdentity";

type AttendanceRow = {
  id: string;
  tanggal: string;
  status: "Hadir" | "Izin" | "Sakit" | "Alpa" | "Libur";
  jam_datang: string | null;
  jam_pulang: string | null;
  keterangan: string | null;
  siswa_id: string;
  siswa_name?: string;
};

const STATUS_STYLE: Record<string, string> = {
  Hadir: "bg-green-50 text-green-600 border border-green-200",
  Izin: "bg-blue-50 text-blue-600 border border-blue-200",
  Sakit: "bg-amber-50 text-amber-600 border border-amber-200",
  Alpa: "bg-red-50 text-red-600 border border-red-200",
  Libur: "bg-gray-100 text-gray-600 border border-gray-200",
};

export default function AbsenPage() {
  const identity = useDashboardIdentity();
  const isStaff = ["admin", "teacher"].includes(identity.roleGroup);
  const supabase = createClient();

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Form state untuk input absensi (guru/admin)
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ siswa_id: "", tanggal: "", status: "Hadir", jam_datang: "", jam_pulang: "", keterangan: "" });
  const [siswaList, setSiswaList] = useState<{ id: string; full_name: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Fetch attendance data
  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(month).padStart(2, "0")}-${new Date(year, month, 0).getDate()}`;

    let query = supabase
      .from("attendance")
      .select("id, tanggal, status, jam_datang, jam_pulang, keterangan, siswa_id")
      .gte("tanggal", startDate)
      .lte("tanggal", endDate)
      .order("tanggal", { ascending: true });

    // Siswa hanya lihat data sendiri (RLS sudah handle, tapi eksplisit agar jelas)
    if (!isStaff && identity.userId) {
      query = query.eq("siswa_id", identity.userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Fetch attendance error:", error);
      setRows([]);
    } else {
      setRows((data as AttendanceRow[]) || []);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year, isStaff, identity.userId]);

  useEffect(() => {
    if (!identity.loading) fetchAttendance();
  }, [fetchAttendance, identity.loading]);

  // Fetch siswa list for form (guru/admin only)
  useEffect(() => {
    if (!isStaff) return;
    const fetchSiswa = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "SISWA")
        .order("full_name");
      if (data) setSiswaList(data);
    };
    fetchSiswa();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStaff]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.siswa_id || !formData.tanggal || !formData.status) return;
    setSaving(true);

    const { error } = await supabase.from("attendance").upsert({
      siswa_id: formData.siswa_id,
      sekolah_id: identity.sekolahId,
      yayasan_id: identity.yayasanId,
      tanggal: formData.tanggal,
      status: formData.status,
      jam_datang: formData.jam_datang || null,
      jam_pulang: formData.jam_pulang || null,
      keterangan: formData.keterangan || null,
      recorded_by: identity.userId,
    }, { onConflict: "siswa_id,tanggal" });

    setSaving(false);
    if (error) {
      alert("Gagal menyimpan: " + error.message);
    } else {
      setShowForm(false);
      setFormData({ siswa_id: "", tanggal: "", status: "Hadir", jam_datang: "", jam_pulang: "", keterangan: "" });
      fetchAttendance();
    }
  };

  // Statistics
  const stats = useMemo(() => {
    const total = rows.filter(r => r.status !== "Libur").length;
    const hadir = rows.filter(r => r.status === "Hadir").length;
    const sakit = rows.filter(r => r.status === "Sakit").length;
    const izin = rows.filter(r => r.status === "Izin").length;
    const alpa = rows.filter(r => r.status === "Alpa").length;
    const rate = total > 0 ? Math.round((hadir / total) * 100) : 0;
    return { total, hadir, sakit, izin, alpa, rate };
  }, [rows]);

  // Filter rows by search
  const filtered = useMemo(() => {
    if (!search) return rows;
    return rows.filter(r => r.tanggal.includes(search) || r.status.toLowerCase().includes(search.toLowerCase()));
  }, [rows, search]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }).format(d);
  };

  const isWeekend = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.getDay() === 0 || d.getDay() === 6;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card card-padding flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eef5ff] text-[#2f66e9]">
            <CalendarCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">{isStaff ? "Manajemen Absensi" : "Data Absensi Saya"}</h1>
            <p className="page-subtitle">{isStaff ? "Kelola dan input absensi harian siswa." : "Rekapitulasi kehadiran harian Anda di sekolah."}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all text-sm font-semibold text-gray-700 outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(year, i).toLocaleString("id-ID", { month: "long" })} {year}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-20 px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-[#2f66e9]/20"
          />
          {isStaff && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors shadow-lg shadow-[#2f66e9]/20"
            >
              <Plus className="w-4 h-4" /> Input Absen
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Kehadiran", value: `${stats.rate}%`, color: "text-[#2f66e9]" },
          { label: "Hadir", value: stats.hadir, color: "text-green-600" },
          { label: "Izin", value: stats.izin, color: "text-blue-600" },
          { label: "Sakit", value: stats.sakit, color: "text-amber-600" },
          { label: "Alpa", value: stats.alpa, color: "text-red-600" },
        ].map((s) => (
          <div key={s.label} className="card card-padding text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card card-padding space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Riwayat Kehadiran</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tanggal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#2f66e9]/20 focus:border-[#2f66e9] transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-[#2f66e9]" />
            <span className="ml-2 text-sm text-gray-500">Memuat data absensi...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CalendarCheck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Belum ada data absensi untuk bulan ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider w-16">No</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Datang</th>
                  <th className="px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Pulang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((row, idx) => (
                  <tr key={row.id} className={`hover:bg-[#f8fbff] transition-colors ${isWeekend(row.tanggal) ? "bg-gray-50/50" : ""}`}>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-500">{idx + 1}</td>
                    <td className={`px-5 py-3 text-sm ${isWeekend(row.tanggal) ? "text-red-500 font-medium" : "text-gray-900 font-semibold"}`}>
                      {formatDate(row.tanggal)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[row.status] || STATUS_STYLE.Libur}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.jam_datang || "-"}</td>
                    <td className="px-5 py-3 text-center text-sm font-medium text-gray-700">{row.jam_pulang || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form Input Absensi (Guru/Admin only) */}
      {showForm && isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Input Absensi Harian</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Siswa</label>
                <select value={formData.siswa_id} onChange={(e) => setFormData(p => ({ ...p, siswa_id: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
                  <option value="">Pilih siswa...</option>
                  {siswaList.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Tanggal</label>
                <input type="date" value={formData.tanggal} onChange={(e) => setFormData(p => ({ ...p, tanggal: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Status</label>
                <select value={formData.status} onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))} required
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20">
                  {["Hadir", "Izin", "Sakit", "Alpa", "Libur"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jam Datang</label>
                  <input type="time" value={formData.jam_datang} onChange={(e) => setFormData(p => ({ ...p, jam_datang: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Jam Pulang</label>
                  <input type="time" value={formData.jam_pulang} onChange={(e) => setFormData(p => ({ ...p, jam_pulang: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Keterangan</label>
                <input type="text" value={formData.keterangan} onChange={(e) => setFormData(p => ({ ...p, keterangan: e.target.value }))} placeholder="Opsional"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-[#2f66e9]/20" />
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 rounded-xl bg-[#2f66e9] text-white text-sm font-semibold hover:bg-[#2558d4] transition-colors disabled:opacity-50 shadow-lg shadow-[#2f66e9]/20">
                {saving ? "Menyimpan..." : "Simpan Absensi"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
