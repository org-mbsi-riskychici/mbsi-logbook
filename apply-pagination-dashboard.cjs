const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

function tempel(cari, ekor, marker, label) {
  let isi = baca(FILE_D)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  const cocok = (cari instanceof RegExp) ? cari.test(isi) : isi.includes(cari)
  if (!cocok) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, function (m) { return m + ekor })
  simpan(FILE_D, isi)
  console.log('[BERHASIL] ' + label)
}

function ganti(cari, gantiDengan, marker, label) {
  let isi = baca(FILE_D)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE_D, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang pagination 6 data per index di dashboard...')
console.log('')

/* ===== 1. Import useRef dan komponen Pagination ===== */
ganti(
  "import { useEffect, useState } from 'react'",
  "import { useEffect, useRef, useState } from 'react'",
  'useRef',
  'Import useRef ditambahkan'
)
ganti(
  "import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'",
  "import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination } from '../components/ui.jsx'",
  'AutoTextArea, Pagination',
  'Import Pagination ditambahkan'
)

/* ===== 2. Konstanta jumlah data per halaman ===== */
tempel(
  "const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  '\nconst PER_PAGE_DASH = 6',
  'const PER_PAGE_DASH = 6',
  'Konstanta PER_PAGE_DASH = 6'
)

/* ===== 3. State halaman dan ref judul daftar ===== */
tempel(
  'const [sort, setSort] = useState(\'terbaru\')',
  '\n   const [logPage, setLogPage] = useState(1)\n   const [galPage, setGalPage] = useState(1)\n   const [hadirPage, setHadirPage] = useState(1)\n   const refListLog = useRef(null)\n   const refListGal = useRef(null)\n   const refListHadir = useRef(null)',
  'const [logPage, setLogPage] = useState(1)',
  'State halaman dan ref daftar'
)

/* ===== 4. Reset halaman saat filter atau urutan berubah ===== */
tempel(
  '}, [mahasiswa])',
  '\n\n   useEffect(function () {\n     setLogPage(1)\n     setGalPage(1)\n     setHadirPage(1)\n   }, [logFilter, galFilter, hadirFilter, sort])',
  '}, [logFilter, galFilter, hadirFilter, sort])',
  'Effect reset halaman saat filter berubah'
)

/* ===== 5. Perhitungan pagination dan fungsi pindah halaman ===== */
tempel(
  'const hadirFilterActive = countActiveFilters(hadirFilter)',
  '\n   const logTotal = filteredLogs.length\n' +
  '   const logTotalPages = Math.max(1, Math.ceil(logTotal / PER_PAGE_DASH))\n' +
  '   const logPageAman = Math.min(logPage, logTotalPages)\n' +
  '   const paginatedLogs = sortedLogs.slice((logPageAman - 1) * PER_PAGE_DASH, logPageAman * PER_PAGE_DASH)\n' +
  '   const galTotal = filteredGaleri.length\n' +
  '   const galTotalPages = Math.max(1, Math.ceil(galTotal / PER_PAGE_DASH))\n' +
  '   const galPageAman = Math.min(galPage, galTotalPages)\n' +
  '   const paginatedGaleri = sortedGaleri.slice((galPageAman - 1) * PER_PAGE_DASH, galPageAman * PER_PAGE_DASH)\n' +
  '   const hadirTotal = filteredHadir.length\n' +
  '   const hadirTotalPages = Math.max(1, Math.ceil(hadirTotal / PER_PAGE_DASH))\n' +
  '   const hadirPageAman = Math.min(hadirPage, hadirTotalPages)\n' +
  '   const paginatedHadir = sortedHadir.slice((hadirPageAman - 1) * PER_PAGE_DASH, hadirPageAman * PER_PAGE_DASH)\n' +
  '   function gantiHalamanLog(p) {\n     setLogPage(p)\n     if (refListLog.current) refListLog.current.scrollIntoView({ behavior: \'smooth\', block: \'start\' })\n   }\n' +
  '   function gantiHalamanGal(p) {\n     setGalPage(p)\n     if (refListGal.current) refListGal.current.scrollIntoView({ behavior: \'smooth\', block: \'start\' })\n   }\n' +
  '   function gantiHalamanHadir(p) {\n     setHadirPage(p)\n     if (refListHadir.current) refListHadir.current.scrollIntoView({ behavior: \'smooth\', block: \'start\' })\n   }',
  'const paginatedLogs = sortedLogs.slice(',
  'Perhitungan pagination dan fungsi pindah halaman'
)

/* ===== 6. Setelah menambah data baru, kembali ke halaman 1 ===== */
tempel(
  /async function submitLogbook\(e\) \{\s*\n\s*e\.preventDefault\(\)\s*\n\s*setBusy\(true\)/,
  '\n     const menambahLog = !editLogId',
  'const menambahLog = !editLogId',
  'Penanda tambah logbook baru'
)
tempel(
  /setItems\(\[newItem\(\)\]\)\s*\n\s*await refresh\(\)/,
  '\n       if (menambahLog) setLogPage(1)',
  'if (menambahLog) setLogPage(1)',
  'Reset halaman logbook setelah tambah baru'
)
tempel(
  /async function submitGaleri\(e\) \{\s*\n\s*e\.preventDefault\(\)\s*\n\s*setBusy\(true\)/,
  '\n     const menambahGal = !editGalId',
  'const menambahGal = !editGalId',
  'Penanda tambah galeri baru'
)
tempel(
  /setGalOldYt\(null\)\s*\n\s*await refresh\(\)/,
  '\n       if (menambahGal) setGalPage(1)',
  'if (menambahGal) setGalPage(1)',
  'Reset halaman galeri setelah tambah baru'
)
tempel(
  /async function submitHadir\(e\) \{\s*\n\s*e\.preventDefault\(\)\s*\n\s*setBusy\(true\)/,
  '\n     const menambahHadir = !editHadirId',
  'const menambahHadir = !editHadirId',
  'Penanda tambah hadir baru'
)
tempel(
  /setHadirForm\(\{ tanggal: todayInput\(\), status: 'Masuk', alasan: '' \}\)\s*\n\s*await refresh\(\)/,
  '\n     if (menambahHadir) setHadirPage(1)',
  'if (menambahHadir) setHadirPage(1)',
  'Reset halaman hadir setelah tambah baru'
)

/* ===== 7. Tab Logbook: judul, info, sumber data, dan Pagination ===== */
ganti(
  '<h2 className="text-2xl font-black text-slate-900">Logbook kamu</h2>',
  '<h2 ref={refListLog} className="text-2xl font-black text-slate-900 scroll-mt-24">Logbook kamu</h2>',
  'ref={refListLog}',
  'Ref judul daftar logbook'
)
ganti(
  '<p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logbook</p>',
  '<p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logbook{logTotalPages > 1 ? \' • Halaman \' + logPageAman + \' dari \' + logTotalPages : \'\'}</p>',
  "' • Halaman ' + logPageAman",
  'Info halaman daftar logbook'
)
ganti(
  '{sortedLogs.map(function (l) {',
  '{paginatedLogs.map(function (l) {',
  '{paginatedLogs.map(function (l) {',
  'Daftar logbook memakai potongan halaman'
)
tempel(
  "{!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}",
  '\n             <Pagination totalItems={logTotal} perPage={PER_PAGE_DASH} page={logPageAman} onPageChange={gantiHalamanLog} />',
  'onPageChange={gantiHalamanLog}',
  'Pagination daftar logbook'
)

/* ===== 8. Tab Galeri: judul, info, sumber data, dan Pagination ===== */
ganti(
  '<h2 className="text-2xl font-black text-slate-900">Galeri kamu</h2>',
  '<h2 ref={refListGal} className="text-2xl font-black text-slate-900 scroll-mt-24">Galeri kamu</h2>',
  'ref={refListGal}',
  'Ref judul daftar galeri'
)
ganti(
  '<p className="text-sm text-slate-500">Menampilkan {filteredGaleri.length} dari {galeri.length} media</p>',
  '<p className="text-sm text-slate-500">Menampilkan {filteredGaleri.length} dari {galeri.length} media{galTotalPages > 1 ? \' • Halaman \' + galPageAman + \' dari \' + galTotalPages : \'\'}</p>',
  "' • Halaman ' + galPageAman",
  'Info halaman daftar galeri'
)
ganti(
  '{sortedGaleri.map(function (g) {',
  '{paginatedGaleri.map(function (g) {',
  '{paginatedGaleri.map(function (g) {',
  'Daftar galeri memakai potongan halaman'
)
tempel(
  "{!filteredGaleri.length ? <EmptyState icon=\"camera\" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}\n             </div>",
  '\n             <Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />',
  'onPageChange={gantiHalamanGal}',
  'Pagination daftar galeri'
)

/* ===== 9. Tab Daftar Hadir: judul, info, sumber data, dan Pagination ===== */
ganti(
  '<h2 className="text-2xl font-black text-slate-900">Daftar hadir kamu</h2>',
  '<h2 ref={refListHadir} className="text-2xl font-black text-slate-900 scroll-mt-24">Daftar hadir kamu</h2>',
  'ref={refListHadir}',
  'Ref judul daftar hadir'
)
ganti(
  '<p className="text-sm text-slate-500">Menampilkan {filteredHadir.length} dari {hadir.length} catatan</p>',
  '<p className="text-sm text-slate-500">Menampilkan {filteredHadir.length} dari {hadir.length} catatan{hadirTotalPages > 1 ? \' • Halaman \' + hadirPageAman + \' dari \' + hadirTotalPages : \'\'}</p>',
  "' • Halaman ' + hadirPageAman",
  'Info halaman daftar hadir'
)
ganti(
  '{sortedHadir.map(function (h) {',
  '{paginatedHadir.map(function (h) {',
  '{paginatedHadir.map(function (h) {',
  'Daftar hadir memakai potongan halaman'
)
tempel(
  "{!filteredHadir.length ? <EmptyState icon=\"clipboard\" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}",
  '\n             <Pagination totalItems={hadirTotal} perPage={PER_PAGE_DASH} page={hadirPageAman} onPageChange={gantiHalamanHadir} />',
  'onPageChange={gantiHalamanHadir}',
  'Pagination daftar hadir'
)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru di dashboard:')
console.log('1. Daftar Logbook, Galeri, dan Daftar Hadir di kolom kanan masing-masing menampilkan maksimal 6 data per halaman.')
console.log('2. Tombol pagination memakai komponen yang sama dengan halaman publik, jadi gaya hijau BSI tetap konsisten.')
console.log('3. Teks info kini menambahkan keterangan halaman hanya bila halamannya lebih dari satu, misalnya Menampilkan 8 dari 8 logbook • Halaman 2 dari 2.')
console.log('4. Ganti filter atau urutan otomatis kembali ke halaman 1 supaya hasil filter selalu terlihat dari awal.')
console.log('5. Setelah menambah data baru, halaman kembali ke 1 sehingga data yang baru disimpan langsung terlihat.')
console.log('6. Setelah menghapus data sampai halaman terakhir kosong, tampilan otomatis dijepit ke halaman yang masih berisi.')
console.log('7. Klik nomor halaman membuat tampilan menggulir halus ke judul daftar, bukan terpaku di posisi bawah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard tab Logbook: bila data lebih dari 6, tombol nomor muncul di bawah daftar kartu.')
console.log('2. Klik halaman 2: hanya 6 data berikutnya yang tampil dan layar menggulir ke judul Logbook kamu.')
console.log('3. Ulangi pengecekan di tab Galeri dan Daftar Hadir.')
console.log('4. Tambah logbook baru saat berada di halaman 2: setelah tersimpan, tampilan kembali ke halaman 1 dan data baru terlihat.')
console.log('5. Hapus data sampai tersisa 6 atau kurang: tombol pagination hilang dengan rapi karena hanya ada satu halaman.')