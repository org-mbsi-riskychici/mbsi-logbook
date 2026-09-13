// setup-semua-fitur.cjs
// Skrip induk untuk menjalankan seluruh pemasangan fitur secara otomatis.
// Jalankan: node setup-semua-fitur.cjs

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()

// Urutan skrip yang harus dijalankan. Urutan penting karena
// beberapa skrip bergantung pada hasil skrip sebelumnya.
const URUTAN = [
  // 1. Dasar konversi dan upload
  'apply-perbaiki-konversi.cjs',
  'apply-heic-webp.cjs',
  'apply-foto-webp-progres.cjs',
  'apply-hint-fileinput.cjs',
  'apply-fix-progres-hint.cjs',

  // 2. Pratinjau HEIC di form
  'apply-preview-heic.cjs',
  'apply-preview-heic-galeri.cjs',
  'apply-preview-loading.cjs',

  // 3. Thumbnail otomatis
  'apply-thumbnail.cjs',
  'apply-thumb-folder.cjs',
  'apply-thumb-display.cjs',
  'apply-thumb-cleanup.cjs',

  // 4. Tampilan adaptif (SmartFit)
  'apply-smart-fit.cjs',
  'apply-smart-fit-carousel.cjs',
  'apply-smartfit-fallback.cjs',

  // 5. Integrasi YouTube (backend + frontend + UI)
  'apply-youtube-backend.cjs',
  'apply-youtube-frontend.cjs',
  'apply-youtube-final.cjs',
  'apply-youtube-final-fix.cjs',
]

function jalanSkrip(namaFile) {
  const fullPath = path.join(root, namaFile)
  if (!fs.existsSync(fullPath)) {
    console.log('[LEWATI] ' + namaFile + ' tidak ditemukan.')
    return { nama: namaFile, status: 'lewat', pesan: 'file tidak ada' }
  }
  try {
    console.log('\n' + '='.repeat(60))
    console.log('>>> Menjalankan: ' + namaFile)
    console.log('='.repeat(60))
    execSync('node "' + namaFile + '"', { stdio: 'inherit', cwd: root })
    return { nama: namaFile, status: 'ok' }
  } catch (err) {
    console.error('[GAGAL] ' + namaFile + ': ' + err.message)
    return { nama: namaFile, status: 'gagal', pesan: err.message }
  }
}

console.log('========================================')
console.log('  PEMASANGAN SEMUA FITUR SECARA OTOMATIS')
console.log('========================================')
console.log('Direktori kerja: ' + root)
console.log('Jumlah skrip yang akan dijalankan: ' + URUTAN.length)

const hasil = []
for (const nama of URUTAN) {
  hasil.push(jalanSkrip(nama))
}

console.log('\n' + '='.repeat(60))
console.log('RINGKASAN PEMASANGAN')
console.log('='.repeat(60))

const ok = hasil.filter(h => h.status === 'ok').length
const lewat = hasil.filter(h => h.status === 'lewat').length
const gagal = hasil.filter(h => h.status === 'gagal').length

hasil.forEach(h => {
  const ikon = h.status === 'ok' ? '[OK]    ' : h.status === 'lewat' ? '[LEWAT] ' : '[GAGAL] '
  console.log(ikon + h.nama + (h.pesan ? ' (' + h.pesan + ')' : ''))
})

console.log('\nTotal: ' + ok + ' berhasil, ' + lewat + ' dilewati, ' + gagal + ' gagal.')

if (gagal > 0) {
  console.log('\n[PERINGATAN] Ada skrip yang gagal. Periksa log di atas.')
  process.exit(1)
}

console.log('\n========================================')
console.log('  SEMUA FITUR TELAH TERPASANG')
console.log('========================================')
console.log('')
console.log('Langkah selanjutnya yang perlu kamu lakukan:')
console.log('  1. Pastikan node_modules sudah terpasang:')
console.log('       npm install')
console.log('     (terutama heic2any, @supabase/supabase-js, @aws-sdk/client-s3)')
console.log('')
console.log('  2. Salin .env.example menjadi .env.local dan isi:')
console.log('       VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,')
console.log('       SUPABASE_SERVICE_ROLE_KEY,')
console.log('       R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,')
console.log('       R2_BUCKET_NAME, R2_PUBLIC_BASE_URL,')
console.log('       YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET')
console.log('')
console.log('  3. Dapatkan refresh token YouTube:')
console.log('       node setup-youtube-token.cjs')
console.log('     Salin token yang muncul ke YOUTUBE_REFRESH_TOKEN di .env.local')
console.log('')
console.log('  4. Jalankan skema database di Supabase SQL Editor:')
console.log('       salin isi file supabase/schema.sql')
console.log('')
console.log('  5. Jalankan server pengembangan:')
console.log('       npm run dev')
console.log('     Buka http://localhost:5173')
console.log('')
console.log('  6. Untuk deploy ke Vercel:')
console.log('       - Push ke GitHub')
console.log('       - Import proyek di Vercel')
console.log('       - Salin semua isi .env.local ke Environment Variables Vercel')