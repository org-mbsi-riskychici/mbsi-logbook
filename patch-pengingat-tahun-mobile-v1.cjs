#!/usr/bin/env node
/* patch-pengingat-tahun-mobile-v1.cjs
   Pemakaian: node patch-pengingat-tahun-mobile-v1.cjs
   Menambahkan tahun pada format tanggal mobile di banner pengingat logbook,
   sehingga tampil: "Sen, 8 Sept 2026" (sebelumnya hanya "Sen, 8 Sept"). */
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

// Cek apakah sudah ada tahun (mencegah duplikasi)
if (src.indexOf("d.getFullYear()\n}") !== -1 || src.indexOf("d.getFullYear() + '\\n}") !== -1) {
  // Cek lebih teliti: apakah fungsi formatTanggalMobile sudah mengandung getFullYear di return-nya
  const cocok = src.match(/function formatTanggalMobile\([^)]*\)\s*\{[\s\S]*?return[\s\S]*?getFullYear[\s\S]*?\n\}/)
  if (cocok) {
    console.log('LEWATI ' + rel + ' (formatTanggalMobile sudah menyertakan tahun)')
    process.exit(0)
  }
}

// Ganti fungsi formatTanggalMobile yang lama
const POLA_LAMA = /function formatTanggalMobile\(s\) \{\s*if \(!s\) return ''\s*const d = new Date\(s \+ 'T00:00:00'\)\s*if \(Number\.isNaN\(d\.getTime\(\)\)\) return s\s*return HARI_PENDEK\[d\.getDay\(\)\] \+ ', ' \+ d\.getDate\(\) \+ ' ' \+ BULAN_PENDEK\[d\.getMonth\(\)\]\s*\}/

const FUNGSI_BARU = `function formatTanggalMobile(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return HARI_PENDEK[d.getDay()] + ', ' + d.getDate() + ' ' + BULAN_PENDEK[d.getMonth()] + ' ' + d.getFullYear()
}`

const hasil = src.replace(POLA_LAMA, FUNGSI_BARU)
if (hasil === src) {
  console.error('Pola fungsi formatTanggalMobile tidak ditemukan. Pastikan file PengingatBanner.jsx memiliki struktur asli.')
  process.exit(1)
}

const keluaran = crlf ? hasil.split('\n').join('\r\n') : hasil
fs.writeFileSync(p, keluaran, 'utf8')
console.log('UBAH  ' + rel + ' (tahun ditambahkan pada format tanggal mobile)')
console.log('Silakan jalankan npm run dev untuk verifikasi.')