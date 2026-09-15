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

console.log('Mulai memasang portal Lightbox tanpa pencocokan kurung...')
console.log('')

if (u.includes('return createPortal(')) {
  console.log('[SUDAH ADA] Lightbox sudah dibungkus createPortal')
} else {
  const start = u.indexOf('function Lightbox(')
  if (start === -1) {
    console.log('[TIDAK KETEMU] Fungsi Lightbox di ui.jsx')
  } else {
    const idxReturn = u.indexOf('return (', start)
    if (idxReturn === -1) {
      console.log('[TIDAK KETEMU] Pola return ( di dalam Lightbox')
    } else {
      u = u.slice(0, idxReturn) + 'return createPortal(' + u.slice(idxReturn + 'return ('.length)
      let end = u.indexOf('const ToastContext', start)
      if (end === -1) end = u.indexOf('export function ToastProvider', start)
      if (end === -1) end = u.length
      const span = u.slice(start, end)
      const pos = span.lastIndexOf('\n)\n}')
      if (pos === -1) {
        console.log('[TIDAK KETEMU] Pola penutup return Lightbox')
      } else {
        const spanBaru = span.slice(0, pos) + '\n, document.body)\n}' + span.slice(pos + '\n)\n}'.length)
        u = u.slice(0, start) + spanBaru + u.slice(end)
        berubah = true
        console.log('[BERHASIL] Return Lightbox dibungkus createPortal ke document.body')
      }
    }
  }
}

if (!u.includes("createPortal } from 'react-dom'")) {
  u = "import { createPortal } from 'react-dom'\n" + u
  berubah = true
  console.log('[BERHASIL] Import createPortal ditambahkan di baris pertama ui.jsx')
} else {
  console.log('[SUDAH ADA] Import createPortal di ui.jsx')
}

if (berubah) fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')

const u2 = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u2.includes("import { createPortal } from 'react-dom'") ? '[OK] ' : '[BELUM] ') + 'Import createPortal ada di ui.jsx')
console.log((u2.includes('return createPortal(') ? '[OK] ' : '[BELUM] ') + 'Return Lightbox dibungkus createPortal')
console.log((u2.includes(', document.body)') ? '[OK] ' : '[BELUM] ') + 'Target portal document.body')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perbedaan versi ini:')
console.log('1. Tidak ada lagi pencocokan kurung kurawal yang bisa kacau oleh literal regex atau tanda kutip di dalam Lightbox.')
console.log('2. Hanya dua titik yang disentuh: pembuka return dan tanda tutup return paling akhir di dalam fungsi Lightbox.')
console.log('3. Pencarian penutup dibatasi oleh deklarasi berikutnya, sehingga kode ToastProvider dan komponen lain tidak tersentuh.')
console.log('4. File kini ditulis sekali di akhir bila ada perubahan apa pun, jadi import tidak akan tertinggal lagi di memori.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Logbook atau Galeri publik, arahkan kursor ke kartu lalu klik ikon perbesar tanpa membuka Detail.')
console.log('2. Lightbox menutup seluruh viewport dengan latar gelap penuh dan media berada tepat di tengah.')
console.log('3. Perbesar media saat kartu masih beranimasi masuk atau saat kursor masih membuat kartu terangkat: posisi tetap benar.')
console.log('4. Perbesar dari dalam modal detail: Lightbox menimpa modal dengan rapi karena hidup di body.')
console.log('5. Tutup lewat X, klik latar, atau Esc: semuanya bersih tanpa sisa overlay.')