const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function registerTestAccounts() {
  console.log("Mendaftarkan akun Guru...");
  const { data: guruData, error: guruErr } = await supabase.auth.signUp({
    email: 'guru@aruthala.com',
    password: 'password123',
    options: {
      data: {
        role: 'GURU',
        full_name: 'Guru Penguji'
      }
    }
  });

  if (guruErr) {
    console.error("Gagal buat Guru:", guruErr.message);
  } else {
    console.log("Guru berhasil dibuat.", guruData.user?.id);
    
    // Attempt to create profile
    const { error: profileErr } = await supabase.from('profiles').upsert({
      id: guruData.user.id,
      email: 'guru@aruthala.com',
      full_name: 'Guru Penguji',
      role: 'GURU',
      is_active: true
    });
    if (profileErr) console.log("Profile insert:", profileErr.message);
  }

  console.log("Mendaftarkan akun Siswa...");
  const { data: siswaData, error: siswaErr } = await supabase.auth.signUp({
    email: 'siswa@aruthala.com',
    password: 'password123',
    options: {
      data: {
        role: 'SISWA',
        full_name: 'Siswa Ujian',
        nisn: '1234567890'
      }
    }
  });

  if (siswaErr) {
    console.error("Gagal buat Siswa:", siswaErr.message);
  } else {
    console.log("Siswa berhasil dibuat.", siswaData.user?.id);
    const { error: pErr } = await supabase.from('profiles').upsert({
      id: siswaData.user.id,
      email: 'siswa@aruthala.com',
      full_name: 'Siswa Ujian',
      role: 'SISWA',
      nisn: '1234567890',
      is_active: true
    });
    if (pErr) console.log("Profile insert:", pErr.message);
  }
}

registerTestAccounts();
