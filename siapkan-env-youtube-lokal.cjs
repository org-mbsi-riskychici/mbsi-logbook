const fs = require('fs')
const path = require('path')
const root = process.cwd()
const envPath = path.join(root, '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('[GAGAL] .env.local belum ada. Buat dulu dari .env.example lalu isi nilai Supabase dan R2.')
  process.exit(1)
}
let isi = fs.readFileSync(envPath, 'utf8')
if (isi.includes('YOUTUBE_CLIENT_ID_1=')) {
  console.log('[SUDAH ADA] Blok variabel YouTube bernomor di .env.local')
} else {
  const blok = [
    '',
    '# -----------------------------------------------------',
    '# 4) YOUTUBE API MULTI-PROJECT (auto-rotate kuota)',
    '# Enam set kredensial untuk enam project Google Cloud.',
    '# Sistem otomatis memilih project yang masih punya kuota.',
    '# Isi CLIENT_ID dan CLIENT_SECRET per nomor setelah membuat',
    '# OAuth Client ID di Console. REFRESH_TOKEN terisi otomatis',
    '# oleh setup-youtube-token-multi.cjs <nomor>.',
    '# -----------------------------------------------------'
  ]
  for (let n = 1; n <= 6; n++) {
    blok.push('YOUTUBE_CLIENT_ID_' + n + '=')
    blok.push('YOUTUBE_CLIENT_SECRET_' + n + '=')
    blok.push('YOUTUBE_REFRESH_TOKEN_' + n + '=')
  }
  isi = isi.trimEnd() + '\n' + blok.join('\n') + '\n'
  fs.writeFileSync(envPath, isi, 'utf8')
  console.log('[BERHASIL] Blok variabel YouTube bernomor ditambahkan ke .env.local')
}
console.log('')
console.log('Lanjut: buat 6 project di Console, tempel Client ID dan Secret')
console.log('ke variabel bernomor di .env.local, lalu jalankan')
console.log('node setup-youtube-token-multi.cjs 1 sampai 6')