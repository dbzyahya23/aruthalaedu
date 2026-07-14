import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verifikasi role admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    
    const { data: userData } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (userData?.role !== 'admin') return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });

    // Buat Ujian Matematika Dummy
    const { data: exam, error: examError } = await supabase.from('exams').insert({
      title: "Ujian Akhir Semester: Matematika Dasar (Demo)",
      description: "Ini adalah ujian otomatis yang di-generate sistem untuk keperluan demo fitur Aruthala Edu.",
      duration_minutes: 60,
      status: "published"
    }).select().single();

    if (examError) throw examError;

    // Soal-soal Pilihan Ganda (Array of objects to insert)
    const questionsToInsert = [
      {
        exam_id: exam.id,
        content: "Berapakah hasil dari 25 + 15 × 2 ?",
        type: "multiple_choice",
        options: ["55", "80", "50", "65"],
        correct_answer: "55"
      },
      {
        exam_id: exam.id,
        content: "Berapakah luas segitiga jika panjang alasnya 10 cm dan tingginya 8 cm?",
        type: "multiple_choice",
        options: ["80 cm²", "40 cm²", "18 cm²", "20 cm²"],
        correct_answer: "40 cm²"
      },
      {
        exam_id: exam.id,
        content: "Jika 3x - 5 = 10, berapakah nilai x?",
        type: "multiple_choice",
        options: ["15", "10", "5", "3"],
        correct_answer: "5"
      },
      {
        exam_id: exam.id,
        content: "Sebuah kereta berjalan dengan kecepatan 60 km/jam. Berapa jarak yang ditempuh dalam 2.5 jam?",
        type: "multiple_choice",
        options: ["120 km", "140 km", "150 km", "160 km"],
        correct_answer: "150 km"
      },
      {
        exam_id: exam.id,
        content: "Pilih pernyataan yang SALAH dari pilihan di bawah ini:",
        type: "multiple_choice",
        options: ["Bilangan genap selalu habis dibagi 2", "Semua bilangan prima ganjil", "Nol bukan bilangan positif atau negatif", "Angka 1 bukan bilangan prima"],
        correct_answer: "Semua bilangan prima ganjil"
      }
    ];

    const { error: questionsError } = await supabase.from('questions').insert(questionsToInsert);
    
    if (questionsError) throw questionsError;

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
