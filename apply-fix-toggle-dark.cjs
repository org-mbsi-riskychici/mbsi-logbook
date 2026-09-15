const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki warna tombol Foto dan Video pada mode gelap...')
console.log('')

const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = baca(FILE_D)
const LAMA = 'bg-slate-200 text-slate-600'
const BARU = 'bg-slate-200 text-slate-600 dark:bg-slate-700'

const sudah = d.split(BARU).length - 1
if (sudah >= 4) {
  console.log('[SUDAH ADA] Kelas dark:bg-slate-700 sudah terpasang di ' + sudah + ' tombol')
} else {
  const jumlah = d.split(LAMA).length - 1
  if (jumlah > 0) {
    d = d.split(LAMA).join(BARU)
    simpan(FILE_D, d)
    console.log('[BERHASIL] ' + jumlah + ' tombol Foto dan Video diberi kelas dark:bg-slate-700')
  } else {
    console.log('[TIDAK KETEMU] Pola kelas bg-slate-200 text-slate-600 di DashboardPage.jsx')
  }
}

const v = baca(FILE_D)
const total = v.split(BARU).length - 1
console.log('')
console.log('Verifikasi:')
console.log((total >= 4 ? '[OK] ' : '[BELUM] ') + 'Empat tombol mode memakai latar gelap (' + total + ' tombol terpasang)')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Masalah: tombol tidak aktif memakai kelas bg-slate-200 yang tidak punya aturan pengganti di index.css, sehingga pada mode gelap pill tetap abu terang hampir putih dan menonjol sendiri.')
console.log('2. Perbaikan: menambahkan varian dark:bg-slate-700 langsung pada kelas tombol, jadi pada mode gelap pill menjadi abu gelap yang menyatu dengan kartu, sementara mode terang tetap seperti semula.')
console.log('3. Varian dark dipilih bukan aturan CSS global .dark .bg-slate-200 supaya garis timeline di cards.jsx yang sengaja memadukan bg-slate-200 dengan dark:bg-slate-700 tidak ikut tertimpa.')
console.log('4. Teks tombol tidak perlu diubah karena index.css sudah mengganti text-slate-600 menjadi abu terang pada mode gelap, sehingga kontrasnya tetap terbaca di atas pill gelap.')
console.log('5. Tombol aktif tidak disentuh karena kombinasi bg-bsi-800 sudah otomatis menjadi hijau tua pada mode gelap dan terlihat benar.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard pada mode gelap lalu lihat tombol Foto dan Video di form logbook maupun form galeri.')
console.log('2. Tombol tidak aktif kini berwarna abu gelap, bukan putih terang, dan teksnya tetap terbaca.')
console.log('3. Klik bergantian Foto dan Video: tombol aktif tetap hijau di kedua mode.')
console.log('4. Kembali ke mode terang: tampilan tombol tidak berubah seperti sebelumnya.')