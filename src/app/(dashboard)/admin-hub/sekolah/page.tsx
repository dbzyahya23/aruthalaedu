"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Building2, Edit2, CheckCircle2, XCircle, ArrowLeft, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { Sekolah } from "@/types";

export default function TenantManagementPage() {
  const [sekolahList, setSekolahList] = useState<Sekolah[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMaxSiswa, setEditMaxSiswa] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchSekolah();
  }, []);

  async function fetchSekolah() {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("sekolah")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && !error) {
      setSekolahList(data as Sekolah[]);
    }
    setLoading(false);
  }

  async function toggleStatus(id: string, currentStatus: boolean) {
    if (!confirm(`Apakah Anda yakin ingin ${currentStatus ? "MENONAKTIFKAN" : "MENGAKTIFKAN"} sekolah ini?`)) return;
    
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sekolah")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      setMessage({ text: "Gagal mengubah status: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Status sekolah berhasil diperbarui.", type: "success" });
      setSekolahList(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
    }
  }

  async function saveMaxSiswa(id: string) {
    setSaving(true);
    setMessage(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("sekolah")
      .update({ max_siswa: editMaxSiswa })
      .eq("id", id);

    if (error) {
      setMessage({ text: "Gagal menyimpan batas siswa: " + error.message, type: "error" });
    } else {
      setMessage({ text: "Batas siswa berhasil diperbarui.", type: "success" });
      setSekolahList(prev => prev.map(s => s.id === id ? { ...s, max_siswa: editMaxSiswa } : s));
      setEditingId(null);
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-hub" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#2f66e9]" />
            Manajemen Tenant (Sekolah)
          </h1>
          <p className="text-sm text-gray-500">Kelola status aktif dan batasan kapasitas setiap sekolah (tenant).</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-semibold ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="card border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f66e9]"></div>
            <p className="mt-4 text-sm text-gray-500">Memuat daftar sekolah...</p>
          </div>
        ) : sekolahList.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <Building2 className="h-12 w-12 text-gray-300 mb-3" />
            <p>Belum ada sekolah terdaftar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Nama Sekolah</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Jenjang</th>
                  <th scope="col" className="px-6 py-4 font-semibold">NPSN / Kode</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Batas Siswa</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sekolahList.map((sekolah) => (
                  <tr key={sekolah.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{sekolah.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{sekolah.id}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-700">
                      {sekolah.jenjang}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700">{sekolah.npsn || "-"}</div>
                      <div className="text-xs text-gray-400">Slug: {sekolah.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      {editingId === sekolah.id ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            className="w-20 px-2 py-1 text-sm border rounded"
                            value={editMaxSiswa}
                            onChange={(e) => setEditMaxSiswa(parseInt(e.target.value) || 0)}
                          />
                          <button 
                            disabled={saving}
                            onClick={() => saveMaxSiswa(sekolah.id)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{sekolah.max_siswa}</span>
                          <button 
                            onClick={() => {
                              setEditingId(sekolah.id);
                              setEditMaxSiswa(sekolah.max_siswa);
                            }}
                            className="p-1 text-gray-400 hover:text-[#2f66e9]"
                            title="Edit Batas Siswa"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => toggleStatus(sekolah.id, sekolah.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          sekolah.is_active ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={sekolah.is_active ? "Nonaktifkan Tenant" : "Aktifkan Tenant"}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sekolah.is_active ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {sekolah.is_active ? 'Aktif' : 'Non-Aktif'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Placeholder for future actions like Delete or Export */}
                    </td>
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
