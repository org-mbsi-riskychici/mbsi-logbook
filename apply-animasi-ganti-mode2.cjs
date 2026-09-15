const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi pergantian mode Bulan dan Rentang Waktu (versi tahan pola)...')
console.log('')

/* ===== 1. FilterBar.jsx: bungkus kedua cabang TimeFilter lewat pencarian jangkar berurutan ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (!fs.existsSync(path.join(root, FILE_F))) {
  console.log('[GAGAL] FilterBar.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_F)
if (d.includes('anim-ganti-bulan')) {
  console.log('[SUDAH ADA] Cabang TimeFilter sudah beranimasi')
} else {
  const i1 = d.indexOf("{f.timeMode === 'bulan'")
  if (i1 === -1) {
    console.log('[TIDAK KETEMU] Awal cabang TimeFilter di FilterBar.jsx')
  } else {
    const iQ = d.indexOf('?', i1)
    const iF = d.indexOf('<FilterDate mode="month"', iQ)
    const iEnd = d.indexOf('/>', iF)
    const BUKA = '<div key="bulan" className="anim-ganti-bulan flex flex-wrap items-center gap-2">\n'
    if (iQ === -1 || iF === -1 || iEnd === -1) {
      console.log('[TIDAK KETEMU] Urutan tanda cabang TimeFilter di FilterBar.jsx')
    } else {
      d = d.slice(0, iF) + BUKA + d.slice(iF)
      const iEnd2 = iEnd + BUKA.length
      d = d.slice(0, iEnd2 + 2) + '\n</div>' + d.slice(iEnd2 + 2)
      const LAMA = ': <div className="flex flex-wrap items-center gap-2">'
      const BARU = ': <div key="rentang" className="anim-ganti-rentang flex flex-wrap items-center gap-2">'
      const iR = d.indexOf(LAMA, iEnd2)
      if (iR === -1) {
        console.log('[TIDAK KETEMU] Div cabang rentang waktu di FilterBar.jsx')
      } else {
        d = d.slice(0, iR) + BARU + d.slice(iR + LAMA.length)
        simpan(FILE_F, d)
        console.log('[BERHASIL] Cabang Bulan dan Rentang Waktu dibungkus div beranimasi')
      }
    }
  }
}

/* ===== 2. index.css: pastikan keyframe meluncur dua arah ada ===== */
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
console.log('Perbedaan versi ini:')
console.log('1. Tidak memakai regex panjang yang rapuh terhadap spasi akhir baris atau variasi indentasi.')
console.log('2. Pencarian dilakukan berurutan lewat jangkar kecil: awal cabang, tanda tanya, tag FilterDate bulan, penutup tag, lalu div cabang rentang.')
console.log('3. Pembungkus bulan disisipkan tepat sebelum tag FilterDate dan ditutup tepat setelah penutup tag, jadi struktur JSX tetap sah.')
console.log('4. Div cabang rentang hanya diganti kelasnya ditambah key, sehingga isi dan perilakunya tidak berubah sama sekali.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu perhatikan baris filter waktu.')
console.log('2. Klik Rentang Waktu: dua kolom tanggal dan teks sampai meluncur masuk dari kanan sambil memudar muncul.')
console.log('3. Klik Bulan kembali: pemilih bulan meluncur masuk dari kiri dengan lembut.')
console.log('4. Bolak balik cepat beberapa kali: setiap pergantian tetap halus tanpa kedip kasar.')
console.log('5. Ulangi di dashboard dan halaman publik lain: perilaku sama karena memakai komponen TimeFilter yang sama.')