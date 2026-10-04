#!/usr/bin/env node
/* patch-pengingat-lihat-semua-v4.cjs
   Pemakaian: node patch-pengingat-lihat-semua-v4.cjs   (jalankan dari root repo)
   Perbaikan v3: cek idempoten sebelumnya keliru mencocokkan kata "Sembunyikan"
   pada atribut title tombol tutup banner (title="Sembunyikan Pengingat"),
   sehingga patch selalu dilewati padahal toggle belum terpasang.
   Cek kini memakai pola onClick toggle.
   Fungsi: mengubah tombol "Lihat Semua" menjadi toggle dua arah
   (Lihat Semua ↔ Sembunyikan, daftar melipat kembali jadi 3). */
const fs = require('fs')
const path = require('path')
const rel = 'src/components/PengingatBanner.jsx'
const p = path.join(process.cwd(), rel)
if (!fs.existsSync(p)) {
  console.error('File tidak ditemukan: ' + rel)
  process.exit(1)
}
let src = fs.readFileSync(p, 'utf8')
const crlf = src.indexOf('\r\n') !== -1
if (crlf) src = src.split('\r\n').join('\n')

if (src.indexOf('setLihatSemua(function (v) { return !v })') !== -1) {
  console.log('LEWATI ' + rel + ' (tombol sudah bersifat toggle)')
  process.exit(0)
}
if (src.indexOf('lihatSemua') === -1) {
  console.error('Fitur Lihat Semua belum terpasang. Jalankan patch-pengingat-lihat-semua-v1.cjs terlebih dahulu.')
  process.exit(1)
}

const gagal = []
function ganti(pola, pengganti, label) {
  const hasil = src.replace(pola, pengganti)
  if (hasil === src) gagal.push(label)
  else src = hasil
}

/* 1. Klik tombol kini membalik state, bukan cuma membuka */
ganti(
  'onClick={function () { setLihatSemua(true) }}',
  'onClick={function () { setLihatSemua(function (v) { return !v }) }}',
  'onClick toggle'
)

/* 2. Tombol tetap tampil saat daftar terbuka (labelnya yang berganti) */
ganti(
  '{terlewat.length > 3 && !lihatSemua ? (',
  '{terlewat.length > 3 ? (',
  'kondisi tombol'
)

/* 3. Label dinamis: Lihat Semua ↔ Sembunyikan */
ganti(
  /Lihat Semua \(\{terlewat\.length\} (?:hari|tanggal)\)/,
  "{lihatSemua ? 'Sembunyikan' : 'Lihat Semua (' + terlewat.length + ' tanggal)'}",
  'label Lihat Semua / Sembunyikan'
)

if (gagal.length) {
  console.error('PATCH DIBATALKAN (tidak ada file yang ditulis):')
  gagal.forEach(function (g) { console.error('  - ' + g) })
  process.exit(1)
}

const keluaran = crlf ? src.split('\n').join('\r\n') : src
fs.writeFileSync(p, keluaran, 'utf8')
console.log('UBAH  ' + rel + ' (tombol Lihat Semua kini toggle, bisa Sembunyikan lagi)')
console.log('Silakan jalankan npm run dev untuk verifikasi.')