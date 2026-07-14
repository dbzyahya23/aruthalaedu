import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamQuestionsPage({ params }: { params: Promise<{ exam_id: string }> }) {
  const unwrappedParams = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Only Teacher/Admin
  const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (userData?.role === 'student') redirect("/dashboard/exams");

  // Fetch Exam
  const { data: exam } = await supabase.from('exams').select('title').eq('id', unwrappedParams.exam_id).single();
  if (!exam) return <div>Ujian tidak ditemukan.</div>;

  // Fetch Questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('exam_id', unwrappedParams.exam_id)
    .order('created_at', { ascending: true });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/exams/${unwrappedParams.exam_id}/edit`}>
            <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manajemen Soal</h1>
            <p className="text-muted-foreground">{exam.title}</p>
          </div>
        </div>
        <Link href={`/dashboard/exams/${unwrappedParams.exam_id}/questions/new`}>
          <Button><PlusCircle className="w-4 h-4 mr-2" /> Tambah Soal</Button>
        </Link>
      </div>

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((q, idx) => (
            <Card key={q.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Badge variant="outline">Soal No. {idx + 1}</Badge>
                  <Badge>{q.type === 'multiple_choice' ? 'Pilihan Ganda' : 'Esai'}</Badge>
                </div>
                <CardTitle className="text-lg pt-2 leading-relaxed">{q.content}</CardTitle>
              </CardHeader>
              <CardContent>
                {q.type === 'multiple_choice' && q.options && (
                  <div className="grid sm:grid-cols-2 gap-2 mt-2">
                    {Array.isArray(q.options) && q.options.map((opt: string, oIdx: number) => (
                      <div 
                        key={oIdx} 
                        className={`p-3 rounded-md border text-sm flex items-center gap-3
                          ${opt === q.correct_answer ? 'bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400 font-semibold' : 'bg-muted/30'}`}
                      >
                        <div className="w-6 h-6 rounded-full bg-background border flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/20">
            <p className="text-muted-foreground mb-4">Ujian ini belum memiliki soal satupun.</p>
            <p className="text-xs text-muted-foreground">Silakan gunakan fitur Auto-Generate di menu Pengaturan untuk memunculkan contoh soal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
