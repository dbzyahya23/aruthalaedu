import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
// Use a service role key if available, otherwise anon key might hit RLS, but in this dummy setup we allowed Anon to insert/delete
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Menghapus seluruh soal lama dari bank soal...");
  // Hapus dari exam_questions dulu karena ada foreign key constraint
  const { error: eqErr } = await supabase.from('exam_questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (eqErr) console.log("Gagal menghapus exam_questions:", eqErr.message);

  const { error: qErr } = await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (qErr) console.log("Gagal menghapus questions:", qErr.message);

  const userId = 'b17a282a-6a38-4381-9dff-e8ff3865dfd8'; // Default user ID for testing

  console.log("Menyiapkan 15 soal asli berkualitas UNBK/SNBT...");
  
  const questions = [
    // MATEMATIKA
    {
      type: "multiple_choice",
      mata_pelajaran: "Matematika",
      tingkat: 9,
      jenjang: "SMP",
      topik: "Aljabar",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["aljabar"],
      content: {
        text: "Jika 3x - 5 = 16, berapakah nilai dari 2x + 4?",
        options: [
          { id: "a", text: "14", is_correct: false },
          { id: "b", text: "16", is_correct: false },
          { id: "c", text: "18", is_correct: true },
          { id: "d", text: "20", is_correct: false }
        ],
        explanation: "3x = 21 -> x = 7. Maka 2x + 4 = 2(7) + 4 = 18."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Matematika",
      tingkat: 9,
      jenjang: "SMP",
      topik: "Geometri",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["geometri"],
      content: {
        text: "Sebuah segitiga siku-siku memiliki alas 6 cm dan tinggi 8 cm. Berapakah panjang sisi miringnya?",
        options: [
          { id: "a", text: "9 cm", is_correct: false },
          { id: "b", text: "10 cm", is_correct: true },
          { id: "c", text: "12 cm", is_correct: false },
          { id: "d", text: "14 cm", is_correct: false }
        ],
        explanation: "Menggunakan Teorema Pythagoras: c^2 = a^2 + b^2 -> c^2 = 36 + 64 = 100 -> c = 10 cm."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Matematika",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Eksponen",
      kurikulum: "merdeka",
      difficulty: "sulit",
      scope: "sekolah",
      created_by: userId,
      tags: ["eksponen"],
      content: {
        text: "Bentuk sederhana dari (2^3 x 2^4) / 2^5 adalah...",
        options: [
          { id: "a", text: "2", is_correct: false },
          { id: "b", text: "4", is_correct: true },
          { id: "c", text: "8", is_correct: false },
          { id: "d", text: "16", is_correct: false }
        ],
        explanation: "(2^3 x 2^4) / 2^5 = 2^(3+4-5) = 2^2 = 4."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Matematika",
      tingkat: 12,
      jenjang: "SMA",
      topik: "Peluang",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["peluang"],
      content: {
        text: "Jika sebuah dadu dilempar satu kali, berapakah peluang munculnya mata dadu ganjil?",
        options: [
          { id: "a", text: "1/6", is_correct: false },
          { id: "b", text: "1/3", is_correct: false },
          { id: "c", text: "1/2", is_correct: true },
          { id: "d", text: "2/3", is_correct: false }
        ],
        explanation: "Mata dadu ganjil adalah 1, 3, 5 (ada 3). Total mata dadu = 6. Peluang = 3/6 = 1/2."
      }
    },
    // IPA / FISIKA
    {
      type: "multiple_choice",
      mata_pelajaran: "Fisika",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Gaya dan Gerak",
      kurikulum: "merdeka",
      difficulty: "mudah",
      scope: "sekolah",
      created_by: userId,
      tags: ["fisika", "newton"],
      content: {
        text: "Siapa ilmuwan yang merumuskan tiga hukum gerak dasar dan hukum gravitasi universal?",
        options: [
          { id: "a", text: "Albert Einstein", is_correct: false },
          { id: "b", text: "Isaac Newton", is_correct: true },
          { id: "c", text: "Nikola Tesla", is_correct: false },
          { id: "d", text: "Galileo Galilei", is_correct: false }
        ],
        explanation: "Sir Isaac Newton adalah penemu Hukum Gerak Newton dan Hukum Gravitasi Universal."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Fisika",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Energi",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["energi"],
      content: {
        text: "Sebuah benda bermassa 2 kg bergerak dengan kecepatan 5 m/s. Berapakah energi kinetik benda tersebut?",
        options: [
          { id: "a", text: "10 Joule", is_correct: false },
          { id: "b", text: "20 Joule", is_correct: false },
          { id: "c", text: "25 Joule", is_correct: true },
          { id: "d", text: "50 Joule", is_correct: false }
        ],
        explanation: "Rumus EK = 1/2 * m * v^2 = 1/2 * 2 * (5^2) = 25 Joule."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Biologi",
      tingkat: 11,
      jenjang: "SMA",
      topik: "Sel",
      kurikulum: "merdeka",
      difficulty: "mudah",
      scope: "sekolah",
      created_by: userId,
      tags: ["biologi", "sel"],
      content: {
        text: "Organel sel yang berfungsi sebagai tempat respirasi sel untuk menghasilkan energi (ATP) adalah...",
        options: [
          { id: "a", text: "Nukleus", is_correct: false },
          { id: "b", text: "Mitokondria", is_correct: true },
          { id: "c", text: "Ribosom", is_correct: false },
          { id: "d", text: "Badan Golgi", is_correct: false }
        ],
        explanation: "Mitokondria sering disebut sebagai 'powerhouse of the cell' karena menghasilkan ATP."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Biologi",
      tingkat: 9,
      jenjang: "SMP",
      topik: "Sistem Peredaran Darah",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["biologi"],
      content: {
        text: "Pembuluh darah yang membawa darah kaya oksigen dari paru-paru kembali ke jantung disebut...",
        options: [
          { id: "a", text: "Vena Cava", is_correct: false },
          { id: "b", text: "Arteri Pulmonalis", is_correct: false },
          { id: "c", text: "Vena Pulmonalis", is_correct: true },
          { id: "d", text: "Aorta", is_correct: false }
        ],
        explanation: "Vena pulmonalis adalah satu-satunya vena yang membawa darah kaya oksigen."
      }
    },
    // SEJARAH & SOSIAL
    {
      type: "multiple_choice",
      mata_pelajaran: "Sejarah",
      tingkat: 11,
      jenjang: "SMA",
      topik: "Kemerdekaan RI",
      kurikulum: "merdeka",
      difficulty: "mudah",
      scope: "sekolah",
      created_by: userId,
      tags: ["sejarah"],
      content: {
        text: "Siapakah tokoh yang mengetik naskah proklamasi kemerdekaan Republik Indonesia?",
        options: [
          { id: "a", text: "Ir. Soekarno", is_correct: false },
          { id: "b", text: "Sayuti Melik", is_correct: true },
          { id: "c", text: "Moh. Hatta", is_correct: false },
          { id: "d", text: "Ahmad Soebardjo", is_correct: false }
        ],
        explanation: "Sayuti Melik adalah tokoh pemuda yang mengetik naskah proklamasi yang ditulis tangan oleh Soekarno."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Sejarah",
      tingkat: 11,
      jenjang: "SMA",
      topik: "Peristiwa Rengasdengklok",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["sejarah"],
      content: {
        text: "Tujuan utama penculikan Soekarno-Hatta ke Rengasdengklok pada 16 Agustus 1945 adalah...",
        options: [
          { id: "a", text: "Menyelamatkan mereka dari serangan sekutu", is_correct: false },
          { id: "b", text: "Mendesak segera diproklamasikannya kemerdekaan", is_correct: true },
          { id: "c", text: "Mengadakan perundingan rahasia dengan Jepang", is_correct: false },
          { id: "d", text: "Menyusun teks proklamasi yang aman", is_correct: false }
        ],
        explanation: "Golongan muda mendesak golongan tua agar segera memproklamasikan kemerdekaan lepas dari pengaruh Jepang."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Geografi",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Cuaca & Iklim",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["geografi"],
      content: {
        text: "Lapisan atmosfer tempat terjadinya fenomena cuaca seperti hujan, angin, dan petir adalah...",
        options: [
          { id: "a", text: "Stratosfer", is_correct: false },
          { id: "b", text: "Mesosfer", is_correct: false },
          { id: "c", text: "Troposfer", is_correct: true },
          { id: "d", text: "Eksosfer", is_correct: false }
        ],
        explanation: "Troposfer adalah lapisan paling bawah tempat terjadinya segala proses dinamika cuaca."
      }
    },
    // BAHASA INDONESIA
    {
      type: "multiple_choice",
      mata_pelajaran: "Bahasa Indonesia",
      tingkat: 12,
      jenjang: "SMA",
      topik: "Majas",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["bahasa"],
      content: {
        text: "Kalimat 'Pena menari-nari di atas kertas' menggunakan majas...",
        options: [
          { id: "a", text: "Personifikasi", is_correct: true },
          { id: "b", text: "Metafora", is_correct: false },
          { id: "c", text: "Hiperbola", is_correct: false },
          { id: "d", text: "Litotes", is_correct: false }
        ],
        explanation: "Personifikasi adalah majas yang melekatkan sifat manusia pada benda mati (pena menari)."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Bahasa Indonesia",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Teks Eksposisi",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["bahasa"],
      content: {
        text: "Struktur teks eksposisi yang berisi gagasan utama atau prediksi penulis tentang suatu permasalahan disebut...",
        options: [
          { id: "a", text: "Argumentasi", is_correct: false },
          { id: "b", text: "Penegasan ulang", is_correct: false },
          { id: "c", text: "Tesis", is_correct: true },
          { id: "d", text: "Deskripsi umum", is_correct: false }
        ],
        explanation: "Tesis (pernyataan pendapat) adalah bagian awal yang berisi gagasan atau prediksi penulis."
      }
    },
    // BAHASA INGGRIS
    {
      type: "multiple_choice",
      mata_pelajaran: "Bahasa Inggris",
      tingkat: 10,
      jenjang: "SMA",
      topik: "Grammar",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["english", "grammar"],
      content: {
        text: "If it rains tomorrow, I ___ at home.",
        options: [
          { id: "a", text: "will stay", is_correct: true },
          { id: "b", text: "stayed", is_correct: false },
          { id: "c", text: "would stay", is_correct: false },
          { id: "d", text: "am staying", is_correct: false }
        ],
        explanation: "Conditional type 1: If + Simple Present, Subject + will + V1."
      }
    },
    {
      type: "multiple_choice",
      mata_pelajaran: "Bahasa Inggris",
      tingkat: 11,
      jenjang: "SMA",
      topik: "Tenses",
      kurikulum: "merdeka",
      difficulty: "sedang",
      scope: "sekolah",
      created_by: userId,
      tags: ["english"],
      content: {
        text: "They ___ playing football when the rain started.",
        options: [
          { id: "a", text: "are", is_correct: false },
          { id: "b", text: "were", is_correct: true },
          { id: "c", text: "was", is_correct: false },
          { id: "d", text: "have been", is_correct: false }
        ],
        explanation: "Past continuous tense digunakan untuk aktivitas yang sedang terjadi di masa lampau saat kejadian lain terjadi (when the rain started)."
      }
    }
  ];

  const { data, error } = await supabase.from('questions').insert(questions);
  
  if (error) {
    console.error("Gagal menyuntikkan soal baru:", error);
  } else {
    console.log("Sukses! 15 soal unik dan berkualitas berhasil disuntikkan ke Bank Soal.");
  }
}

seed();
