"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Search, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";

export default function UjianDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { isSiswa, loading: roleLoading } = useUserRole();
  const [id, setId] = useState<string | null>(null);

  const [exam, setExam] = useState<any>(null);
  const [allQuestions, setAllQuestions] = useState<any[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!roleLoading && isSiswa) {
      router.replace("/overview");
    }
  }, [isSiswa, roleLoading, router]);

  useEffect(() => {
    let canceled = false;
    params.then((resolved) => {
      if (!canceled) setId(resolved.id);
    });
    return () => {
      canceled = true;
    };
  }, [params]);

  useEffect(() => {
    if (!id || isSiswa) return;

    async function loadData() {
      const supabase = createClient();
      
      // Fetch Exam details
      const { data: examData } = await supabase.from('exams').select('*').eq('id', id).single();
      if (examData) setExam(examData);

      // Fetch all questions
      const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
      if (qData) setAllQuestions(qData);

      // Fetch currently assigned questions
      const { data: eqData } = await supabase.from('exam_questions').select('question_id').eq('exam_id', id);
      if (eqData) {
        const preSelected = new Set(eqData.map(eq => eq.question_id));
        setSelectedQuestions(preSelected);
      }

      setLoading(false);
    }
    
    loadData();
  }, [id, isSiswa]);

  const toggleQuestion = (questionId: string) => {
    const newSet = new Set(selectedQuestions);
    if (newSet.has(questionId)) {
      newSet.delete(questionId);
    } else {
      newSet.add(questionId);
    }
    setSelectedQuestions(newSet);
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    
    try {
      const supabase = createClient();
      // 1. Delete existing connections
      await supabase.from('exam_questions').delete().eq('exam_id', id);
      
      // 2. Insert new connections
      if (selectedQuestions.size > 0) {
        const payload = Array.from(selectedQuestions).map((qId, index) => ({
          exam_id: id,
          question_id: qId,
          urutan: index + 1,
          bobot: 10
        }));
        
        const { error } = await supabase.from('exam_questions').insert(payload);
        if (error) throw error;
      }
      
      alert("Pengaturan soal berhasil disimpan!");
    } catch (error: any) {
      alert("Gagal menyimpan pengaturan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || isSiswa || loading) {
    return <div className="p-8 text-center text-gray-500">Memuat pengaturan ujian...</div>;
  }

  const filteredQuestions = allQuestions.filter(q => 
    (q.content?.text || "").toLowerCase().includes(search.toLowerCase()) ||
    (q.mata_pelajaran || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ujian" className="btn-outline p-2">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="page-title">{exam?.title || "Pengaturan Ujian"}</h1>
            <p className="page-subtitle">Pilih soal dari Bank Soal untuk dimasukkan ke ujian ini</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Menyimpan..." : <><Save className="w-4 h-4" /> Simpan Pengaturan</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 card px-3 py-2.5">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari soal berdasarkan teks atau mata pelajaran..."
              className="bg-transparent outline-none flex-1 text-sm text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-3">
            {filteredQuestions.map((q) => {
              const isSelected = selectedQuestions.has(q.id);
              return (
                <div 
                  key={q.id}
                  onClick={() => toggleQuestion(q.id)}
                  className={`card card-padding cursor-pointer transition-all border-2 ${
                    isSelected ? "border-blue-500 bg-blue-50/50" : "border-transparent hover:border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                        isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                      }`}>
                        {isSelected && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gray-900 bg-white px-2 py-0.5 rounded-full border border-gray-100">
                          {q.mata_pelajaran} - Kelas {q.tingkat}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          q.difficulty === 'mudah' ? 'badge-success' : q.difficulty === 'sedang' ? 'badge-warning' : 'badge-danger'
                        }`}>
                          {q.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 line-clamp-2 leading-relaxed">
                        {q.content?.text || "(Tanpa Teks)"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredQuestions.length === 0 && (
              <div className="card card-padding text-center py-12 text-gray-500">
                Tidak ada soal yang sesuai dengan pencarian.
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card card-padding sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4">Ringkasan Ujian</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Total Soal Dipilih</span>
                <span className="text-lg font-bold text-blue-600">{selectedQuestions.size}</span>
              </div>
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Estimasi Bobot per Soal</span>
                <span className="text-sm font-semibold text-gray-900">
                  {selectedQuestions.size > 0 ? (100 / selectedQuestions.size).toFixed(1) : 0}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 leading-relaxed">
                  Centang soal di sebelah kiri untuk menambahkannya ke dalam ujian ini. Soal akan diacak secara otomatis saat ujian dimulai (jika pengaturan acak diaktifkan).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
