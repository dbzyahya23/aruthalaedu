import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#f5f9ff_100%)] flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(194,220,255,0.55),transparent_30%),radial-gradient(circle_at_80%_60%,rgba(202,231,255,0.6),transparent_30%)]" />
      <div className="w-full max-w-lg">
        <div className="relative text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#2f66e9] rounded-[18px] mb-4 shadow-[0_12px_28px_rgba(47,102,233,0.24)]">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-[-0.03em]">Daftar Sekolah</h1>
          <p className="text-sm text-gray-500 mt-1">Silakan hubungi admin sekolah untuk aktivasi akun.</p>
        </div>

        <div className="relative card card-padding shadow-[0_24px_70px_rgba(57,111,190,0.12)]">
          <div className="space-y-4 text-sm text-gray-600">
            <p>Fitur pendaftaran mandiri belum tersedia untuk sementara.</p>
            <p>Untuk menggunakan Aruthala, minta kode sekolah kepada guru atau admin IT.</p>
          </div>

          <div className="mt-8">
            <Link
              href="/login"
              className="btn-primary w-full justify-center py-3"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
