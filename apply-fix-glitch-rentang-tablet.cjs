const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki glitch memanjang kesamping saat Rentang Waktu muncul di tablet...')
console.log('')

/* ===== 1. index.css: animasi masuk cabang tanpa komponen horizontal plus jaring overflow-x ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
let berubahC = false

const KF_LAMA = `@keyframes gantiBulan {
from { opacity: 0; transform: translateX(-12px) scale(0.99); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateX(12px) scale(0.99); }
to { opacity: 1; transform: translateX(0) scale(1); }
}`
const KF_BARU = `@keyframes gantiBulan {
from { opacity: 0; transform: translateY(6px) scale(0.99); }
to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateY(6px) scale(0.99); }
to { opacity: 1; transform: translateY(0) scale(1); }
}`
if (css.includes('translateY(6px) scale(0.99)')) {
  console.log('[SUDAH ADA] Animasi masuk cabang versi vertikal')
} else if (css.includes(KF_LAMA)) {
  css = css.replace(KF_LAMA, KF_BARU)
  berubahC = true
  console.log('[BERHASIL] Animasi masuk cabang waktu diubah menjadi geser vertikal tanpa menonjol ke samping')
} else {
  console.log('[TIDAK KETEMU] Pola keyframes gantiBulan/gantiRentang versi mode-smooth-v2')
}

const CSS_JARING = `/* rentang-tablet-v1: jaring pengaman agar isi panel filter tidak bisa menonjol keluar lebar baris saat cabang waktu muncul */
.filter-isi { overflow-x: clip; }
`
if (css.includes('rentang-tablet-v1')) {
  console.log('[SUDAH ADA] Jaring overflow-x filter-isi')
} else {
  css = css.trimEnd() + '\n\n' + CSS_JARING
  berubahC = true
  console.log('[BERHASIL] Jaring overflow-x clip dipasang pada filter-isi')
}
if (berubahC) simpan(FILE_CSS, css)

/* ===== 2. main.jsx: hantu cabang plus FLIP hanya untuk layar lebar, tablet cukup animasi masuk bersih ===== */
const FILE_M = 'src/main.jsx'
if (!ada(FILE_M)) {
  console.log('[GAGAL] main.jsx tidak ditemukan')
  process.exit(1)
}
let m = baca(FILE_M)
const ANCHOR_WADAH = "const wadah = tombol.closest('.rounded-3xl') || toggle.parentElement.parentElement || toggle.parentElement"
if (m.includes('if (window.innerWidth < 1280) return')) {
  console.log('[SUDAH ADA] Penjaga lebar layar pada mekanisme FLIP filter')
} else if (m.includes(ANCHOR_WADAH)) {
  m = m.replace(ANCHOR_WADAH, "if (window.innerWidth < 1280) return\n       " + ANCHOR_WADAH)
  simpan(FILE_M, m)
  console.log('[BERHASIL] Mekanisme hantu cabang dan FLIP tetangga dilewati di bawah 1280px')
} else {
  console.log('[TIDAK KETEMU] Anchor baris wadah pada listener FLIP filter')
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
const m2 = baca(FILE_M)
console.log((c2.includes('translateY(6px) scale(0.99)') ? '[OK] ' : '[BELUM] ') + 'Animasi masuk cabang versi vertikal terpasang')
console.log((!c2.includes('translateX(-12px) scale(0.99)') ? '[OK] ' : '[BELUM] ') + 'Komponen horizontal pada masuk cabang sudah hilang')
console.log((c2.includes('.filter-isi { overflow-x: clip; }') ? '[OK] ' : '[BELUM] ') + 'Jaring overflow-x clip pada filter-isi tersedia')
console.log((m2.includes('if (window.innerWidth < 1280) return') ? '[OK] ' : '[BELUM] ') + 'Hantu cabang dan FLIP dilewati di layar tablet dan mobile')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab glitch dan cara kerja perbaikan:')
console.log('1. Animasi masuk cabang waktu versi lama memulai dari translateX plus minus 12 piksel. Di tablet cabang Rentang Waktu lebar dan duduk mepet tepi kartu, sedangkan pembungkus panel sengaja overflow visible demi dropdown, jadi geseran horizontal itu menonjol keluar tepi kartu dan terlihat sebagai konten memanjang kesamping.')
console.log('2. Mekanisme bayangan keluar meng-clone cabang lama menjadi elemen fixed yang memudar 180 milidetik, sementara FLIP memberi transform translate ke seluruh elemen panel selama 320 milidetik. Di tablet kontrol filter melipat ke beberapa baris sehingga perpindahan posisinya besar, clone dan elemen ber-transform saling tertumpuk dan terlihat seperti kontrol duplikat meregang ke samping.')
console.log('3. Kini animasi masuk cabang hanya memakai geser vertikal 6 piksel plus scale tipis, jadi tidak ada lagi komponen horizontal yang bisa menonjol keluar kartu di lebar mana pun.')
console.log('4. filter-isi diberi overflow-x clip sebagai jaring pengaman: apa pun yang coba keluar melewati lebar baris akan terpotong rapi, sementara overflow vertikal tetap bebas sehingga dropdown dan date picker masih bisa keluar panel seperti sebelumnya.')
console.log('5. Mekanisme hantu cabang dan FLIP tetangga hanya dijalankan pada layar 1280 piksel ke atas dimana baris filter tidak melipat, sehingga tablet dan mobile mendapat transisi bersih berupa memudar plus geser turun cabang baru tanpa duplikat maupun regangan.')
console.log('6. Desktop tidak kehilangan fitur: bayangan keluar dan pergeseran mulus kontrol tetangga tetap aktif, hanya animasi masuk cabang yang kini vertikal dan tetap lembut.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Daftar Hadir atau Logbook di lebar tablet, buka panel Filter, ketuk Rentang Waktu: dua pilihan tanggal muncul memudar dari bawah tanpa konten menonjol ke kanan dan tanpa kontrol duplikat bertumpuk.')
console.log('2. Ketuk Bulan lagi: cabang kembali tunggal dengan mulus, tidak ada sisa bayangan melebar.')
console.log('3. Ganti mode bolak balik beberapa kali cepat: tidak ada tumpukan clone maupun regangan samping.')
console.log('4. Buka dropdown atau date picker saat panel terbuka: panel pilihan tetap bebas keluar kartu ke bawah, tidak terpotong oleh jaring overflow-x.')
console.log('5. Lebarkan jendela ke ukuran desktop: bayangan keluar dan pergeseran mulus tetangga masih terasa, masuk cabang tetap lembut dari bawah.')
console.log('6. Uji di mode gelap: seluruh kontrol filter tetap gelap konsisten, tidak ada pill terang nyasar.')