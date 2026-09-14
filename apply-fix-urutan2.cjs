const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_F = 'src/lib/format.js'
if (!fs.existsSync(path.join(root, FILE_F))) {
  console.log('[GAGAL] format.js tidak ditemukan')
  process.exit(1)
}
let f = fs.readFileSync(path.join(root, FILE_F), 'utf8').replace(/\r\n/g, '\n')

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

console.log('Mulai mengganti urutkanTanggal di format.js (versi tahan pola)...')
console.log('')

if (f.includes('function waktuUrut')) {
  console.log('[SUDAH ADA] Tiebreaker created_at sudah terpasang di format.js')
} else {
  const POLA = [
    /export\s+function\s+urutkanTanggal\s*\([^)]*\)\s*\{/,
    /function\s+urutkanTanggal\s*\([^)]*\)\s*\{/,
    /(?:export\s+)?const\s+urutkanTanggal\s*=\s*function\s*\([^)]*\)\s*\{/,
    /(?:export\s+)?const\s+urutkanTanggal\s*=\s*\([^)]*\)\s*=>\s*\{/
  ]
  let m = null
  for (let i = 0; i < POLA.length; i++) { m = POLA[i].exec(f); if (m) break }
  if (!m) {
    if (f.includes('urutkanTanggal')) {
      console.log('[TIDAK KETEMU] Pola fungsi urutkanTanggal, kirim isi format.js ke chat')
    } else {
      f = f.trimEnd() + '\n\n' + FUNGSI_BARU + '\n'
      fs.writeFileSync(path.join(root, FILE_F), f, 'utf8')
      console.log('[BERHASIL] Fungsi urutkanTanggal baru ditambahkan di akhir format.js')
    }
  } else {
    const mulai = m.index
    const idxOpen = m.index + m[0].length - 1
    let brace = 0, akhir = -1, inStr = false, strCh = ''
    for (let i = idxOpen; i < f.length; i++) {
      const ch = f[i]
      const prev = i > 0 ? f[i - 1] : ''
      if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
      if (ch === '{') brace++
      if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
    }
    if (akhir === -1) {
      console.log('[GAGAL] Batas fungsi urutkanTanggal tidak terbaca')
    } else {
      const pakaiExport = m[0].indexOf('export') === 0
      const teks = pakaiExport ? FUNGSI_BARU : FUNGSI_BARU.replace(/export function/g, 'function')
      f = f.slice(0, mulai) + teks + f.slice(akhir)
      fs.writeFileSync(path.join(root, FILE_F), f, 'utf8')
      console.log('[BERHASIL] urutkanTanggal diganti versi bertiebreaker created_at dan id')
    }
  }
}

/* Verifikasi menyeluruh */
f = fs.readFileSync(path.join(root, FILE_F), 'utf8')
const h = fs.readFileSync(path.join(root, 'src/pages/HomePage.jsx'), 'utf8')
const dd = fs.readFileSync(path.join(root, 'src/pages/DospemPage.jsx'), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((f.includes('function waktuUrut') ? '[OK] ' : '[BELUM] ') + 'fungsi waktuUrut ada di format.js')
console.log((f.includes('waktuUrut(a)') ? '[OK] ' : '[BELUM] ') + 'tiebreaker created_at dipakai di pembanding')
console.log((h.includes("urutkanTanggal(logs, 'terbaru').slice(0, 6)") ? '[OK] ' : '[BELUM] ') + 'slice 6 data Beranda lewat urutkanTanggal')
console.log((dd.includes("urutkanTanggal(logs, 'terbaru').slice(0, 6)") ? '[OK] ' : '[BELUM] ') + 'slice 6 data Tim & Dospem lewat urutkanTanggal')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan:')
console.log('1. Perubahan Beranda dan Tim & Dospem dari script sebelumnya sudah aman terpasang dan tetap kompatibel karena nama fungsinya tidak berubah.')
console.log('2. Begitu format.js terganti, seluruh daftar di dashboard, halaman publik, Beranda, dan Tim & Dospem otomatis memakai tiebreaker baru.')
console.log('3. Bila masih ada baris TIDAK KETEMU, salin isi file src/lib/format.js ke chat supaya saya ganti manual sesuai bentuk aslinya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buat dua logbook bertanggal sama, catat posisi kiri dan kanannya.')
console.log('2. Tambah logbook ketiga bertanggal sama: kartu baru langsung muncul paling depan dan kartu lama bergeser ke kanan lalu ke baris bawah.')
console.log('3. Hapus kartu paling kiri: sisa kartu langsung bergeser mengisi posisi yang kosong.')
console.log('4. Ganti sortir ke terlama: urutan dalam tanggal yang sama berbalik rapi.')