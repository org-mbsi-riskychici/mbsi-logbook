const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_M = 'src/main.jsx'
if (!fs.existsSync(path.join(root, FILE_M))) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = fs.readFileSync(path.join(root, FILE_M), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai menghilangkan kedap kedip pada bayangan cabang...')
console.log('')

const ANCHOR = 'document.body.appendChild(hantu)'
const SISIP = 'document.body.appendChild(hantu)\n' +
  "          hantu.style.animation = 'none'\n" +
  "          const turunan = hantu.querySelectorAll('*')\n" +
  "          for (let i = 0; i < turunan.length; i++) turunan[i].style.animation = 'none'"

if (m.includes('hantu.style.animation')) {
  console.log('[SUDAH ADA] Animasi CSS pada bayangan sudah dimatikan')
} else if (m.includes(ANCHOR)) {
  m = m.replace(ANCHOR, SISIP)
  fs.writeFileSync(path.join(root, FILE_M), m, 'utf8')
  console.log('[BERHASIL] Animasi CSS pada bayangan dan turunannya dimatikan')
} else {
  console.log('[TIDAK KETEMU] Pola pemasangan bayangan di main.jsx')
}

m = fs.readFileSync(path.join(root, FILE_M), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((m.includes('hantu.style.animation') ? '[OK] ' : '[BELUM] ') + 'Bayangan bebas animasi CSS bawaan')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan akar masalah:')
console.log('1. Bayangan keluar dibuat dengan mengkloning node cabang, dan node kloning dianggap node baru oleh browser.')
console.log('2. Karena dianggap baru, animasi masuk milik kelas cabang ikut terputar ulang pada klon, menaikkan opacity dari nol.')
console.log('3. Padahal bersamaan klon sedang dipudarkan dari satu ke nol lewat Web Animations API, sehingga dua animasi opacity bertarung dan terlihat kedap kedip.')
console.log('4. Sekarang seluruh animasi CSS pada klon dan turunannya dinolkan, jadi klon hanya memudar keluar sekali jalan dengan mulus.')
console.log('5. Animasi geser tombol sortir tidak terpengaruh karena memang tidak memakai animasi CSS bawaan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu bolak balik antara Bulan dan Rentang Waktu.')
console.log('2. Pilih bulan atau pilih tanggal kini memudar keluar dengan bersih, tanpa kedip atau bayangan ganda.')
console.log('3. Cabang baru tetap meluncur masuk dari arah yang benar sambil tetangga bergeser mulus.')
console.log('4. Klik cepat berulang kali: silang animasi tetap rapi tanpa sisa bayangan menumpuk.')