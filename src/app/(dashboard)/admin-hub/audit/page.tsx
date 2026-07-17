"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, History, Clock, User, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AuditLog {
  id: string;
  actor_id: string;
  actor_role: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: string;
  created_at: string;
  actor_name?: string; // from profiles join
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const supabase = createClient();
      
      // Fetch logs and join with profiles to get the actor's name
      const { data, error } = await supabase
        .from("audit_logs")
        .select(`
          id, actor_id, actor_role, action, resource_type, resource_id, status, created_at,
          actor:profiles!audit_logs_actor_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (data && !error) {
        const formattedLogs = data.map((log: any) => ({
          ...log,
          actor_name: log.actor?.full_name || "Sistem / Unknown"
        }));
        setLogs(formattedLogs);
      } else {
        console.error("Failed to load audit logs", error);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin-hub" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <History className="h-6 w-6 text-[#2f66e9]" />
            Audit Logs
          </h1>
          <p className="text-sm text-gray-500">Riwayat aktivitas kritis di dalam sistem AruthalaEdu.</p>
        </div>
      </div>

      <div className="card card-padding border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2f66e9]"></div>
            <p className="mt-4 text-sm text-gray-500">Memuat riwayat aktivitas...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-500">
            <ShieldCheck className="h-12 w-12 text-gray-300 mb-3" />
            <p>Belum ada riwayat aktivitas tercatat.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold">Waktu</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Pelaku</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Tindakan</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Target / Resource</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Clock className="h-4 w-4 text-gray-400" />
                        {format(new Date(log.created_at), "dd MMM yyyy, HH:mm", { locale: id })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{log.actor_name}</span>
                        <span className="text-xs text-gray-400">{log.actor_role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">{log.resource_type || "-"}</span>
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[150px]">{log.resource_id || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === "SUCCESS" || !log.status ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Sukses
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Gagal
                        </span>
                      )}
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
