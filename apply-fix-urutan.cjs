const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki urutan kartu dengan tiebreaker created_at...')
console.log('')

/* ===== 1. format.js: ganti urutkanTanggal dengan versi bertiebreaker ===== */
const FILE_F = 'src/lib/format.js'
if (!fs.existsSync(path.join(root, FILE_F))) {
  console.log('[GAGAL] format.js tidak ditemukan')
  process.exit(1)
}
let f = baca(FILE_F)
const RE_FUNGSI = /export function urutkanTanggal\(list, mode\) \{[\s\S]*?\n\}/
const FUNGSI_BARU = `export function waktuUrut(x) {
  if (!x) return 0
  const src = x.created_at || x.updated_at || ''
  if (!src) return 0
  const t = new Date(src).getTime()
  return isNaN(t) ? 0 : t
}
export function urutkanTanggal(list, mode) {
  const arr = (list || []).slice()
  arr.sort(function (a, b) {
    const ta = new Date(a.tanggal + 'T00:00:00').getTime()
    const tb = new Date(b.tanggal + 'T00:00:00').getTime()
    if (ta !== tb) return mode === 'terlama' ? ta - tb : tb - ta
    const ca = waktuUrut(a)
    const cb = waktuUrut(b)
    if (ca !== cb) return mode === 'terlama' ? ca - cb : cb - ca
    const ia = a.id || ''
    const ib = b.id || ''
    if (ia !== ib) return ia < ib ? (mode === 'terlama' ? -1 : 1) : (mode === 'terlama' ? 1 : -1)
    return 0
  })
  return arr
}`
if (f.includes('export function waktuUrut')) {
  console.log('[SUDAH ADA] Tiebreaker created_at di format.js')
} else if (RE_FUNGSI.test(f)) {
  f = f.replace(RE_FUNGSI, FUNGSI_BARU)
  simpan(FILE_F, f)
  console.log('[BERHASIL] urutkanTanggal kini memakai tiebreaker created_at lalu id')
} else {
  console.log('[TIDAK KETEMU] Fungsi urutkanTanggal di format.js')
}

/* ===== 2. Beranda dan Tim & Dospem: urutkan dulu sebelum slice 6 ===== */
;['src/pages/HomePage.jsx', 'src/pages/DospemPage.jsx'].forEach(function (rel) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let berubah = false
  const MARK_SLICE = "urutkanTanggal(logs, 'terbaru').slice(0, 6)"
  if (!isi.includes(MARK_SLICE)) {
    if (isi.includes('logs.slice(0, 6)')) {
      isi = isi.split('logs.slice(0, 6)').join(MARK_SLICE)
      berubah = true
      console.log('[BERHASIL] Slice 6 data kini lewat urutkanTanggal di ' + rel)
    } else {
      console.log('[TIDAK KETEMU] Pola logs.slice(0, 6) di ' + rel)
    }
  } else {
    console.log('[SUDAH ADA] Slice terurut di ' + rel)
  }
  const RE_IMP = /import \{ ([^}']*) \} from '\.\.\/lib\/format\.js'/
  if (isi.includes("urutkanTanggal } from '../lib/format.js'") || (RE_IMP.test(isi) && isi.match(RE_IMP)[1].includes('urutkanTanggal'))) {
    console.log('[SUDAH ADA] Import urutkanTanggal di ' + rel)
  } else if (RE_IMP.test(isi)) {
    isi = isi.replace(RE_IMP, function (m, daftar) { return "import { " + daftar + ", urutkanTanggal } from '../lib/format.js'" })
    berubah = true
    console.log('[BERHASIL] Import urutkanTanggal ditambahkan di ' + rel)
  } else {
    isi = isi.replace(/import /, "import { urutkanTanggal } from '../lib/format.js'\nimport ")
    berubah = true
    console.log('[BERHASIL] Baris import format.js baru ditambahkan di ' + rel)
  }
  if (berubah) simpan(rel, isi)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil analisis keberadaan bug sebelum perbaikan:')
console.log('1. Dashboard tab Logbook: ada, memakai urutkanTanggal tanpa tiebreaker.')
console.log('2. Dashboard tab Galeri: ada, penyebab sama.')
console.log('3. Dashboard tab Daftar Hadir: ada, penyebab sama.')
console.log('4. Publik Logbook, Galeri, Daftar Hadir: ada, penyebab sama.')
console.log('5. Beranda: ada, slice 6 memakai urutan mentah query yang hanya order tanggal.')
console.log('6. Tim & Dospem: ada, slice 6 aktivitas memakai urutan mentah query.')
console.log('')
console.log('Perilaku baru setelah perbaikan:')
console.log('1. Data dengan tanggal sama diurutkan berdasarkan waktu dibuat, jadi logbook yang baru ditambah langsung maju ke posisi terdepan kelompok tanggalnya.')
console.log('2. Kartu kiri dan kanan kini benar benar bergeser saat data ditambah atau dihapus, sesuai harapanmu.')
console.log('3. Mode terlama juga konsisten: dalam tanggal yang sama, yang lebih dulu dibuat tampil lebih dulu.')
console.log('4. Bila created_at tidak ada di suatu tabel, urutan jatuh ke id sehingga tetap stabil dan tidak acak acakan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buat dua logbook dengan tanggal yang sama, catat posisi kiri dan kanannya.')
console.log('2. Tambah logbook ketiga dengan tanggal yang sama: kartu baru muncul paling depan, kartu lama tergeser ke kanan lalu ke baris bawah.')
console.log('3. Hapus kartu paling kiri: sisa kartu langsung bergeser mengisi posisi kiri.')
console.log('4. Ganti sortir ke terlama: urutan dalam tanggal yang sama berbalik rapi.')
console.log('5. Ulangi pengecekan cepat di tab Galeri, Daftar Hadir, halaman publik, Beranda, dan Tim & Dospem.')