# Logbook Magang BSI

Portal logbook, galeri, dan daftar hadir magang Bank Syariah Indonesia.

## Menjalankan lokal
1. node setup project saat ini (sudah dilakukan saat setup)
2. npm run dev
3. Buka http://localhost:5173

## Database
Jalankan isi file supabase/schema.sql di Supabase SQL Editor.
Buat user Auth dengan pola email NIM@mbsi.local dan isi tabel mahasiswa beserta auth_uid.

## Deploy
Push ke GitHub, import di Vercel, salin isi .env.local ke Environment Variables Vercel.
