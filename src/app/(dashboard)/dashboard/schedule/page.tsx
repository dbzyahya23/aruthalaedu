import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch upcoming exams (published only for a realistic schedule view)
  const { data: exams } = await supabase
    .from('exams')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Jadwal Ujian</h1>
        <p className="text-muted-foreground">Lihat agenda ujian yang dijadwalkan untuk Anda minggu ini.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Kalender Ujian Mendatang
          </CardTitle>
          <CardDescription>Ujian yang harus Anda kerjakan dalam waktu dekat.</CardDescription>
        </CardHeader>
        <CardContent>
          {exams && exams.length > 0 ? (
            <div className="space-y-4">
              {exams.map((exam, index) => {
                // Mocking future dates based on created_at for demo purposes
                const date = new Date(exam.created_at);
                date.setDate(date.getDate() + index + 1); // 1, 2, 3 days from now
                
                return (
                  <div key={exam.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex-none flex flex-col items-center justify-center w-20 h-20 rounded-md bg-primary/10 text-primary">
                      <span className="text-xs font-semibold uppercase">{date.toLocaleString('id-ID', { month: 'short' })}</span>
                      <span className="text-2xl font-bold">{date.getDate()}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-lg line-clamp-1">{exam.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{exam.description || "Tidak ada deskripsi."}</p>
                      <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {exam.duration_minutes} Menit</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> Wajib</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 bg-muted/20 border border-dashed rounded-xl">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground text-center">Hore! Belum ada ujian yang dijadwalkan dalam waktu dekat.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
