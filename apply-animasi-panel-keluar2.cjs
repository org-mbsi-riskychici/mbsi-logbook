const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi keluar pada dropdown dan date picker di controls.jsx...')
console.log('')

/* ===== 1. controls.jsx: import SelubungPanel dan bungkus panel kondisional ===== */
const FILE_C = 'src/components/controls.jsx'
if (!fs.existsSync(path.join(root, FILE_C))) {
  console.log('[GAGAL] controls.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
let berubah = false

if (c.includes('<SelubungPanel open={')) {
  console.log('[SUDAH ADA] Panel di controls.jsx sudah dibungkus SelubungPanel')
} else {
  if (!c.includes("SelubungPanel } from './ui.jsx'")) {
    c = "import { SelubungPanel } from './ui.jsx'\n" + c
    berubah = true
    console.log('[BERHASIL] Import SelubungPanel ditambahkan di controls.jsx')
  } else {
    console.log('[SUDAH ADA] Import SelubungPanel di controls.jsx')
  }
  let jumlah = 0
  const RE_BLOK = /\{(open|props\.open) \? \(\s*([\s\S]*?)\s*\) : null\}/g
  const baru = c.replace(RE_BLOK, function (m, cond, inner) {
    if (!/^\s*</.test(inner)) return m
    jumlah++
    return '<SelubungPanel open={' + cond + '}>\n' + inner + '\n</SelubungPanel>'
  })
  if (jumlah === 0) {
    console.log('[TIDAK KETEMU] Pola panel kondisional di controls.jsx')
  } else {
    c = baru
    berubah = true
    console.log('[BERHASIL] ' + jumlah + ' panel dropdown atau date picker dibungkus SelubungPanel')
  }
}
if (berubah) simpan(FILE_C, c)

/* ===== 2. FilterBar.jsx: buang import SelubungPanel yang tidak terpakai ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (fs.existsSync(path.join(root, FILE_F))) {
  let f = baca(FILE_F)
  if (f.includes("import { SelubungPanel } from './ui.jsx'") && !f.includes('<SelubungPanel')) {
    f = f.replace("import { SelubungPanel } from './ui.jsx'\n", '')
    simpan(FILE_F, f)
    console.log('[BERHASIL] Import SelubungPanel yang tidak terpakai dibuang dari FilterBar.jsx')
  } else {
    console.log('[SUDAH ADA] FilterBar.jsx sudah rapi')
  }
} else {
  console.log('[LEWATI] FilterBar.jsx tidak ditemukan')
}

/* ===== 3. Verifikasi ===== */
c = baca(FILE_C)
console.log('')
console.log('Verifikasi:')
console.log((c.includes("SelubungPanel } from './ui.jsx'") ? '[OK] ' : '[BELUM] ') + 'Import SelubungPanel di controls.jsx')
console.log((c.includes('<SelubungPanel open={') ? '[OK] ' : '[BELUM] ') + 'Panel dropdown dan date picker dibungkus SelubungPanel')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Dropdown kategori, media, urutan, serta date picker bulan dan tanggal ternyata hidup di controls.jsx sebagai CustomSelect dan CustomDateInput, bukan di FilterBar.jsx.')
console.log('2. Panel utama FilterBar tidak memakai blok kondisional melainkan tukar kelas hidden, jadi memang tidak ada pola yang cocok di sana dan tidak dipaksa.')
console.log('3. Pembungkusan SelubungPanel kini dilakukan tepat di komponen yang benar, sehingga semua panel melayang mendapat animasi keluar.')
console.log('4. Import yang tadi sempat masuk ke FilterBar.jsx dibuang otomatis supaya file tetap bersih tanpa import menganggur.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu klik dropdown kategori atau media: panel muncul dengan animasi masuk seperti biasa.')
console.log('2. Klik di luar panel atau pilih opsi: panel memudar naik lalu hilang, tidak lenyap seketika.')
console.log('3. Buka dropdown urutan Terbaru atau Terlama: perilaku keluar sama halusnya.')
console.log('4. Buka date picker bulan maupun rentang tanggal pada TimeFilter: saat ditutup ia memudar dengan mulus.')
console.log('5. Buka tutup cepat berulang kali: tidak ada panel nyangkut, kedip, atau error di konsol.')