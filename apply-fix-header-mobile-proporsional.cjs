const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengecilkan header halaman, teks, dan tombol agar proporsional di layar mobile...')
console.log('')

const TARGET = [
  'src/pages/HomePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/LoginPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/components/ui.jsx',
  'src/components/cards.jsx'
]

/* ===== Pola global: berlaku di semua file target ===== */
const GLOBAL = [
  ['p-8 lg:p-12', 'p-5 sm:p-8 lg:p-12'],
  ['p-8 lg:p-10', 'p-5 sm:p-8 lg:p-10'],
  ['text-3xl lg:text-5xl', 'text-2xl sm:text-3xl lg:text-5xl'],
  ['text-3xl lg:text-4xl', 'text-2xl sm:text-3xl lg:text-4xl'],
  ['text-2xl lg:text-3xl', 'text-xl sm:text-2xl lg:text-3xl'],
  ['text-2xl font-black', 'text-xl sm:text-2xl font-black'],
  ['inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide',
   'inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs'],
  ['mt-8 flex flex-wrap gap-3', 'mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3']
]

/* ===== Pola khusus per file ===== */
const SPECIFIC = {
  'src/pages/HomePage.jsx': [
    ['mt-5 max-w-2xl text-white/80 leading-relaxed', 'mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base'],
    ['px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400',
     'px-4 py-2.5 rounded-xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base'],
    ['px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20',
     'px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base'],
    ['px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100',
     'px-4 py-2.5 rounded-xl bg-white text-bsi-900 text-sm font-bold hover:bg-slate-100 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base'],
    ['rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900',
     'rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm']
  ],
  'src/pages/LogbookPage.jsx': [
    ['mt-3 text-slate-600 max-w-2xl', 'mt-2 text-sm text-slate-600 max-w-2xl sm:mt-3 sm:text-base']
  ],
  'src/pages/GalleryPage.jsx': [
    ['mt-3 text-slate-600 max-w-2xl', 'mt-2 text-sm text-slate-600 max-w-2xl sm:mt-3 sm:text-base']
  ],
  'src/pages/AttendancePage.jsx': [
    ['mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4', 'mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4']
  ],
  'src/pages/DospemPage.jsx': [
    ['mt-4 max-w-3xl text-white/80 leading-relaxed', 'mt-3 max-w-3xl text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base'],
    ['mt-1 text-3xl font-black', 'mt-1 text-2xl sm:text-3xl font-black'],
    ['mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4', 'mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4'],
    ['px-5 py-3 rounded-2xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400',
     'px-4 py-2 rounded-xl bg-gold-500 text-slate-900 text-xs font-bold hover:bg-gold-400 sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm'],
    ['px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20',
     'px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold hover:bg-white/20 sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm'],
    ['mt-2 max-w-3xl text-slate-500', 'mt-2 max-w-3xl text-sm text-slate-500 sm:text-base'],
    ['rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900',
     'rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm']
  ],
  'src/pages/LoginPage.jsx': [
    ['mt-4 text-white/80 leading-relaxed', 'mt-3 text-sm leading-relaxed text-white/80 sm:mt-4 sm:text-base']
  ],
  'src/components/ui.jsx': [
    ["cardCls + ' p-6'", "cardCls + ' p-5 sm:p-6'"],
    ['mt-2 text-3xl font-black text-bsi-900', 'mt-2 text-2xl sm:text-3xl font-black text-bsi-900']
  ]
}

for (let f = 0; f < TARGET.length; f++) {
  const rel = TARGET[f]
  if (!ada(rel)) {
    console.log('[GAGAL] ' + rel + ' tidak ditemukan')
    continue
  }
  let isi = baca(rel)
  let berubah = false
  const daftar = GLOBAL.concat(SPECIFIC[rel] || [])
  for (let i = 0; i < daftar.length; i++) {
    const lama = daftar[i][0]
    const baru = daftar[i][1]
    if (isi.indexOf(baru) !== -1) continue
    if (isi.indexOf(lama) === -1) continue
    const jumlah = isi.split(lama).length - 1
    isi = isi.split(lama).join(baru)
    berubah = true
    console.log('[BERHASIL] ' + rel + ': ' + jumlah + ' lokasi memakai pola mobile baru')
  }
  if (berubah) simpan(rel, isi)
  else console.log('[SUDAH ADA] ' + rel + ' sudah memakai ukuran proporsional mobile')
}

