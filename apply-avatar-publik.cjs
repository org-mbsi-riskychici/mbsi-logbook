const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengganti lingkaran inisial di kartu publik dengan Avatar...')
console.log('')

const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/AttendancePage.jsx'
]

/* Pola longgar: div ber-rounded-full whose isi JSX boleh memuat satu tingkat kurung kurawal bersarang */
const regexLingkaran = /<div\b[^>]*rounded-full[^>]*>\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*<\/div>/g
const regexImportAvatar = /import\s*\{[^}]*\bAvatar\b[^}]*\}\s*from/

TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexLingkaran, function (m, ekspresi) {
    if (ekspresi.indexOf('.nama') === -1) return m
    const varMatch = ekspresi.match(/([A-Za-z0-9_]+)\.nama/)
    if (!varMatch) return m
    jumlah++
    const v = varMatch[1]
    return '<Avatar src={' + v + '.foto_profil || null} nama={' + v + '.nama} size="lg" />'
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  let akhir = hasil
  if (rel !== 'src/components/ui.jsx' && !regexImportAvatar.test(akhir)) {
    const impor = rel.indexOf('/pages/') !== -1
      ? "import { Avatar } from '../components/ui.jsx'\n"
      : "import { Avatar } from './ui.jsx'\n"
    akhir = impor + akhir
  }
  simpan(rel, akhir)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial diganti Avatar di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman beranda: kartu mahasiswa kini menampilkan foto profil bila sudah diunggah.')
console.log('2. Mahasiswa tanpa foto tetap melihat lingkaran inisial berwarna tema dari fallback Avatar.')
console.log('3. Halaman tim dan dospem bila menampilkan orang juga ikut memakai Avatar yang sama.')
console.log('4. Bila masih ada baris TIDAK KETEMU untuk cards.jsx, kirim potongan markup PersonCard supaya aku sesuaikan polanya.')