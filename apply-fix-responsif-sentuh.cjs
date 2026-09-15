const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghilangkan jeda ketuk di layar sentuh tablet...')
console.log('')

const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
const CSS_BLOK = `/* sentuh-responsif-v1: matikan deteksi double-tap zoom supaya ketukan langsung menjadi klik tanpa jeda di browser tablet */
* { touch-action: manipulation; }
/* umpan balik tekan lebih sigap di layar sentuh: efek mengecil terjadi hampir instan, saat dilepas tetap mulus */
button:active:not(:disabled), a:active, .clickable:active { transition-duration: 0.06s; }
`
if (css.includes('sentuh-responsif-v1')) {
  console.log('[SUDAH ADA] CSS sentuh-responsif-v1 di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
  console.log('[BERHASIL] CSS sentuh-responsif-v1 ditambahkan di index.css')
}

console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
console.log((c2.includes('* { touch-action: manipulation; }') ? '[OK] ' : '[BELUM] ') + 'Touch action manipulation global terpasang')
console.log((c2.includes('button:active:not(:disabled), a:active, .clickable:active { transition-duration: 0.06s; }') ? '[OK] ' : '[BELUM] ') + 'Umpan balik tekan dipercepat')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R, atau tutup lalu buka ulang tab di tablet.')
console.log('')
console.log('Penyebab jeda dan cara kerja perbaikan:')
console.log('1. Browser layar sentuh menahan peristiwa click sekitar 200 sampai 300 milidetik setelah touchend untuk menunggu kemungkinan ketukan kedua sebagai double-tap zoom, karena halaman masih memperbolehkan zoom ganda. Mouse di desktop tidak punya deteksi ini, sehingga jeda hanya terasa di tablet.')
console.log('2. touch-action manipulation memberitahu browser bahwa gestur double-tap zoom tidak dipakai di elemen mana pun, sehingga click dilepas segera setelah jari terangkat. Scroll satu jari dan pinch zoom tetap berfungsi normal karena manipulation hanya mematikan zoom ketukan ganda.')
console.log('3. Aturan diterapkan pada semua elemen lewat selektor bintang supaya ketukan di kartu, panel, area kosong, dan kontrol sama sama bebas jeda, bukan hanya pada tombol dan tautan.')
console.log('4. Umpan balik tekan dipercepat menjadi 60 milidetik sehingga efek mengecil saat ditekan terasa menempel di jari, sementara saat dilepas tombol kembali memakai transisi 150 milidetik yang mulus.')
console.log('5. Animasi yang memang disengaja tidak disentuh: pengembangan panel filter dan menu mobile 0.36 detik serta kemunculan berurutan kontrol tetap sama. Bila suatu saat ingin terasa lebih instan lagi di tablet, durasi tersebut bisa dipendekkan terpisah tanpa menyentuh perbaikan ini.')
console.log('6. Aksesibilitas terjaga: pinch zoom tetap diizinkan karena manipulation tidak melarang zoom cubit, hanya zoom ketukan ganda yang dihapus.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka situs di tablet lalu ketuk tombol, kartu, dropdown, tab, dan panah carousel: respons terasa instan tanpa jeda sepersekian detik setelah ketukan.')
console.log('2. Cubit layar untuk memperbesar: pinch zoom masih berfungsi seperti biasa.')
console.log('3. Ketuk dua kali cepat pada teks atau gambar: halaman tidak lagi zoom ganda, memang itu gestur yang dihilangkan demi menghapus jeda.')
console.log('4. Gulir halaman satu jari: scroll tetap mulus dan indikator scrollbar tipis tetap muncul.')
console.log('5. Buka di desktop: perilaku hover, klik, dan animasi tidak berubah sama sekali.')