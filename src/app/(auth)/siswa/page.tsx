"use client";

import { useState } from "react";
import { Shield, User, Calendar, School } from "lucide-react";
import Link from "next/link";

export default function SiswaLoginPage() {
  const [nisn, setNisn] = useState("");
  const [dob, setDob] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/student-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({ nisn, tanggal_lahir: dob, sekolah_slug: sekolah }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Login gagal");
      }
      const { access_token } = await res.json();
      sessionStorage.setItem("siswa_token", access_token);
      window.location.href = "/overview";
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-[#e3ebfa] bg-[#edf3ff]/75 py-4 pl-14 pr-5 text-base text-[#1e293b] outline-none transition-all placeholder:text-[#9aabc2] focus:border-[#6c97fa] focus:bg-white focus:ring-4 focus:ring-[#5485f1]/10";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7fbff] flex items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_17%_18%,rgba(194,220,255,0.62),transparent_30%),radial-gradient(circle_at_80%_50%,rgba(202,231,255,0.64),transparent_30%),radial-gradient(circle_at_48%_92%,rgba(255,255,255,0.98),transparent_34%)]" />

      <div className="relative z-10 flex w-full max-w-[480px] flex-col items-center">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-[21px] bg-[#2f66e9] shadow-[0_12px_28px_rgba(47,102,233,0.3)]">
            <Shield className="h-8 w-8 text-white" strokeWidth={2.1} />
          </div>
          <h1 className="text-[30px] font-bold leading-tight tracking-[-0.035em] text-[#1f2c43]">
            Masuk Ujian
          </h1>
          <p className="mt-2 text-base text-[#667a99]">Masuk menggunakan NISN dan tanggal lahir</p>
        </div>

        <div className="w-full rounded-[25px] border border-white/80 bg-white/60 p-8 shadow-[0_24px_70px_rgba(57,111,190,0.16)] backdrop-blur-xl sm:p-9">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a5bf]" />
              <input
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="NISN (10 digit)"
                required
                maxLength={10}
                pattern="\d{10}"
                className={inputClass}
              />
            </div>

            <div className="relative">
              <Calendar className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a5bf]" />
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div className="relative">
              <School className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#91a5bf]" />
              <input
                type="text"
                value={sekolah}
                onChange={(e) => setSekolah(e.target.value)}
                placeholder="Kode sekolah (dari guru)"
                required
                className={inputClass}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || nisn.length !== 10 || !dob || !sekolah}
              className="w-full rounded-2xl bg-[#2f66e9] py-4 text-base font-semibold text-white shadow-[0_7px_12px_rgba(47,102,233,0.23)] transition-all hover:bg-[#285bd3] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 leading-relaxed">
              NISN adalah nomor 10 digit yang tertera di kartu pelajar atau buku raport. Hubungi guru jika lupa.
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/login" className="text-sm text-[#687b98] hover:text-[#2f66e9] transition-colors">
            ← Kembali ke login guru
          </Link>
        </div>
      </div>
    </div>
  );
}
