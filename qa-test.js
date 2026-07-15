const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = 'http://localhost:3000';
const EMAIL = 'denislapianso@gmail.com';
const PASS = 'Aruthala@123';

const DUMMY_CSV = 'nisn,nama_lengkap,kelas\n999123,Siswa Dummy 1,9\n999124,Siswa Dummy 2,9';

async function runQA() {
  if (!fs.existsSync('./screenshots')) {
    fs.mkdirSync('./screenshots');
  }
  fs.writeFileSync('dummy_siswa.csv', DUMMY_CSV);

  console.log('🚀 Memulai Robot QA Tahap 2...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('supabase.co/rest/v1') && response.request().method() === 'POST') {
      console.log(`[API SNIFF] POST BERHASIL ke: ${url}`);
    }
  });

  try {
    // 1. LOGIN
    console.log(`[1] Membuka halaman Login...`);
    await page.goto(`${URL}/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.type('input[type="email"]', EMAIL);
    await page.type('input[type="password"]', PASS);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));
    
    // 2. BANK SOAL (Tambah Soal)
    console.log(`[2] Menambahkan soal baru di Bank Soal...`);
    await page.goto(`${URL}/bank-soal/buat`, { waitUntil: 'domcontentloaded' });
    await page.type('textarea', 'Siapa penemu gaya gravitasi?');
    const inputs = await page.$$('input');
    await inputs[0].type('Isaac Newton'); // Opsi A
    await inputs[1].type('Albert Einstein'); // Opsi B
    
    const correctBtn = await page.$('button.w-7.h-7');
    if (correctBtn) await correctBtn.click();
    
    const saveSoalBtn = await page.$('button.transition-all[style*="var(--accent)"]');
    if (saveSoalBtn) {
      await saveSoalBtn.click();
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
    await new Promise(r => setTimeout(r, 1000));

    // 3. UJIAN (Buat Ujian)
    console.log(`[3] Membuat ujian baru...`);
    await page.goto(`${URL}/ujian/buat`, { waitUntil: 'domcontentloaded' });
    
    // Fill title
    const inputsUjian = await page.$$('input');
    await inputsUjian[0].type('Ujian Fisika Dummy QA');
    
    // Next step -> Pilih Soal
    const nextBtn = await page.$$eval('button', btns => {
      const btn = btns.find(b => b.innerText.includes('Berikutnya'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Select first question
    const qItem = await page.$('div.cursor-pointer');
    if (qItem) await qItem.click();
    
    // Next step -> Anti Cheat
    await page.$$eval('button', btns => {
      const btn = btns.find(b => b.innerText.includes('Berikutnya'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Next step -> Publish
    await page.$$eval('button', btns => {
      const btn = btns.find(b => b.innerText.includes('Berikutnya'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    
    // Publish Ujian
    await page.$$eval('button', btns => {
      const btn = btns.find(b => b.innerText.includes('Publikasikan Ujian'));
      if(btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 2000)); // wait for navigation
    
    // 4. DATA SISWA (Import CSV)
    console.log(`[4] Mengimpor data siswa...`);
    await page.goto(`${URL}/data-siswa/import`, { waitUntil: 'domcontentloaded' });
    
    // Upload file
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile('dummy_siswa.csv');
      await new Promise(r => setTimeout(r, 500));
      
      const processBtn = await page.$$eval('button', btns => {
        const btn = btns.find(b => b.innerText.includes('Proses Import'));
        if(btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 2000));
      
      const successText = await page.evaluate(() => document.body.innerText.includes('Berhasil!'));
      console.log(`   -> Hasil Import: ${successText ? 'Sukses' : 'Gagal'}`);
    }

    console.log(`✅ Uji Coba Integrasi Supabase Selesai!`);
  } catch (err) {
    console.error('❌ Terjadi kesalahan:', err);
  } finally {
    await browser.close();
    if(fs.existsSync('dummy_siswa.csv')) fs.unlinkSync('dummy_siswa.csv');
  }
}

runQA();
