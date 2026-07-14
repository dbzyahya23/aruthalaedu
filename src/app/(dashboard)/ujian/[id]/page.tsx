"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, BarChart2 } from "lucide-react";

export default function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    let canceled = false;
    params.then((resolved) => {
      if (!canceled) setId(resolved.id);
    });
    return () => {
      canceled = true;
    };
  }, [params]);

  if (!id) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ujian" className="btn-outline p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="page-title">UTS Matematika Kelas 9A</h1>
      </div>
      <div className="flex gap-3">
        <Link href={`/ujian/${id}/monitor`} className="btn-secondary">
          <Play className="w-4 h-4" /> Live Monitor
        </Link>
        <Link href={`/ujian/${id}/hasil`} className="btn-outline">
          <BarChart2 className="w-4 h-4" /> Lihat Hasil
        </Link>
      </div>
    </div>
  );
}
