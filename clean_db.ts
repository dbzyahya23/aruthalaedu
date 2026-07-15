import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clean() {
  const duplicateIds = [
    '561c4db7-c048-421c-b08b-ad29a72db1c7',
    'f98ab733-8f54-4191-ace4-16c7276f0455',
    'c214891e-7692-498b-be23-d93ed0c485ce',
    'd4442121-c416-46e2-9c60-69e00537008b'
  ];

  for (const id of duplicateIds) {
    await supabase.from('exam_questions').delete().eq('question_id', id);
    await supabase.from('questions').delete().eq('id', id);
  }
  console.log("Deleted duplicates.");
}
clean();
