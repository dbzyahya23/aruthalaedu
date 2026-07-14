"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Save, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NewQuestionPage({ params }: { params: Promise<{ exam_id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<"multiple_choice" | "essay">("multiple_choice");
  const [content, setContent] = useState("");
  
  // Multiple choice options
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!content.trim()) {
      setErrorMsg("Pertanyaan tidak boleh kosong!");
      return;
    }

    if (questionType === "multiple_choice") {
      if (options.some(opt => !opt.trim())) {
        setErrorMsg("Semua 4 opsi pilihan ganda (A, B, C, D) harus diisi!");
        return;
      }
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("questions").insert({
        exam_id: unwrappedParams.exam_id,
        content: content.trim(),
        type: questionType,
        options: questionType === "multiple_choice" ? options : null,
        correct_answer: questionType === "multiple_choice" ? options[correctIndex] : null,
      });

      if (error) {
        throw error;
      }

      router.push(`/dashboard/exams/${unwrappedParams.exam_id}/questions`);
      router.refresh();
    } catch (err: any) {
      console.error("Error inserting question:", err);
      setErrorMsg(err.message || "Gagal menyimpan soal. Pastikan Anda memiliki akses Guru/Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/exams/${unwrappedParams.exam_id}/questions`}>
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tambah Soal Baru</h1>
          <p className="text-muted-foreground">Buat pertanyaan untuk ujian ini dan simpan ke database.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Rincian Soal</CardTitle>
            <CardDescription>Pilih jenis soal dan masukkan teks pertanyaan beserta opsi jawabannya.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {errorMsg && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <Label>Jenis Pertanyaan</Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setQuestionType("multiple_choice")}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    questionType === "multiple_choice"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" /> Pilihan Ganda (Multiple Choice)
                </button>
                <button
                  type="button"
                  onClick={() => setQuestionType("essay")}
                  className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    questionType === "essay"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/30 hover:bg-muted text-muted-foreground"
                  }`}
                >
                  Esai / Jawaban Terbuka
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Teks Pertanyaan <span className="text-red-500">*</span></Label>
              <Textarea
                id="content"
                rows={4}
                placeholder="Tuliskan pertanyaan ujian di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            {questionType === "multiple_choice" && (
              <div className="space-y-4 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label>Opsi Jawaban (A, B, C, D)</Label>
                  <span className="text-xs text-muted-foreground">Klik tombol bulat hijau untuk menentukan kunci jawaban yang benar.</span>
                </div>

                <div className="grid gap-3">
                  {options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isCorrect = correctIndex === idx;

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCorrectIndex(idx)}
                          title="Jadikan Kunci Jawaban Benar"
                          className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm border transition-all ${
                            isCorrect
                              ? "bg-green-500 text-white border-green-600 shadow-md scale-105"
                              : "bg-muted text-muted-foreground border-muted-foreground/30 hover:border-green-500 hover:text-green-500"
                          }`}
                        >
                          {letter}
                        </button>
                        <div className="flex-1">
                          <Input
                            placeholder={`Masukkan teks untuk opsi ${letter}...`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className={isCorrect ? "border-green-500/50 bg-green-500/5 font-medium" : ""}
                          />
                        </div>
                        {isCorrect && (
                          <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider px-2 py-1 bg-green-500/10 rounded">
                            Kunci
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4 bg-muted/10">
            <Link href={`/dashboard/exams/${unwrappedParams.exam_id}/questions`}>
              <Button variant="outline" type="button" disabled={loading}>Batal</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Menyimpan..." : "Simpan Soal"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
