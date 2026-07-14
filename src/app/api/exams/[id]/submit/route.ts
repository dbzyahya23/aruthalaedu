import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { answers } = await request.json();
    
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Invalid answers format' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare array for bulk upsert
    const upsertData = Object.entries(answers).map(([questionId, answerContent]) => ({
      exam_id: id,
      user_id: user.id,
      question_id: questionId,
      answer_content: answerContent as string,
      saved_at: new Date().toISOString()
    }));

    if (upsertData.length === 0) {
      return NextResponse.json({ message: 'No answers to submit' });
    }

    // Upsert into answers table
    const { error: submitError } = await supabase
      .from('answers')
      .upsert(upsertData, { 
        onConflict: 'user_id, question_id' 
      });

    if (submitError) {
      console.error('Submit error:', submitError);
      return NextResponse.json({ error: 'Failed to submit answers' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Answers submitted successfully' });
  } catch (error) {
    console.error('Error in submit endpoint:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
