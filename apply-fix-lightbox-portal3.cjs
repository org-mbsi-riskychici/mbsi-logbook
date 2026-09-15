const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Melengkapi panggilan createPortal pada Lightbox...')
console.log('')

/* ===== 1. Pastikan import createPortal ada ===== */
if (!u.includes("createPortal } from 'react-dom'")) {
  u = "import { createPortal } from 'react-dom'\n" + u
  berubah = true
  console.log('[BERHASIL] Import createPortal ditambahkan')
} else {
  console.log('[SUDAH ADA] Import createPortal')
}

/* ===== 2. Pastikan return Lightbox memakai createPortal ===== */
if (!u.includes('return createPortal(')) {
  const start = u.indexOf('function Lightbox(')
  const idxReturn = start === -1 ? -1 : u.indexOf('return (', start)
  if (idxReturn === -1) {
    console.log('[TIDAK KETEMU] Pola return ( di Lightbox')
  } else {
    u = u.slice(0, idxReturn) + 'return createPortal(' + u.slice(idxReturn + 'return ('.length)
    berubah = true
    console.log('[BERHASIL] Return Lightbox dibungkus createPortal')
  }
} else {
  console.log('[SUDAH ADA] Return Lightbox memakai createPortal')
}

/* ===== 3. Tambahkan argumen document.body dengan menghitung kurung ===== */
if (u.includes(', document.body)')) {
  console.log('[SUDAH ADA] Argumen document.body sudah ada')
} else {
  const idxCall = u.indexOf('return createPortal(')
  if (idxCall === -1) {
    console.log('[TIDAK KETEMU] Panggilan createPortal untuk dilengkapi')
  } else {
    const openIdx = idxCall + 'return createPortal'.length
    let depth = 0, closeIdx = -1, inStr = false, strCh = false, inLine = false, inBlock = false
    for (let i = openIdx; i < u.length; i++) {
      const ch = u[i]
      const next = u[i + 1] || ''
      if (inLine) { if (ch === '\n') inLine = false; continue }
      if (inBlock) { if (ch === '*' && next === '/') { inBlock = false; i++ } continue }
      if (inStr) { if (ch === '\\') { i++; continue } if (ch === strCh) inStr = false; continue }
      if (ch === '/' && next === '/') { inLine = true; continue }
      if (ch === '/' && next === '*') { inBlock = true; i++; continue }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
      if (ch === '(') depth++
      if (ch === ')') {
        depth--
        if (depth === 0) { closeIdx = i; break }
      }
    }
    if (closeIdx === -1) {
      console.log('[TIDAK KETEMU] Kurung penutup panggilan createPortal')
    } else {
      u = u.slice(0, closeIdx) + ', document.body' + u.slice(closeIdx)
      berubah = true
      console.log('[BERHASIL] Argumen document.body disisipkan tepat sebelum kurung penutup createPortal')
    }
  }
}

if (berubah) fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')

const u2 = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u2.includes("import { createPortal } from 'react-dom'") ? '[OK] ' : '[BELUM] ') + 'Import createPortal')
console.log((u2.includes('return createPortal(') ? '[OK] ' : '[BELUM] ') + 'Return Lightbox memakai createPortal')
console.log((u2.includes(', document.body)') ? '[OK] ' : '[BELUM] ') + 'Argumen document.body lengkap')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan penting:')
console.log('1. Sebelum script ini dijalankan, createPortal hanya punya satu argumen, sehingga membuka Lightbox akan membuat error container undefined.')
console.log('2. Setelah script ini, panggilan createPortal lengkap menjadi createPortal(isi, document.body) dan Lightbox benar benar hidup di body.')
console.log('3. Tidak ada bagian lain dari Lightbox maupun komponen lain yang disentuh.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Logbook atau Galeri publik lalu klik ikon perbesar pada kartu tanpa membuka Detail.')
console.log('2. Lightbox menutup seluruh viewport dengan latar gelap dan media di tengah, tidak lagi terkunci di kotak kartu.')
console.log('3. Perbesar dari dalam modal detail: Lightbox menimpa modal dengan rapi.')
console.log('4. Tutup lewat X, klik latar, atau Esc: bersih tanpa sisa overlay dan tanpa error di konsol.')