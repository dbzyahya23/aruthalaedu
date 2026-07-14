import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, XCircle, Award } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ExamResultsPage({ params }: { params: Promise<{ exam_id: string }> }) {
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

  // Fetch Questions to know the correct answers
  const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('exam_id', unwrappedParams.exam_id);

  const totalQuestions = questions?.length || 0;

  // Fetch all answers joined with user data
  const { data: answers } = await supabase
    .from('answers')
    .select('user_id, question_id, answer_content, users(name)')
    .eq('exam_id', unwrappedParams.exam_id);

  // Auto-Grading Logic
  const studentScores: Record<string, { name: string, correct: number, total: number, score: number }> = {};

  if (answers && questions) {
    answers.forEach(ans => {
      const uId = ans.user_id;
      if (!studentScores[uId]) {
        studentScores[uId] = {
          name: (ans.users as any)?.name || 'Siswa Tanpa Nama',
          correct: 0,
          total: totalQuestions,
          score: 0
        };
      }
      
      const relatedQuestion = questions.find(q => q.id === ans.question_id);
      if (relatedQuestion && relatedQuestion.correct_answer === ans.answer_content) {
        studentScores[uId].correct += 1;
      }
    });

    // Calculate final percentage score
    Object.keys(studentScores).forEach(uId => {
      studentScores[uId].score = Math.round((studentScores[uId].correct / totalQuestions) * 100) || 0;
    });
  }

  const resultsList = Object.values(studentScores).sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/exams/${unwrappedParams.exam_id}/edit`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analisis Hasil Siswa</h1>
          <p className="text-muted-foreground">{exam.title}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="md:col-span-1 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" /> Rata-Rata Kelas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {resultsList.length > 0 
                ? Math.round(resultsList.reduce((acc, curr) => acc + curr.score, 0) / resultsList.length) 
                : 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Dari {resultsList.length} partisipan</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Peringkat Nilai Siswa</CardTitle>
            <CardDescription>Sistem telah menghitung nilai secara otomatis berdasarkan kunci jawaban ({totalQuestions} Soal).</CardDescription>
          </CardHeader>
          <CardContent>
            {resultsList.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-semibold text-sm bg-muted/50 border-b">
                  <div className="col-span-1">No</div>
                  <div className="col-span-5">Nama Siswa</div>
                  <div className="col-span-3 text-center">Jawaban Benar</div>
                  <div className="col-span-3 text-right">Skor Akhir</div>
                </div>
                <div className="divide-y">
                  {resultsList.map((res, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 p-4 text-sm items-center hover:bg-muted/20 transition-colors">
                      <div className="col-span-1 font-medium text-muted-foreground">{idx + 1}</div>
                      <div className="col-span-5 font-semibold">{res.name}</div>
                      <div className="col-span-3 text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{res.correct} / {res.total}</span>
                      </div>
                      <div className="col-span-3 text-right font-bold text-lg">
                        <span className={res.score >= 70 ? 'text-green-600' : 'text-red-500'}>
                          {res.score}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-lg">
                <p className="text-muted-foreground">Belum ada satupun siswa yang mengerjakan ujian ini.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
