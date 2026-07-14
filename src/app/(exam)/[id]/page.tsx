"use client";

import { useEffect, useState, use } from 'react';
import { useExamStore } from '@/store/examStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { 
    exam, questions, answers, currentIndex, 
    setExamData, setAnswer, nextQuestion, prevQuestion, setCurrentIndex, clearExam 
  } = useExamStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchExam = async () => {
      // If we already have the right exam loaded in local storage, skip fetching
      if (exam && exam.id === unwrappedParams.id && questions.length > 0) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`/api/exams/${unwrappedParams.id}`);
        
        if (res.status === 401) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.message || data.error || 'Failed to load exam data');
        }
        
        setExamData(data.exam, data.questions);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Terjadi kesalahan yang tidak diketahui');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [unwrappedParams.id, exam, questions.length, setExamData]);

  if (loading) return <div className="flex h-screen items-center justify-center">Memuat soal ujian...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-destructive">{error}</div>;
  if (!exam || questions.length === 0) return <div className="flex h-screen items-center justify-center">Soal tidak ditemukan.</div>;

  const currentQuestion = questions[currentIndex];
  const ALPHABET = ['A', 'B', 'C', 'D', 'E'];

  const handleSubmit = async () => {
    if (!confirm('Apakah Anda yakin ingin mengumpulkan jawaban? Aksi ini tidak dapat dibatalkan.')) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/exams/${exam.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      
      if (!res.ok) throw new Error('Gagal mengirim jawaban');
      
      clearExam();
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat mengumpulkan. Jawaban Anda masih aman di penyimpanan lokal. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-muted/20">
      {/* Sidebar for Navigation */}
      <div className="w-full md:w-64 bg-card border-r p-4 flex flex-col overflow-y-auto">
        <h2 className="font-bold text-lg mb-2">{exam.title}</h2>
        <div className="text-sm text-muted-foreground mb-6">Waktu Tersisa: {exam.duration_minutes} Menit</div>
        
        <div className="grid grid-cols-5 gap-2 mb-6">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q.id];
            const isActive = idx === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-10 h-10 rounded flex items-center justify-center text-sm font-medium transition-colors
                  ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}
                  ${isAnswered ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
        
        <div className="mt-auto pt-4">
          <Button variant="default" className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Mengumpulkan...' : 'Kumpulkan Ujian'}
          </Button>
        </div>
      </div>

      {/* Main Exam Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <Card className="max-w-4xl mx-auto shadow-md">
          <CardContent className="p-6 md:p-10">
            <div className="flex items-start mb-6">
              <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded mr-4">
                Soal {currentIndex + 1}
              </span>
              <p className="text-lg leading-relaxed">{currentQuestion.content}</p>
            </div>

            {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
              <div className="space-y-3 mt-8">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = answers[currentQuestion.id] === option;
                  const letter = ALPHABET[idx] || '';
                  return (
                    <div
                      key={idx}
                      onClick={() => setAnswer(currentQuestion.id, option)}
                      className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors
                        ${isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted'}`}
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full mr-4 text-sm font-bold
                        ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {letter}
                      </div>
                      <span className={isSelected ? 'font-medium' : ''}>{option}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {currentQuestion.type === 'essay' && (
              <div className="mt-8">
                <textarea
                  className="w-full h-48 p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Ketik jawaban Anda di sini..."
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => setAnswer(currentQuestion.id, e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-between mt-10 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={prevQuestion} 
                disabled={currentIndex === 0}
              >
                Sebelumnya
              </Button>
              {currentIndex === questions.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isSubmitting ? 'Mengumpulkan...' : 'Selesai & Kumpulkan'}
                </Button>
              ) : (
                <Button 
                  onClick={nextQuestion}
                >
                  Selanjutnya
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
