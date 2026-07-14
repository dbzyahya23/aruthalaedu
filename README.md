# Aruthala Edu (CBT)

app ujian online. pakai next.js 15, tailwind v4, & supabase.

## cara jalanin di lokal:
1. `npm install`
2. `npm run dev` (buka localhost:3000)
3. mau test di hp / ip lokal? `npm run dev:local`

## tech stack:
- frontend: next.js 15 (app router)
- ui: shadcn/ui + tailwind v4
- db/auth: supabase

## struktur penting:
- `src/app/`: semua halaman web
- `src/components/`: tombol, form, modal
- `src/utils/supabase/`: config db
- `supabase/migrations/`: file sql buat tabel (jangan diubah kalau gak ngerti)

udah itu aja. jgn asal hapus kode.
