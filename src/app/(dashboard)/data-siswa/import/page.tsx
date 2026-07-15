"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import * as XLSX from "xlsx";
import { useUserRole } from "@/hooks/useUserRole";

export default function ImportSiswaPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  
  const { user, isSiswa, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  if (roleLoading || isSiswa) {
    return <div className="p-8 text-center text-gray-500">Memeriksa akses...</div>;
  }

  const handleFile = (f: File) => {
    setFile(f);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };
  const handleUpload = async () => {
    if (!file) return;
    if (!user?.sekolah_id) {
      alert("Error: Anda belum terhubung dengan institusi/sekolah.");
      return;
    }
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      const payload = jsonData.map((row) => ({
        id: crypto.randomUUID(),
        full_name: row.nama_lengkap || row.nama || row.name || 'Tanpa Nama',
        nisn: row.nisn || row.NISN || null,
        role: 'SISWA',
        sekolah_id: user.sekolah_id,
        is_active: true
      }));

      if (payload.length > 0) {
        const supabase = createClient();
        const { error } = await supabase.from('profiles').insert(payload);
        if (error) throw error;
      }
      setDone(true);
    } catch (err: any) {
      alert("Gagal memproses file: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/data-siswa" className="btn-outline p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="page-title">Import Siswa</h1>
          <p className="page-subtitle">Upload file CSV atau Excel dari Dapodik</p>
        </div>
      </div>

      {done ? (
        <div className="card card-padding text-center py-12">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Import Berhasil!</h2>
          <p className="text-sm text-gray-500">Siswa berhasil diimport ke dalam pangkalan data.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
            className={`flex flex-col items-center justify-center p-12 rounded-2xl text-center cursor-pointer transition-all border-2 border-dashed ${
              dragging ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-blue-300"
            }`}
          >
            <Upload className={`w-8 h-8 mb-3 ${dragging ? "text-blue-600" : "text-gray-400"}`} />
            <p className="font-semibold text-gray-900 mb-1">
              {file ? file.name : "Drag & drop file di sini"}
            </p>
            <p className="text-sm text-gray-500">Format: CSV atau Excel (.xlsx) · Maks 5.000 siswa</p>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary w-full py-3"
            >
              {uploading ? "Mengimpor..." : "Proses Import"}
            </button>
          )}

          <div className="card card-padding">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Kolom yang dibutuhkan
              </p>
              <a 
                href="/templates/template_import_siswa.csv" 
                download 
                className="text-xs font-medium text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
              >
                Unduh Template CSV
              </a>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["nisn", "nama_lengkap", "kelas", "tanggal_lahir"].map((c) => (
                <span key={c} className="badge-info font-mono">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
