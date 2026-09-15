const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai membuat nama header dashboard satu baris dan proporsional dengan foto profil...')
console.log('')

/* ===== 1. DashboardPage.jsx: truncate pada nama dan prodi, gap mobile dirapatkan ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

const H1_LAMA = '<h1 className="text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>'
const H1_BARU = '<h1 className="truncate text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>'
if (d.includes(H1_BARU)) {
  console.log('[SUDAH ADA] Nama header memakai truncate dan ukuran responsif')
} else if (d.includes(H1_LAMA)) {
  d = d.replace(H1_LAMA, H1_BARU)
  berubahD = true
  console.log('[BERHASIL] Nama header dikunci satu baris dengan truncate dan ukuran mobile lebih kecil')
} else {
  console.log('[TIDAK KETEMU] Pola h1 nama di header dashboard')
}

const GAP_LAMA = '<div className="flex flex-wrap items-center gap-6">'
const GAP_BARU = '<div className="flex flex-wrap items-center gap-4 sm:gap-6">'
if (d.includes(GAP_BARU)) {
  console.log('[SUDAH ADA] Gap avatar dan teks responsif')
} else if (d.includes(GAP_LAMA)) {
  d = d.replace(GAP_LAMA, GAP_BARU)
  berubahD = true
  console.log('[BERHASIL] Jarak avatar dan teks dirapatkan menjadi 16px di layar sempit')
} else {
  console.log('[TIDAK KETEMU] Pola wadah flex avatar dan teks di header')
}

const PRODI_LAMA = '{mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}'
const PRODI_BARU = '{mahasiswa.prodi ? <p className="truncate text-sm text-slate-500">{mahasiswa.prodi}</p> : null}'
if (d.includes(PRODI_BARU)) {
  console.log('[SUDAH ADA] Baris prodi memakai truncate')
} else if (d.includes(PRODI_LAMA)) {
  d = d.replace(PRODI_LAMA, PRODI_BARU)
  berubahD = true
  console.log('[BERHASIL] Baris prodi dikunci satu baris dengan truncate')
} else {
  console.log('[TIDAK KETEMU] Pola baris prodi di header dashboard')
}

if (berubahD) simpan(FILE_D, d)

/* ===== 2. index.css: ukuran mobile nama diperkecil dan semua baris teks dikunci satu baris ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
let berubahC = false

const H1_CSS_LAMA = '.avatar-kepala-dash ~ div h1 { font-size: 1.25rem !important; line-height: 1.75rem !important; }'
const H1_CSS_BARU = '.avatar-kepala-dash ~ div h1 { font-size: 1.125rem !important; line-height: 1.625rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }'
const P_CSS_LAMA = '.avatar-kepala-dash ~ div p { font-size: 0.75rem !important; }'
const P_CSS_BARU = '.avatar-kepala-dash ~ div p { font-size: 0.75rem !important; white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important; }'

if (css.includes(H1_CSS_BARU)) {
  console.log('[SUDAH ADA] Aturan nama satu baris di index.css')
} else if (css.includes(H1_CSS_LAMA)) {
  css = css.replace(H1_CSS_LAMA, H1_CSS_BARU)
  berubahC = true
  console.log('[BERHASIL] Aturan nama mobile diperkecil menjadi 18px dan dikunci satu baris')
} else {
  css = css.trimEnd() + '\n\n/* nama-satu-baris-v1: teks header dashboard satu baris proporsional di layar sempit */\n@media (max-width: 639px) {\n  ' + H1_CSS_BARU + '\n  ' + P_CSS_BARU + '\n}\n'
  berubahC = true
  console.log('[BERHASIL] Blok nama-satu-baris-v1 ditambahkan (aturan lama tidak ditemukan)')
}

if (css.includes(P_CSS_BARU)) {
  console.log('[SUDAH ADA] Aturan NIM dan prodi satu baris')
} else if (css.includes(P_CSS_LAMA)) {
  css = css.replace(P_CSS_LAMA, P_CSS_BARU)
  berubahC = true
  console.log('[BERHASIL] Baris NIM dan prodi dikunci satu baris dengan ellipsis')
} else {
  console.log('[INFO] Aturan p lama tidak ditemukan, lewati (sudah tercakup blok baru bila dipasang)')
}

if (berubahC) simpan(FILE_CSS, css)

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const d2 = baca(FILE_D)
const c2 = baca(FILE_CSS)
console.log((d2.includes(H1_BARU) ? '[OK] ' : '[BELUM] ') + 'Nama header memakai truncate dan ukuran responsif')
console.log((d2.includes(GAP_BARU) ? '[OK] ' : '[BELUM] ') + 'Jarak avatar dan teks responsif di mobile')
console.log((d2.includes(PRODI_BARU) ? '[OK] ' : '[BELUM] ') + 'Baris prodi memakai truncate')
console.log((c2.includes(H1_CSS_BARU) ? '[OK] ' : '[BELUM] ') + 'CSS nama satu baris 18px terpasang')
console.log((c2.includes(P_CSS_BARU) ? '[OK] ' : '[BELUM] ') + 'CSS NIM dan prodi satu baris terpasang')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab dan cara kerja perbaikan:')
console.log('1. Nama melipat dua baris karena h1 tidak punya aturan pemenggalan, sehingga berapa pun panjang nama akan membungkus, dan ukuran 20px sisa aturan sebelumnya masih terlalu besar untuk ruang di samping foto 56px.')
console.log('2. Kini h1 memakai kelas truncate yaitu gabungan white-space nowrap, overflow hidden, dan text-overflow ellipsis, jadi nama selalu satu baris; nama yang sangat panjang berakhir dengan titik tiga yang rapi, dan nama lengkapnya tetap bisa dibaca utuh di tab Profil.')
console.log('3. Ukuran huruf nama di mobile diturunkan menjadi 18px lewat kelas text-lg dan aturan CSS 1.125rem, sehingga satu baris nama plus baris NIM dan prodi membentuk blok teks setinggi kurang lebih 56px, persis menyamai tinggi foto profil di sampingnya.')
console.log('4. Jarak antara foto dan blok teks dirapatkan dari 24px menjadi 16px khusus di bawah 640px, memberi ruang ekstra bagi nama agar tidak cepat terpotong ellipsis.')
console.log('5. Baris NIM dan prodi ikut dikunci satu baris dengan ellipsis supaya tinggi blok teks terkendali dan header terlihat ringkas sejajar dengan foto.')
console.log('6. Wadah teks sudah punya min-w-0 flex-1 sejak awal, jadi truncate bekerja benar di dalam flex dan tidak memaksa kartu melebar keluar layar.')
console.log('7. Di 640px ke atas seluruh ukuran kembali ke text-2xl dan gap-6, dan di 1024px ke atas kembali ke text-3xl, sehingga tampilan tablet dan desktop identik seperti sebelumnya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard di ponsel: nama tampil satu baris sejajar dengan foto 56px, diikuti NIM dan prodi masing masing satu baris.')
console.log('2. Uji dengan akun bernama sangat panjang: nama terpotong rapi dengan titik tiga di ujung, tidak lagi turun ke baris kedua.')
console.log('3. Buka tab Profil: nama lengkap tetap terbaca utuh tanpa pemotongan karena halaman profil tidak memakai truncate.')
console.log('4. Lebarkan jendela ke tablet dan desktop: nama kembali besar dua ukuran di atasnya dan tata letak header tidak berubah.')
console.log('5. Aktifkan mode gelap: warna teks menyesuaikan seperti biasa karena hanya kelas ukuran dan pemenggalan yang berubah.')