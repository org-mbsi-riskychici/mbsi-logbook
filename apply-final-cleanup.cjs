const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai pembersihan akhir jalur YouTube...')
console.log('')

/* ===== 1. youtube.js: bungkus parsing JSON pemulihan dengan try/catch ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariY = `  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiY = `  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }`
if (y.includes(gantiY)) {
  console.log('[SUDAH ADA] Pengaman parsing JSON pemulihan di youtube.js')
} else if (y.includes(cariY)) {
  y = y.replace(cariY, gantiY)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman parsing JSON pemulihan dipasang di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola pemulihan di youtube.js, periksa manual')
}

/* ===== 2. vite.config.js: samakan limit middleware kuota menjadi 5 ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
const gantiV = `res.end(JSON.stringify({ limit: 5, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
if (v.includes(gantiV)) {
  console.log('[SUDAH ADA] Limit middleware kuota sudah 5')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Limit middleware kuota disamakan menjadi 5')
} else {
  console.log('[TIDAK KETEMU] Pola limit middleware kuota, periksa manual')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji akhir:')
console.log('1. Upload satu video kecil dari form logbook atau galeri.')
console.log('2. Progres 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook atau galeri tersimpan tanpa alert error.')
console.log('4. Tulisan kuota tampil konsisten: sisa dari 5, baik di localhost maupun Vercel.')
console.log('5. Bila pemulihan gagal, pesan yang muncul kini pesan ramah, bukan SyntaxError.')