/* ===== Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const VERIF = [
  ['src/pages/HomePage.jsx', 'text-2xl sm:text-3xl lg:text-5xl', 'Judul hero beranda mengecil di mobile'],
  ['src/pages/HomePage.jsx', 'px-4 py-2.5 rounded-xl bg-gold-500', 'Tombol CTA hero beranda ramping di mobile'],
  ['src/pages/LogbookPage.jsx', 'p-5 sm:p-8 lg:p-10', 'Padding kartu kepala logbook rapat di mobile'],
  ['src/pages/LogbookPage.jsx', 'mt-2 text-sm text-slate-600 max-w-2xl', 'Deskripsi kepala logbook mengecil di mobile'],
  ['src/pages/GalleryPage.jsx', 'text-2xl sm:text-3xl lg:text-4xl', 'Judul kepala galeri mengecil di mobile'],
  ['src/pages/AttendancePage.jsx', 'mt-6 grid gap-3 sm:mt-8 sm:gap-4', 'Grid statistik kepala daftar hadir rapat di mobile'],
  ['src/pages/DospemPage.jsx', 'mt-1 text-2xl sm:text-3xl font-black', 'Angka statistik hero dospem mengecil di mobile'],
  ['src/pages/TimPage.jsx', 'p-5 sm:p-8 lg:p-10', 'Padding kartu kepala halaman tim rapat di mobile'],
  ['src/pages/LoginPage.jsx', 'mt-3 text-sm leading-relaxed text-white/80', 'Paragraf kartu login mengecil di mobile'],
  ['src/pages/DashboardPage.jsx', 'text-xl sm:text-2xl font-black', 'Judul form dashboard mengecil di mobile'],
  ['src/components/ui.jsx', 'mt-2 text-2xl sm:text-3xl font-black text-bsi-900', 'Angka StatCard mengecil di mobile'],
  ['src/components/cards.jsx', 'text-xl sm:text-2xl font-black', 'Judul detail modal mengecil di mobile']
]
for (let i = 0; i < VERIF.length; i++) {
  const isi = ada(VERIF[i][0]) ? baca(VERIF[i][0]) : ''
  console.log((isi.indexOf(VERIF[i][1]) !== -1 ? '[OK] ' : '[BELUM] ') + VERIF[i][2])
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian yang diterapkan:')
console.log('1. Padding kartu kepala halaman di semua rute turun dari 32px menjadi 20px di bawah 640px, lalu kembali 32px di tablet dan 40px di desktop, sehingga kartu kepala tidak lagi makan separuh layar ponsel.')
console.log('2. Judul hero (beranda dan dospem) turun dari 30px menjadi 24px di mobile, judul kepala halaman (logbook, galeri, daftar hadir, tim, login) juga 24px, dan judul seksi serta judul form turun dari 24px menjadi 20px. Di 640px ke atas semua kembali ke ukuran semula.')
console.log('3. Paragraf deskripsi kepala halaman dan paragraf putih di kartu hero serta login mengecil menjadi 14px di mobile dengan jarak atas yang dirapatkan, jadi teks pengantar tidak lagi setebal paragraf desktop.')
console.log('4. Badge penanda area (Magang Bank BSI, Monitoring Dospem, Area Intern) mengecil menjadi padding 12x6px dengan huruf 10px di mobile, kembali 16x8px dan 12px di tablet ke atas.')
console.log('5. Seluruh tombol CTA kepala halaman (Lihat Logbook, Lihat Galeri, Daftar Hadir, Buka Dashboard, tombol hero dospem, dan tombol lihat semua di bawah grid) memakai padding 16x10px dengan sudut 12px dan huruf 14px di mobile, lalu kembali ke bentuk pill besar semula di 640px ke atas. Jarak antar tombol ikut rapat dari 12px menjadi 8px di mobile.')
console.log('6. Angka statistik besar pada StatCard dan kartu statistik hero dospem turun dari 30px menjadi 24px di mobile, dan padding kartu StatCard rapat menjadi 20px, sehingga blok angka di kepala daftar hadir dan beranda tidak mendominasi.')
console.log('7. Judul di dalam modal detail (logbook, galeri, hadir) ikut mengecil di mobile supaya popup tidak terasa sesak, sedangkan isi lainnya tidak berubah.')
console.log('8. Semua perubahan murni kelas responsif Tailwind tanpa media query tambahan, jadi tidak ada CSS baru yang perlu dipelihara dan tampilan desktop benar benar tidak berubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka beranda di ponsel: kartu hero lebih ramping, judul tiga baris terasa seimbang dengan tombol CTA yang kini pill kecil satu baris tiap tombol.')
console.log('2. Buka halaman logbook dan galeri: kartu kepala hanya memakan sekitar sepertiga tinggi sebelumnya, deskripsi mengecil, dan kartu konten langsung terlihat tanpa gulir panjang.')
console.log('3. Buka daftar hadir: empat kartu statistik di kepala halaman tampil rapat dengan angka yang tidak lagi raksasa.')
console.log('4. Buka halaman dospem dan login: hero hijau serta kartu form login proporsional, badge area kecil dan rapi.')
console.log('5. Buka dashboard: judul form Tambah logbook, Galeri, dan Daftar Hadir mengecil sejajar dengan tombol tab yang sudah ramping sebelumnya.')
console.log('6. Klik Detail pada kartu logbook di ponsel: judul detail di modal tidak lagi memenuhi lebar popup.')
console.log('7. Lebarkan jendela ke 640px ke atas: seluruh ukuran, padding, dan tombol kembali persis seperti tampilan desktop sebelumnya.')