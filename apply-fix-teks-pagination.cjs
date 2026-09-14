const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }
function ganti(rel, cari, gantiDengan, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai mengganti teks info pagination ke Opsi 2 (Total X • Halaman A dari B)...')
console.log('')

/* ===== 1. Halaman publik: Logbook, Galeri, Daftar Hadir ===== */
ganti('src/pages/LogbookPage.jsx',
  `Halaman {pageAman} dari {totalPages} • {totalData} logbook`,
  `Total {totalData} logbook{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}`,
  'Teks info LogbookPage')
ganti('src/pages/GalleryPage.jsx',
  `Halaman {pageAman} dari {totalPages} • {totalData} media`,
  `Total {totalData} media{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}`,
  'Teks info GalleryPage')
ganti('src/pages/AttendancePage.jsx',
  `Halaman {pageAman} dari {totalPages} • {totalData} catatan`,
  `Total {totalData} catatan{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}`,
  'Teks info AttendancePage')

/* ===== 2. Dashboard: tab Logbook, Galeri, Daftar Hadir ===== */
ganti('src/pages/DashboardPage.jsx',
  `Menampilkan {filteredLogs.length} dari {logs.length} logbook{logTotalPages > 1 ? ' • Halaman ' + logPageAman + ' dari ' + logTotalPages : ''}`,
  `Total {filteredLogs.length} logbook{logTotalPages > 1 ? ' • Halaman ' + logPageAman + ' dari ' + logTotalPages : ''}`,
  'Teks info tab Logbook dashboard')
ganti('src/pages/DashboardPage.jsx',
  `Menampilkan {filteredGaleri.length} dari {galeri.length} media{galTotalPages > 1 ? ' • Halaman ' + galPageAman + ' dari ' + galTotalPages : ''}`,
  `Total {filteredGaleri.length} media{galTotalPages > 1 ? ' • Halaman ' + galPageAman + ' dari ' + galTotalPages : ''}`,
  'Teks info tab Galeri dashboard')
ganti('src/pages/DashboardPage.jsx',
  `Menampilkan {filteredHadir.length} dari {hadir.length} catatan{hadirTotalPages > 1 ? ' • Halaman ' + hadirPageAman + ' dari ' + hadirTotalPages : ''}`,
  `Total {filteredHadir.length} catatan{hadirTotalPages > 1 ? ' • Halaman ' + hadirPageAman + ' dari ' + hadirTotalPages : ''}`,
  'Teks info tab Daftar Hadir dashboard')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Format teks baru (Opsi 2):')
console.log('1. Bila halaman lebih dari satu: Total 25 logbook • Halaman 1 dari 3.')
console.log('2. Bila hanya satu halaman: Total 7 logbook (tanpa keterangan halaman supaya tidak redundan).')
console.log('3. Angka total merujuk jumlah data sesuai filter aktif, bukan jumlah kartu yang tampil di halaman tersebut, sehingga tidak lagi membingungkan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard tab Logbook dengan 7 data: teks berbunyi Total 7 logbook • Halaman 1 dari 2.')
console.log('2. Klik tombol halaman 2: teks berubah menjadi Total 7 logbook • Halaman 2 dari 2.')
console.log('3. Aktifkan filter sehingga hasil kurang dari 6: teks cukup Total X logbook tanpa keterangan halaman.')
console.log('4. Ulangi pengecekan di tab Galeri, Daftar Hadir, serta halaman publik Logbook, Galeri, dan Daftar Hadir.')