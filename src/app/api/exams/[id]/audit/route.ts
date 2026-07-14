import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { event_type, details } = await request.json();
    const supabase = await createClient();
    
    // Verify user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!event_type) {
      return NextResponse.json({ error: 'BAD_REQUEST', message: 'Missing event_type' }, { status: 400 });
    }

    // Insert audit log
    const { error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        exam_id: id,
        user_id: user.id,
        event_type,
        details: details || {}
      });

    if (insertError) {
      console.error('Failed to insert audit log:', insertError);
      return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Audit log error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
