import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'UNAUTHORIZED', message: 'Silakan login terlebih dahulu.' }, { status: 401 });
    }

    // Check if UUID is valid format (36 chars)
    if (id.length !== 36) {
      return NextResponse.json({ error: 'INVALID_ID', message: 'ID Ujian tidak valid (pastikan Anda menyalin UUID secara lengkap tanpa terpotong).' }, { status: 400 });
    }

    // Fetch exam details
    const { data: exam, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', id)
      .single();

    if (examError || !exam) {
      return NextResponse.json({ error: 'NOT_FOUND', message: 'Ujian tidak ditemukan atau belum di-publish.' }, { status: 404 });
    }

    // Fetch questions
    // Note: We don't fetch `correct_answer` if this is a student fetching it.
    // However, RLS policy might already hide it or we should explicitly omit it.
    // Assuming RLS allows select, we explicitly omit correct_answer for security.
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, content, type, options, created_at')
      .eq('exam_id', id);

    if (questionsError) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }

    return NextResponse.json({
      exam,
      questions: questions || []
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
