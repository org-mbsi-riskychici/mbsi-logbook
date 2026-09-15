const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghaluskan tekanan pada kartu galeri yang bisa diklik...')
console.log('')

const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
const CSS_BLOK = `/* klik-halus-v1: kartu clickable menekan dan melepas pakai kurva mulus, hentakan saat kartu galeri diketuk hilang */
.clickable {
  transition: transform 0.24s cubic-bezier(0.32, 0.72, 0, 1), box-shadow 0.24s ease, opacity 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}
.clickable:active {
  transform: scale(0.985);
  transition-duration: 0.09s;
}
`
if (css.includes('klik-halus-v1')) {
  console.log('[SUDAH ADA] CSS klik-halus-v1 di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
  console.log('[BERHASIL] CSS klik-halus-v1 ditambahkan di index.css')
}

console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
console.log((c2.includes('klik-halus-v1') ? '[OK] ' : '[BELUM] ') + 'CSS klik-halus-v1 tersedia')
console.log((c2.includes('.clickable {\n  transition: transform 0.24s') ? '[OK] ' : '[BELUM] ') + 'Elemen clickable kini punya transisi transform sendiri')
console.log((c2.includes('.clickable:active {\n  transform: scale(0.985);') ? '[OK] ' : '[BELUM] ') + 'Tekanan diperlembut dan menang atas aturan scale lama')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab hentakan dan cara kerja perbaikan:')
console.log('1. Kartu galeri adalah article berkelas clickable, padahal daftar transisi global proyek hanya menulis button, a, input, select, textarea. Jadi transform scale saat menekan berlaku tanpa transisi: kartu mengecil sekonyongkonyong dan balik sekonyongkonyong saat dilepas, terasa sebagai hentakan.')
console.log('2. Kini .clickable diberi transisi transform sendiri dengan kurva cubic-bezier yang sama seperti menu mobile dan panel filter, sehingga tekanan dan pelepasan sama sama meluncur.')
console.log('3. Besaran tekan dilembutkan dari scale 0.97 menjadi 0.985 supaya gerakan kartu tipis saja, cukup sebagai umpan balik tanpa terasa seperti dilompatkan.')
console.log('4. Fase menekan memakai durasi 90 milidetik supaya kartu tetap terasa sigap menempel di jari, sementara fase melepas memakai 240 milidetik sehingga kartu kembali ke ukuran penuh dengan lembut, termasuk saat modal detail muncul di atasnya.')
console.log('5. Aturan baru diletakkan di akhir index.css sehingga menang atas aturan .clickable:active lama yang berspesifisitas sama, tanpa perlu menyentuh file komponen sama sekali.')
console.log('6. Pengguna reduce motion tetap mendapat perilaku instan karena aturan global proyek memotong durasi transisi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Galeri lalu tekan dan tahan kartu: kartu mengecil tipis dengan mulus, tidak lagi meloncat seketika.')
console.log('2. Lepas tekanan: kartu kembali ke ukuran penuh dengan lembut sambil modal detail terbuka, tidak ada hentakan di belakang overlay.')
console.log('3. Ketuk cepat beberapa kartu berturut turut: setiap tekanan terasa konsisten dan halus.')
console.log('4. Buka dashboard tab Galeri: kartu di daftar kanan memakai komponen yang sama dan ikut terasa halus.')
console.log('5. Tombol tombol lain tidak berubah karena perbaikan hanya menyentuh kelas clickable.')