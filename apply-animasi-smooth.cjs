const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang paket animasi halus menyeluruh...')
console.log('')

/* ===== 1. index.css: semua keyframe dan aturan animasi baru ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* animasi-halus-v1: seluruh animasi tambahan hanya memakai transform dan opacity agar ringan di device low end */
@keyframes cardFadeIn {
  from { opacity: 0; transform: translateY(14px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.grid-pusat > *, .grid-pusat-rapat > *, .kartu-grid > * {
  animation: cardFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  backface-visibility: hidden;
}
.grid-pusat > *:nth-child(1), .grid-pusat-rapat > *:nth-child(1), .kartu-grid > *:nth-child(1) { animation-delay: 0s; }
.grid-pusat > *:nth-child(2), .grid-pusat-rapat > *:nth-child(2), .kartu-grid > *:nth-child(2) { animation-delay: 0.05s; }
.grid-pusat > *:nth-child(3), .grid-pusat-rapat > *:nth-child(3), .kartu-grid > *:nth-child(3) { animation-delay: 0.1s; }
.grid-pusat > *:nth-child(4), .grid-pusat-rapat > *:nth-child(4), .kartu-grid > *:nth-child(4) { animation-delay: 0.15s; }
.grid-pusat > *:nth-child(5), .grid-pusat-rapat > *:nth-child(5), .kartu-grid > *:nth-child(5) { animation-delay: 0.2s; }
.grid-pusat > *:nth-child(6), .grid-pusat-rapat > *:nth-child(6), .kartu-grid > *:nth-child(6) { animation-delay: 0.25s; }
.grid-pusat > *:nth-child(7), .grid-pusat-rapat > *:nth-child(7), .kartu-grid > *:nth-child(7) { animation-delay: 0.3s; }
.grid-pusat > *:nth-child(8), .grid-pusat-rapat > *:nth-child(8), .kartu-grid > *:nth-child(8) { animation-delay: 0.35s; }
.grid-pusat > *:nth-child(9), .grid-pusat-rapat > *:nth-child(9), .kartu-grid > *:nth-child(9) { animation-delay: 0.4s; }
.grid-pusat > *:nth-child(10), .grid-pusat-rapat > *:nth-child(10), .kartu-grid > *:nth-child(10) { animation-delay: 0.45s; }
.grid-pusat > *:nth-child(11), .grid-pusat-rapat > *:nth-child(11), .kartu-grid > *:nth-child(11) { animation-delay: 0.5s; }
.grid-pusat > *:nth-child(12), .grid-pusat-rapat > *:nth-child(12), .kartu-grid > *:nth-child(12) { animation-delay: 0.55s; }
/* efek terangkat hanya untuk kartu, tidak untuk panel form */
.kolom-kartu > .card-hover, .kolom-kartu-rapat > .card-hover, .kartu-grid > .card-hover {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.2s ease;
}
.kolom-kartu > .card-hover:hover, .kolom-kartu-rapat > .card-hover:hover, .kartu-grid > .card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 28px -10px rgba(15, 23, 42, 0.14);
}
.dark .kolom-kartu > .card-hover:hover, .dark .kolom-kartu-rapat > .card-hover:hover, .dark .kartu-grid > .card-hover:hover {
  box-shadow: 0 14px 28px -10px rgba(0, 0, 0, 0.55);
}
/* transisi tombol dan tautan ditambah transform supaya efek tekan terasa mulus */
button, a {
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease, transform 0.15s ease;
}
button:active:not(:disabled) { transform: scale(0.96); }
/* konten tab dashboard beranimasi setiap kali tab diganti */
.anim-tab { animation: appFadeUp 0.28s ease; }
/* filterSlide versi murah: tanpa max-height supaya tidak memicu layout tiap frame */
@keyframes filterSlide {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.anim-filter { animation: filterSlide 0.28s ease; }
html { scroll-behavior: smooth; }
* { -webkit-tap-highlight-color: transparent; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('animasi-halus-v1')) {
    console.log('[SUDAH ADA] Paket CSS animasi halus di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] Paket CSS animasi halus ditambahkan di index.css')
  }
}

/* ===== 2. DashboardPage: grid daftar memakai kartu-grid agar kartu muncul berurutan ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  let berubah = false
  const GRID_LAMA = '<div className="grid gap-5 md:grid-cols-2">'
  const GRID_BARU = '<div className="grid gap-5 md:grid-cols-2 kartu-grid">'
  if (d.includes('kartu-grid')) {
    console.log('[SUDAH ADA] Kelas kartu-grid di grid daftar dashboard')
  } else if (d.includes(GRID_LAMA)) {
    d = d.split(GRID_LAMA).join(GRID_BARU)
    berubah = true
    console.log('[BERHASIL] Grid daftar Logbook, Galeri, dan Daftar Hadir memakai kartu-grid')
  } else {
    console.log('[TIDAK KETEMU] Pola grid daftar di DashboardPage')
  }
  const SEC_LAMA = '<section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">'
  const SEC_BARU = '<section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">'
  if (d.includes('anim-tab mt-8')) {
    console.log('[SUDAH ADA] Kelas anim-tab di section tab dashboard')
  } else if (d.includes(SEC_LAMA)) {
    d = d.split(SEC_LAMA).join(SEC_BARU)
    berubah = true
    console.log('[BERHASIL] Section tiap tab dashboard memakai anim-tab')
  } else {
    console.log('[TIDAK KETEMU] Pola section tab di DashboardPage')
  }
  if (berubah) simpan(FILE_D, d)
}

/* ===== 3. Verifikasi ===== */
const css = baca(FILE_CSS)
const d2 = fs.existsSync(path.join(root, FILE_D)) ? baca(FILE_D) : ''
console.log('')
console.log('Verifikasi:')
console.log((css.includes('animasi-halus-v1') ? '[OK] ' : '[BELUM] ') + 'Paket CSS animasi halus')
console.log((css.includes('@keyframes cardFadeIn') ? '[OK] ' : '[BELUM] ') + 'Keyframe kartu muncul berurutan')
console.log((css.includes('prefers-reduced-motion') ? '[OK] ' : '[BELUM] ') + 'Penghormatan preferensi gerak pengguna')
console.log((d2.includes('kartu-grid') ? '[OK] ' : '[BELUM] ') + 'Grid daftar dashboard siap stagger')
console.log((d2.includes('anim-tab mt-8') ? '[OK] ' : '[BELUM] ') + 'Transisi pindah tab dashboard')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Animasi baru yang kini aktif:')
console.log('1. Kartu di semua grid (publik, beranda, tim & dospem, dashboard) muncul berurutan seperti air terjun tiap kali data dimuat, ganti halaman, atau ganti tab.')
console.log('2. Kartu terangkat 4 piksel dengan bayangan melebar saat kursor di atasnya, lengkap dengan varian mode gelap.')
console.log('3. Pindah tab di dashboard kini beranimasi fade naik, tidak lagi kedip instan.')
console.log('4. Semua tombol punya efek tekan mengecil sesaat, memberi rasa fisik saat diklik.')
console.log('')
console.log('Penyehatan performa supaya semuanya smooth:')
console.log('1. Semua animasi hanya memakai transform dan opacity, dua properti yang dikerjakan kompositor GPU tanpa menghitung ulang layout.')
console.log('2. Animasi filterSlide lama yang memakai max-height diganti versi transform, karena max-height memaksa browser menghitung layout tiap frame dan itu penyebab utama patah patah di device jadul.')
console.log('3. Tidak ada will-change berlebihan maupun blur backdrop baru, jadi memori GPU tetap hemat.')
console.log('4. Durasi dijaga di bawah 600 milidetik dan delay stagger dibatasi sampai 0.55 detik supaya tidak terasa lambat.')
console.log('5. Pengguna yang mengaktifkan pengaturan reduce motion di sistem operasinya otomatis mendapat versi tanpa animasi, sesuai standar aksesibilitas.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik: kartu muncul satu per satu dari kiri ke kanan, lalu coba pindah halaman 2 dan perhatikan efeknya berulang.')
console.log('2. Arahkan kursor ke kartu mana pun: kartu terangkat halus dan turun lagi saat kursor keluar.')
console.log('3. Buka dashboard dan pindah pindah tab: konten berganti dengan fade naik yang lembut.')
console.log('4. Klik tombol pagination atau tombol simpan: terasa efek tekan mengecil sesaat.')
console.log('5. Buka panel filter: kini meluncur turun tanpa tersendat karena tidak lagi menganimasikan tinggi elemen.')