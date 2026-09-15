const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai memindahkan Lightbox ke portal document.body...')
console.log('')

/* ===== 1. Pastikan createPortal tersedia ===== */
if (u.includes("createPortal } from 'react-dom'")) {
  console.log('[SUDAH ADA] Import createPortal di ui.jsx')
} else {
  u = "import { createPortal } from 'react-dom'\n" + u
  console.log('[BERHASIL] Import createPortal ditambahkan di baris pertama ui.jsx')
}

/* ===== 2. Bungkus return Lightbox dengan createPortal ===== */
const idx = u.indexOf('function Lightbox(')
if (idx === -1) {
  console.log('[TIDAK KETEMU] Fungsi Lightbox di ui.jsx')
} else {
  const idxOpen = u.indexOf('{', idx)
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = idxOpen; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Lightbox tidak terbaca')
  } else {
    let span = u.slice(idx, akhir)
    if (span.includes('createPortal(')) {
      console.log('[SUDAH ADA] Lightbox sudah memakai portal')
    } else if (!/return \(/.test(span)) {
      console.log('[TIDAK KETEMU] Pola return ( di dalam Lightbox')
    } else if (!span.endsWith(')\n}')) {
      console.log('[TIDAK KETEMU] Pola penutup return di Lightbox')
    } else {
      span = span.replace(/return \(/, 'return createPortal(')
      span = span.slice(0, span.length - 3) + ', document.body)\n}'
      u = u.slice(0, idx) + span + u.slice(akhir)
      fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')
      console.log('[BERHASIL] Lightbox kini dirender lewat portal ke document.body')
    }
  }
}

/* ===== 3. Verifikasi ===== */
u = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u.includes("import { createPortal } from 'react-dom'") ? '[OK] ' : '[BELUM] ') + 'Import createPortal ada di ui.jsx')
console.log((u.includes('return createPortal(') ? '[OK] ' : '[BELUM] ') + 'Return Lightbox dibungkus createPortal')
console.log((u.includes(', document.body)') ? '[OK] ' : '[BELUM] ') + 'Target portal document.body')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Lightbox tetap dikendalikan oleh state komponen kartu, tetapi elemen DOM-nya kini hidup langsung di body.')
console.log('2. Karena tidak ada lagi leluhur ber-transform, position fixed inset-0 kembali berarti sepenuh viewport.')
console.log('3. Efek hover terangkat dan animasi masuk kartu tidak dikurangi sedikit pun, jadi tampilan tetap hidup.')
console.log('4. Lightbox yang dibuka dari dalam modal detail juga ikut aman karena portal menembus keluar dari panel modal.')
console.log('5. Tombol unduh, tombol X, klik latar, dan tombol Esc tetap bekerja karena semua logika masih di komponen yang sama.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook atau Galeri, arahkan kursor ke kartu lalu klik ikon perbesar tanpa membuka Detail.')
console.log('2. Lightbox kini menutup seluruh layar dengan latar gelap penuh dan gambar berada tepat di tengah.')
console.log('3. Klik ikon perbesar segera setelah halaman dimuat, saat kartu masih beranimasi masuk: posisi Lightbox tetap benar.')
console.log('4. Buka Detail sebuah media lalu perbesar dari dalam modal: Lightbox menutupi modal dengan rapi.')
console.log('5. Tutup lewat X, klik latar, atau Esc: semuanya kembali normal tanpa sisa overlay.')