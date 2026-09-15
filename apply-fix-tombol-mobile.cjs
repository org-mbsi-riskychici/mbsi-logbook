const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengecilkan tombol-tombol agar proporsional di layar mobile...')
console.log('')

/* ===== 1. DashboardPage.jsx: tombol tab navigasi ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

const TAB_LAMA = "return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')"
const TAB_BARU = "return 'px-4 py-2.5 rounded-xl text-xs sm:px-5 sm:py-3 sm:rounded-2xl sm:text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')"
if (d.includes(TAB_BARU)) {
  console.log('[SUDAH ADA] Tombol tab versi mobile')
} else if (d.includes(TAB_LAMA)) {
  d = d.replace(TAB_LAMA, TAB_BARU)
  berubahD = true
  console.log('[BERHASIL] Tombol tab navigasi mengecil di mobile dan tetap besar di desktop')
} else {
  console.log('[TIDAK KETEMU] Pola tabCls di DashboardPage.jsx')
}

/* ===== 2. DashboardPage.jsx: empat tombol kelola foto profil ===== */
const FOTO_LAMA = 'px-4 py-2 rounded-xl text-sm font-bold '
const FOTO_BARU = 'px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-bold '
if (d.includes(FOTO_BARU)) {
  console.log('[SUDAH ADA] Tombol kelola foto versi mobile')
} else if (d.includes(FOTO_LAMA)) {
  const jumlah = d.split(FOTO_LAMA).length - 1
  d = d.split(FOTO_LAMA).join(FOTO_BARU)
  berubahD = true
  console.log('[BERHASIL] ' + jumlah + ' tombol kelola foto profil dirapatkan untuk mobile')
} else {
  console.log('[TIDAK KETEMU] Pola tombol kelola foto profil')
}

if (berubahD) simpan(FILE_D, d)

/* ===== 3. ui.jsx: btnPrimary dan btnSmall responsif ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
let berubahU = false

const PRIM_LAMA = "export const btnPrimary = 'w-full rounded-2xl bg-bsi-800 px-6 py-4 text-white font-bold hover:bg-bsi-900'"
const PRIM_BARU = "export const btnPrimary = 'w-full rounded-xl bg-bsi-800 px-5 py-3 text-sm sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base text-white font-bold hover:bg-bsi-900'"
if (u.includes(PRIM_BARU)) {
  console.log('[SUDAH ADA] btnPrimary versi mobile')
} else if (u.includes(PRIM_LAMA)) {
  u = u.replace(PRIM_LAMA, PRIM_BARU)
  berubahU = true
  console.log('[BERHASIL] btnPrimary (tombol simpan) lebih ramping di mobile')
} else {
  console.log('[TIDAK KETEMU] Pola btnPrimary di ui.jsx')
}

const SMALL_LAMA = "export const btnSmall = 'px-4 py-2 rounded-xl text-sm font-semibold'"
const SMALL_BARU = "export const btnSmall = 'px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-semibold'"
if (u.includes(SMALL_BARU)) {
  console.log('[SUDAH ADA] btnSmall versi mobile')
} else if (u.includes(SMALL_LAMA)) {
  u = u.replace(SMALL_LAMA, SMALL_BARU)
  berubahU = true
  console.log('[BERHASIL] btnSmall (Detail, Edit, Hapus, Tambah kegiatan) lebih ramping di mobile')
} else {
  console.log('[TIDAK KETEMU] Pola btnSmall di ui.jsx')
}

if (berubahU) simpan(FILE_U, u)

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const d2 = baca(FILE_D)
const u2 = baca(FILE_U)
console.log((d2.includes(TAB_BARU) ? '[OK] ' : '[BELUM] ') + 'Tombol tab navigasi responsif')
console.log((d2.split(FOTO_BARU).length - 1 >= 4 ? '[OK] ' : '[BELUM] ') + 'Empat tombol kelola foto profil responsif (' + (d2.split(FOTO_BARU).length - 1) + ' lokasi)')
console.log((u2.includes(PRIM_BARU) ? '[OK] ' : '[BELUM] ') + 'btnPrimary responsif')
console.log((u2.includes(SMALL_BARU) ? '[OK] ' : '[BELUM] ') + 'btnSmall responsif')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian yang diterapkan:')
console.log('1. Tombol tab Logbook, Galeri, Daftar Hadir, dan Profil kini memakai padding 16x10 piksel, sudut 12 piksel, dan huruf 12 piksel di bawah 640px, sehingga baris tab tidak lagi mendominasi kartu header. Di 640px ke atas kembali ke padding 20x12, sudut 16, dan huruf 14 seperti semula.')
console.log('2. Tombol simpan utama (btnPrimary) di semua form termasuk halaman login menjadi py-3 dengan huruf 14 piksel dan sudut 12 piksel di mobile, lalu kembali py-4 huruf 16 sudut 16 di layar lebar, jadi tidak lagi setebbal balok di ponsel.')
console.log('3. Tombol aksi kecil (btnSmall) yaitu Detail, Edit, Hapus, dan tambah kegiatan menjadi px-3.5 py-2 huruf 12 sudut 8 di mobile, membuat deretan aksi di kartu dan baris rincian kegiatan terasa ringan dan tidak berdesakan.')
console.log('4. Empat tombol kelola foto profil (Ganti atau Upload Foto, Hapus Foto, Simpan Foto, Batal) mengikuti ukuran kecil yang sama di mobile sehingga panel profil tidak penuh oleh tombol.')
console.log('5. Seluruh perubahan memakai pola kelas responsif Tailwind sm:, jadi tidak ada JavaScript maupun media query tambahan yang perlu dipelihara, dan tampilan desktop benar benar tidak berubah.')
console.log('6. Tinggi sentuh minimum di mobile tetap sekitar 32 sampai 36 piksel, masih nyaman untuk jari meski visualnya jauh lebih ramping.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard di ponsel: baris tab kini berupa pill ramping satu atau dua baris yang seimbang dengan kartu header, tidak lagi setinggi sebelumnya.')
console.log('2. Gulir ke form logbook: tombol Simpan logbook dan tombol tambah kegiatan terlihat lebih halus, dan tombol Detail Edit Hapus pada kartu tidak lagi bongsor.')
console.log('3. Buka tab Profil: tombol Ganti Foto dan Hapus Foto proporsional dengan kartu profil yang sudah dikecilkan sebelumnya.')
console.log('4. Buka halaman login di ponsel: tombol Masuk ke dashboard ikut ramping dan serasi dengan form.')
console.log('5. Lebarkan jendela ke 640px ke atas: seluruh tombol kembali ke ukuran desktop semula tanpa perubahan apa pun.')