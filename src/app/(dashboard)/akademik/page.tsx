"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function AkademikPage() {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  if (roleLoading || isSiswa) return <div className="p-8 text-center text-gray-500">Memeriksa akses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Akademik</h1>
          <p className="page-subtitle">Kelola tahun ajaran dan kelas</p>
        </div>
      </div>
      <div className="card card-padding text-center text-gray-500 py-20">
        Modul Akademik sedang dalam pengembangan.
      </div>
    </div>
  );
}
