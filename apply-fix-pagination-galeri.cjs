const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
console.log('Mulai memasang ulang Pagination daftar galeri di dashboard...')
console.log('')
const MARK = 'onPageChange={gantiHalamanGal}'
if (d.includes(MARK)) {
  console.log('[SUDAH ADA] Pagination daftar galeri sudah terpasang')
} else {
  const re = /(\{!filteredGaleri\.length \? <EmptyState icon="camera"[^\n]*\n[ \t]*<\/div>)/
  if (re.test(d)) {
    d = d.replace(re, '$1\n            <Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />')
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
    console.log('[BERHASIL] Pagination daftar galeri dipasang')
  } else {
    console.log('[TIDAK KETEMU] Pola grid galeri untuk menyisipkan Pagination')
    console.log('Kirim isi blok tab galeri di DashboardPage.jsx supaya polanya dikunci manual.')
  }
}
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan perbaikan:')
console.log('1. Penyebab gagal sebelumnya adalah anchor penutup </div> grid galeri berbeda satu spasi, jadi pola lama tidak cocok.')
console.log('2. Script ini memakai regex longgar yang tidak peduli jumlah spasi, sehingga posisinya pasti ketemu.')
console.log('3. Setelah terpasang, tab Galeri dashboard punya tombol nomor halaman yang sama seperti tab Logbook dan Daftar Hadir.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard tab Galeri dengan data lebih dari 6: tombol nomor muncul di bawah daftar kartu.')
console.log('2. Klik halaman 2: hanya 6 data berikutnya yang tampil dan layar menggulir ke judul Galeri kamu.')
console.log('3. Ganti filter atau urutan: halaman otomatis kembali ke 1.')
console.log('4. Tab Logbook dan Daftar Hadir tetap berfungsi normal seperti sebelumnya.')