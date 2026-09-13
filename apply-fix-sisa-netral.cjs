const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function cariGanti(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Memperbaiki regex LabelProses dan menangkap sisa teks...')
console.log('')

/* ===== 1. Fix regex double backslash di LabelProses (ui.jsx) ===== */
cariGanti('src/components/ui.jsx',
  `const bersih = String(props.teks|| '').replace(/\\\\.{3}/g, '').replace(/\\\\s+/g, ' ').trim()`,
  `const bersih = String(props.teks || '').replace(/\\.\\.\\./g, '').replace(/\\s+/g, ' ').trim()`,
  'Regex LabelProses diperbaiki')

/* ===== 2. Fallback teks yang polanya sedikit berbeda ===== */
cariGanti('src/lib/youtube.js',
  'Jaringan gagal saat upload YouTube',
  'Jaringan gagal saat upload video',
  'Pesan jaringan youtube.js dinetralkan')
cariGanti('src/pages/DashboardPage.jsx',
  `Mengunggah... ' + Math.round(p * 100) + '%'`,
  `Mengunggah ' + Math.round(p * 100) + '%'`,
  'Progres R2 dinetralkan dari titik tiga')
cariGanti('src/pages/DashboardPage.jsx',
  'Mengonversi HEIC ke JPG',
  'Mengonversi foto HEIC',
  'Teks konversi HEIC dinetralkan')
cariGanti('src/lib/upload.js',
  'Mengonversi foto ke WebP',
  'Mengonversi foto',
  'Teks konversi WebP dinetralkan')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')