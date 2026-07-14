import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Activity, AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch real metrics
  const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
  const { count: publishedExamCount } = await supabase.from('exams').select('*', { count: 'exact', head: true }).eq('status', 'published');
  const { count: totalExamCount } = await supabase.from('exams').select('*', { count: 'exact', head: true });
  const { count: auditLogCount } = await supabase.from('audit_logs').select('*', { count: 'exact', head: true });
  
  const { data: recentExams } = await supabase
    .from('exams')
    .select('title, status')
    .order('created_at', { ascending: false })
    .limit(3);

  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select('*, users(name)')
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Selamat datang kembali di Dashboard Aruthala Edu.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Siswa Terdaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentCount || 0}</div>
            <p className="text-xs text-muted-foreground">Berdasarkan data sistem</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ujian Aktif (Published)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedExamCount || 0}</div>
            <p className="text-xs text-muted-foreground">Tersedia untuk siswa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Modul Ujian</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExamCount || 0}</div>
            <p className="text-xs text-muted-foreground">Termasuk draft</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/20 bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Total Pelanggaran</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{auditLogCount || 0}</div>
            <p className="text-xs text-red-600">Insiden Anti-Cheat dicatat</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Modul Ujian Terbaru</CardTitle>
            <CardDescription>
              Status ujian yang baru saja dibuat atau dipublikasikan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExams && recentExams.length > 0 ? recentExams.map((exam, i) => (
                <div key={i} className="flex items-center gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className={`w-2 h-2 rounded-full ${exam.status === 'published' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{exam.title}</p>
                    <p className="text-sm text-muted-foreground">Status: {exam.status}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Belum ada ujian.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Log Anomali (Anti-Cheat)</CardTitle>
            <CardDescription>
              Aktivitas mencurigakan dari klien siswa.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLogs && recentLogs.length > 0 ? recentLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-4 border-b last:border-0 pb-4 last:pb-0">
                  <div className="bg-red-500/10 p-2 rounded-full mt-1">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{(log.users as any)?.name || 'Siswa Tidak Diketahui'}</p>
                    <p className="text-xs text-muted-foreground">Melakukan: {log.event_type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Sistem aman, tidak ada pelanggaran baru.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
