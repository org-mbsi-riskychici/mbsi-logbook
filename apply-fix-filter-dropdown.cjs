const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki dropdown filter yang tertimpa kontrol lain dan terpotong panel...')
console.log('')

/* ===== 1. FilterBar.jsx: state settled untuk melepas clip setelah panel selesai mengembang ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (!ada(FILE_F)) {
  console.log('[GAGAL] FilterBar.jsx tidak ditemukan')
  process.exit(1)
}
let f = baca(FILE_F)
let berubahF = false

if (f.includes("import { useEffect, useState } from 'react'")) {
  console.log('[SUDAH ADA] Impor react di FilterBar.jsx')
} else {
  f = "import { useEffect, useState } from 'react'\n" + f
  berubahF = true
  console.log('[BERHASIL] Impor useEffect dan useState ditambahkan di FilterBar.jsx')
}

const STATE_BARU = `export function FilterBar(props) {
  const [settled, setSettled] = useState(false)
  useEffect(function () {
    if (props.open) {
      const t = setTimeout(function () { setSettled(true) }, 400)
      return function () { clearTimeout(t) }
    }
    setSettled(false)
    return undefined
  }, [props.open])
  return (`

if (f.includes('const [settled, setSettled] = useState(false)')) {
  console.log('[SUDAH ADA] State settled di FilterBar.jsx')
} else if (f.includes('export function FilterBar(props) {\n  return (')) {
  f = f.replace('export function FilterBar(props) {\n  return (', STATE_BARU)
  berubahF = true
  console.log('[BERHASIL] State settled plus timer 400ms dipasang di FilterBar.jsx')
} else {
  console.log('[TIDAK KETEMU] Pola awal fungsi FilterBar')
}

const DALAM_LAMA = '<div className="filter-dalam">'
const DALAM_BARU = "<div className={'filter-dalam' + (props.open && settled ? ' filter-dalam-santai' : '')}>"
if (f.includes('filter-dalam-santai')) {
  console.log('[SUDAH ADA] Kelas filter-dalam-santai pada div dalam')
} else if (f.includes(DALAM_LAMA)) {
  f = f.replace(DALAM_LAMA, DALAM_BARU)
  berubahF = true
  console.log('[BERHASIL] Div filter-dalam kini memakai kelas santai saat panel terbuka penuh')
} else {
  console.log('[TIDAK KETEMU] Div filter-dalam di FilterBar.jsx')
}

if (berubahF) simpan(FILE_F, f)

/* ===== 2. index.css: transform akhir none plus pelepasan clip ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
let berubahC = false

if (css.includes('filter-dalam-santai')) {
  console.log('[SUDAH ADA] Perbaikan fix-filter-dropdown di index.css')
} else {
  const pasangan = [
    [
      '.filter-wrap-buka .filter-isi {\n  opacity: 1;\n  transform: translateY(0);',
      '.filter-wrap-buka .filter-isi {\n  opacity: 1;\n  transform: none;'
    ],
    [
      '.filter-wrap-buka .filter-isi > * {\n  opacity: 1;\n  transform: translateY(0);\n}',
      '.filter-wrap-buka .filter-isi > * {\n  opacity: 1;\n  transform: none;\n}'
    ],
    [
      '.filter-wrap-buka .filter-dalam { visibility: visible; }',
      '.filter-wrap-buka .filter-dalam { visibility: visible; }\n/* fix-filter-dropdown: clip dilepas setelah panel selesai mengembang supaya dropdown dan date picker bebas keluar panel seperti semula */\n.filter-dalam-santai { overflow: visible; }'
    ],
    [
      '  .filter-dalam { visibility: visible; }',
      '  .filter-dalam { visibility: visible; overflow: visible; }'
    ]
  ]
  for (let i = 0; i < pasangan.length; i++) {
    const lama = pasangan[i][0]
    const baru = pasangan[i][1]
    if (css.includes(lama)) {
      css = css.replace(lama, baru)
      berubahC = true
      console.log('[BERHASIL] Bagian CSS nomor ' + (i + 1) + ' diperbarui')
    } else {
      console.log('[TIDAK KETEMU] Bagian CSS nomor ' + (i + 1) + ': ' + lama.split('\n')[0])
    }
  }
}
if (berubahC) simpan(FILE_CSS, css)

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const f2 = baca(FILE_F)
const c2 = baca(FILE_CSS)
console.log((f2.includes("import { useEffect, useState } from 'react'") ? '[OK] ' : '[BELUM] ') + 'Impor react tersedia di FilterBar.jsx')
console.log((f2.includes('const [settled, setSettled] = useState(false)') ? '[OK] ' : '[BELUM] ') + 'State settled tersedia')
console.log((f2.includes('filter-dalam-santai') ? '[OK] ' : '[BELUM] ') + 'Kelas santai terpasang pada div dalam')
console.log((c2.includes('.filter-dalam-santai { overflow: visible; }') ? '[OK] ' : '[BELUM] ') + 'Clip dilepas saat panel terbuka penuh')
console.log((c2.includes('.filter-wrap-buka .filter-isi > * {\n  opacity: 1;\n  transform: none;') ? '[OK] ' : '[BELUM] ') + 'Transform akhir none supaya stacking context hilang')
console.log((c2.includes('  .filter-dalam { visibility: visible; overflow: visible; }') ? '[OK] ' : '[BELUM] ') + 'Desktop tidak memotong dropdown')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab dua bug sebelumnya:')
console.log('1. Dropdown tertimpa: keadaan akhir transform translateY(0) membuat tiap kontrol menjadi stacking context sendiri, jadi z-30 milik dropdown terperangkap dan kontrol sesudahnya menimpa daftar pilihan. Kini keadaan akhir transform none sehingga stacking context hilang setelah animasi masuk selesai.')
console.log('2. Dropdown terpotong: overflow hidden pada filter-dalam diperlukan selama animasi grid rows, tetapi ikut memotong panel dropdown. Kini clip dilepas 400 milidetik setelah panel mulai terbuka (kelas filter-dalam-santai), dan langsung dilepas permanen di layar 1280 piksel ke atas.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Daftar Hadir atau Logbook di ponsel, ketuk tombol Filter dan tunggu sebentar sampai panel selesai mengembang.')
console.log('2. Ketuk Semua mahasiswa: daftar pilihan kini tampil di atas kontrol lain dan menjulur keluar kartu filter seperti sebelum patch, tidak terpotong.')
console.log('3. Ketuk Pilih bulan dan sortir Terbaru: panel tanggal serta daftar sortir juga keluar panel dengan bebas.')
console.log('4. Tutup panel: tinggi tetap merapat mulus ke nol karena clip aktif lagi selama animasi menutup.')
console.log('5. Lebarkan jendela ke ukuran desktop: panel selalu terbuka dan dropdown tidak pernah terpotong.')