const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi pergantian mode Bulan dan Rentang Waktu...')
console.log('')

/* ===== 1. FilterBar.jsx: bungkus kedua cabang TimeFilter dengan div beranimasi ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (!fs.existsSync(path.join(root, FILE_F))) {
  console.log('[GAGAL] FilterBar.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_F)
if (d.includes('anim-ganti-bulan')) {
  console.log('[SUDAH ADA] Cabang TimeFilter sudah beranimasi')
} else {
  const RE_BLOK = /(\{f\.timeMode === 'bulan'\n\?)\s*(<FilterDate mode="month"[^\n]*\/>)\n(:)\s*<div className="flex flex-wrap items-center gap-2">/
  if (!RE_BLOK.test(d)) {
    console.log('[TIDAK KETEMU] Pola cabang TimeFilter di FilterBar.jsx')
  } else {
    d = d.replace(RE_BLOK, function (m, kepala, tanggalBulan, titikDua) {
      return kepala + ' <div key="bulan" className="anim-ganti-bulan flex flex-wrap items-center gap-2">\n' +
        tanggalBulan + '\n</div>\n' +
        titikDua + ' <div key="rentang" className="anim-ganti-rentang flex flex-wrap items-center gap-2">'
    })
    simpan(FILE_F, d)
    console.log('[BERHASIL] Cabang Bulan dan Rentang Waktu dibungkus div beranimasi')
  }
}

/* ===== 2. index.css: keyframe meluncur dua arah ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* ganti-mode-waktu: animasi halus saat berpindah antara pilihan bulan dan rentang waktu */
@keyframes gantiBulan {
from { opacity: 0; transform: translateX(-10px) scale(0.98); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes gantiRentang {
from { opacity: 0; transform: translateX(10px) scale(0.98); }
to { opacity: 1; transform: translateX(0) scale(1); }
}
.anim-ganti-bulan { animation: gantiBulan 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.anim-ganti-rentang { animation: gantiRentang 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('ganti-mode-waktu')) {
    console.log('[SUDAH ADA] CSS ganti-mode-waktu di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS ganti-mode-waktu ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
d = baca(FILE_F)
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((d.includes('anim-ganti-bulan') && d.includes('anim-ganti-rentang') ? '[OK] ' : '[BELUM] ') + 'Kedua cabang TimeFilter memakai kelas animasi')
console.log((css2.includes('@keyframes gantiBulan') && css2.includes('@keyframes gantiRentang') ? '[OK] ' : '[BELUM] ') + 'Keyframe meluncur dua arah tersedia')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja animasi baru:')
console.log('1. Setiap cabang dibungkus div dengan key berbeda, jadi saat mode berganti React memasang ulang cabang baru dan animasi masuk langsung terpicu.')
console.log('2. Arah luncuran mengikuti posisi tombol saklar: Bulan masuk dari kiri, Rentang Waktu masuk dari kanan, sehingga pergantian terasa seperti geseran konsisten.')
console.log('3. Animasi memakai opacity dan transform saja dengan durasi 0.25 detik, jadi tetap ringan di device kelas bawah.')
console.log('4. Tombol saklar Bulan dan Rentang Waktu sudah lebih dulu halus karena aturan transisi global button mencakup background dan warna teks.')
console.log('5. Perbaikan berada di komponen TimeFilter pusat, jadi seluruh halaman publik dan dashboard yang memakai FilterBar otomatis kebagian.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu perhatikan baris filter waktu.')
console.log('2. Klik Rentang Waktu: dua kolom tanggal dan teks sampai meluncur masuk dari kanan sambil memudar muncul.')
console.log('3. Klik Bulan kembali: pemilih bulan meluncur masuk dari kiri dengan lembut.')
console.log('4. Bolak balik cepat beberapa kali: setiap pergantian tetap halus tanpa kedip kasar.')
console.log('5. Ulangi di dashboard dan halaman publik lain: perilaku sama karena memakai komponen yang sama.')