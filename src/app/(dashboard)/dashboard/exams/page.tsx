import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = userData?.role || 'student';
  const isTeacher = role === 'admin' || role === 'teacher';

  // Fetch exams
  // RLS will automatically filter out draft exams for students
  const { data: exams, error } = await supabase
    .from('exams')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Ujian</h1>
          <p className="text-muted-foreground">
            {isTeacher 
              ? "Kelola semua modul ujian yang tersedia." 
              : "Modul ujian yang dapat Anda kerjakan saat ini."}
          </p>
        </div>
        {isTeacher && (
          <Link href="/dashboard/exams/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Buat Ujian Baru
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {exams && exams.length > 0 ? (
          exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col hover:shadow-lg transition-all border-primary/10">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={exam.status === 'published' ? "default" : "secondary"}>
                    {exam.status === 'published' ? "Tersedia" : "Draft"}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3 mr-1" />
                    {exam.duration_minutes} mnt
                  </div>
                </div>
                <CardTitle className="line-clamp-1 text-lg">{exam.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {exam.description || "Tidak ada deskripsi."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
              </CardContent>
              <CardFooter className="pt-4 border-t gap-2">
                {isTeacher ? (
                  <>
                    <Link href={`/dashboard/exams/${exam.id}/edit`} className="w-full">
                      <Button variant="outline" className="w-full">
                        <Settings className="w-4 h-4 mr-2" /> Kelola Ujian
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href={`/${exam.id}`} className="w-full">
                    <Button className="w-full">Kerjakan Ujian</Button>
                  </Link>
                )}
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-muted/30 border border-dashed rounded-xl">
            <p className="text-muted-foreground text-center">Belum ada ujian yang tersedia saat ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
