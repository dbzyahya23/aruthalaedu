require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function runApiSimulation() {
  console.log("🚀 Memulai Simulasi Uji Coba Supabase (API Level)...");

  try {
    const userId = 'b17a282a-6a38-4381-9dff-e8ff3865dfd8';
    console.log(`[1] Berhasil menggunakan fallback User ID: ${userId}`);

    // 2. BANK SOAL - Tambah Soal
    console.log(`[2] Menyimulasikan form 'Buat Soal'...`);
    const questionPayload = {
      type: "multiple_choice",
      content: { 
        text: "Siapa penemu gaya gravitasi?", 
        options: [
          { id: "a", text: "Isaac Newton", is_correct: true },
          { id: "b", text: "Albert Einstein", is_correct: false }
        ]
      },
      mata_pelajaran: "Fisika",
      tingkat: 9,
      jenjang: "SMP",
      topik: "Gravitasi",
      kurikulum: "merdeka",
      difficulty: "mudah",
      scope: "sekolah",
      created_by: userId
    };

    const { data: qData, error: qErr } = await supabase.from('questions').insert(questionPayload).select().single();
    if(qErr) throw qErr;
    console.log(`   -> Sukses! (Soal ID: ${qData.id})`);

    // 3. UJIAN - Buat Ujian
    console.log(`[3] Menyimulasikan form 'Buat Ujian'...`);
    const examPayload = {
      title: "Ujian Fisika Dummy QA",
      description: "",
      mata_pelajaran: "Fisika",
      duration_minutes: 60,
      max_attempts: 1,
      passing_score: 75,
      anti_cheat_config: { fullscreen: true },
      shuffle_questions: true,
      shuffle_options: true,
      show_result_after: "submit",
      status: 'published',
      created_by: userId
    };

    const { data: eData, error: eErr } = await supabase.from('exams').insert(examPayload).select().single();
    if(eErr) throw eErr;
    console.log(`   -> Ujian Berhasil Dibuat (Exam ID: ${eData.id})`);

    // Relasikan soal ke ujian
    const { error: eqErr } = await supabase.from('exam_questions').insert({
      exam_id: eData.id,
      question_id: qData.id,
      urutan: 1,
      bobot: 1
    });
    if(eqErr) throw eqErr;
    console.log(`   -> Soal berhasil disambungkan ke Ujian!`);

    // 4. DATA SISWA - Import CSV
    console.log(`[4] Menyimulasikan form 'Import Siswa'...`);
    const { randomUUID } = require('crypto');
    const bulkProfiles = [
      { id: randomUUID(), full_name: "Siswa Import 1", nisn: "999123", role: 'SISWA', is_active: true },
      { id: randomUUID(), full_name: "Siswa Import 2", nisn: "999124", role: 'SISWA', is_active: true }
    ];
    const { error: pErr } = await supabase.from('profiles').insert(bulkProfiles);
    if(pErr) throw pErr;
    console.log(`   -> Sukses Bulk Import ${bulkProfiles.length} Siswa!`);

    console.log("\n✅ Semua Fitur Berfungsi Dengan Sempurna di Database!");

  } catch (err) {
    console.error("❌ Gagal Simulasi:", err);
  }
}

runApiSimulation();
