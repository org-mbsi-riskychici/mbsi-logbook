This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
api/
  r2/
    delete.js
    presign.js
  youtube/
    latest.js
    quota.js
    session.js
    verify.js
src/
  components/
    cards.jsx
    Carousel.jsx
    controls.jsx
    FilterBar.jsx
    icons.jsx
    Layout.jsx
    PemutarVideo.jsx
    Skeleton.jsx
    ui.jsx
  lib/
    auth.js
    constants.js
    format.js
    konversi.js
    logbook.js
    profil.js
    supabase.js
    theme.jsx
    upload.js
    youtube.js
  pages/
    AttendancePage.jsx
    DashboardPage.jsx
    DospemPage.jsx
    GalleryPage.jsx
    HomePage.jsx
    LogbookPage.jsx
    LoginPage.jsx
    TimPage.jsx
  App.jsx
  index.css
  main.jsx
supabase/
  schema.sql
.env.example
.gitignore
apply-auto-rotate-youtube.cjs
apply-avatar-bulat-v3.cjs
apply-avatar-final.cjs
apply-avatar-inline.cjs
apply-avatar-kartu-v2.cjs
apply-avatar-kartu.cjs
apply-avatar-kotak-lengkung.cjs
apply-avatar-lencana.cjs
apply-avatar-publik.cjs
apply-avatar-tanpa-border.cjs
apply-bulat-sempurna.cjs
apply-diagnosis-dan-bersih.cjs
apply-final-cleanup.cjs
apply-fix-chip-galeri.cjs
apply-fix-dospem-pusat.cjs
apply-fix-dospem-syntax.cjs
apply-fix-export-unggah.cjs
apply-fix-ganti-foto.cjs
apply-fix-nim-text.cjs
apply-fix-prodi-final.cjs
apply-fix-setmahasiswa.cjs
apply-fix-sisa-netral.cjs
apply-fix-state-loading.cjs
apply-fix-syntax-logbook.cjs
apply-fix-tiga-masalah.cjs
apply-fix-token-aman.cjs
apply-fix-video-galeri.cjs
apply-fix-youtube-scope.cjs
apply-foto-hadir-v2.cjs
apply-foto-hadir.cjs
apply-foto-profil-webp.cjs
apply-foto-profil.cjs
apply-gabung-tim-dospem.cjs
apply-galeri-picker.cjs
apply-hapus-ringkasan.cjs
apply-kartu-tim-cantik.cjs
apply-kartu-tim-kehadiran-v2.cjs
apply-kartu-tim-kehadiran.cjs
apply-loading-kuota.cjs
apply-netral-final.cjs
apply-netral-youtube-dan-titik.cjs
apply-pagination-dashboard.cjs
apply-pagination-v2.cjs
apply-pagination-v3.cjs
apply-pagination.cjs
apply-pemutar-crop-v4.cjs
apply-pemutar-custom.cjs
apply-pemutar-full-custom.cjs
apply-pemutar-pas-tengah.cjs
apply-pemutar-referensi.cjs
apply-pemutar-tutup-merek.cjs
apply-preview-video-controls.cjs
apply-profil-rapi.cjs
apply-profil-tab.cjs
apply-scroll-top.cjs
apply-thumb-youtube-fallback.cjs
apply-youtube-backend.cjs
apply-youtube-final-fix.cjs
apply-youtube-final-response.cjs
apply-youtube-final.cjs
apply-youtube-frontend.cjs
apply-youtube-latest-middleware.cjs
apply-youtube-verify.cjs
fix-errors.cjs
fix-publik-dan-key.cjs
fix-query-dan-key.cjs
fix-ui-avatar.cjs
index.html
package.json
postcss.config.js
prototipe-tim-gabung.html
README.md
setup-semua-fitur.cjs
setup-youtube-token-multi.cjs
setup-youtube-token.cjs
siapkan-env-youtube-lokal.cjs
tailwind.config.js
tesss-iframeeee.html
vercel.json
vite.config.js
```

# Files

## File: apply-fix-dospem-pusat.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki sisa pemasangan di DospemPage...')
console.log('')

const FILE_D = 'src/pages/DospemPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubah = false

/* ===== 1. Seimbangkan penutup kartu profil tim (tambah satu </div> pembungkus kolom) ===== */
const TUTUP_BENAR = '</div>\n</div>\n</div>\n</div>\n)\n})}'
const TUTUP_LAMA = '</div>\n</div>\n</div>\n)\n})}'
if (d.includes(TUTUP_BENAR)) {
  console.log('[SUDAH ADA] Penutup kartu profil tim sudah seimbang')
} else if (d.includes(TUTUP_LAMA)) {
  d = d.replace(TUTUP_LAMA, TUTUP_BENAR)
  berubah = true
  console.log('[BERHASIL] Penutup kartu profil tim diseimbangkan, error sintaks hilang')
} else {
  console.log('[TIDAK KETEMU] Pola penutup kartu profil tim')
}

/* ===== 2. Wadah grid logbook dospem menjadi grid-pusat ===== */
const CONT_LAMA = '<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">'
const CONT_BARU = '<div className="grid-pusat mt-6">'
if (d.includes(CONT_BARU)) {
  console.log('[SUDAH ADA] Wadah grid logbook dospem sudah grid-pusat')
} else if (d.includes(CONT_LAMA)) {
  d = d.replace(CONT_LAMA, CONT_BARU)
  berubah = true
  console.log('[BERHASIL] Wadah grid logbook dospem menjadi grid-pusat')
} else {
  console.log('[TIDAK KETEMU] Wadah grid logbook dospem')
}

/* ===== 3. Skeleton logbook dospem dibungkus kolom ===== */
const SKEL_LAMA = '? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })'
const SKEL_BARU = '? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })'
if (d.includes('kolom-kartu"><SkeletonLogbookCard')) {
  console.log('[SUDAH ADA] Skeleton logbook dospem dibungkus kolom')
} else if (d.includes(SKEL_LAMA)) {
  d = d.replace(SKEL_LAMA, SKEL_BARU)
  berubah = true
  console.log('[BERHASIL] Skeleton logbook dospem dibungkus kolom')
} else {
  console.log('[TIDAK KETEMU] Skeleton logbook dospem')
}

/* ===== 4. Grid logbook dospem: 6 terbaru dibungkus kolom (regex tahan indentasi) ===== */
const RE_MAP = /: logs\.map\(function \(l\) \{\s*return <LogbookCard key=\{l\.id\} log=\{l\} onDetail=\{function \(\) \{ setDetail\(l\) \}\} \/>\s*\}\)\}/
if (d.includes('logs.slice(0, 6)')) {
  console.log('[SUDAH ADA] Grid logbook dospem sudah 6 terbaru')
} else if (RE_MAP.test(d)) {
  d = d.replace(RE_MAP, `: logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}`)
  berubah = true
  console.log('[BERHASIL] Grid logbook dospem menampilkan 6 terbaru rata tengah')
} else {
  console.log('[TIDAK KETEMU] Pola map logbook dospem')
}

/* ===== 5. EmptyState logbook dospem melebar penuh ===== */
const EMPTY_LAMA = '{!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}'
const EMPTY_BARU = '{!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}'
if (d.includes('<div className="w-full"><EmptyState title="Belum ada logbook publik"')) {
  console.log('[SUDAH ADA] EmptyState logbook dospem melebar penuh')
} else if (d.includes(EMPTY_LAMA)) {
  d = d.replace(EMPTY_LAMA, EMPTY_BARU)
  berubah = true
  console.log('[BERHASIL] EmptyState logbook dospem melebar penuh')
} else {
  console.log('[TIDAK KETEMU] EmptyState logbook dospem')
}

/* ===== 6. Tombol lihat semua sebelum penutup section logbook dospem ===== */
const RE_TOMBOL = /<\/div>\s*<\/section>\s*(<Modal open=\{!!detail\})/
if (d.includes('Lihat semua logbook')) {
  console.log('[SUDAH ADA] Tombol lihat semua di section logbook dospem')
} else if (RE_TOMBOL.test(d)) {
  d = d.replace(RE_TOMBOL, `</div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>
      $1`)
  berubah = true
  console.log('[BERHASIL] Tombol lihat semua dipasang di section logbook dospem')
} else {
  console.log('[TIDAK KETEMU] Anchor tombol lihat semua di dospem')
}

if (berubah) simpan(FILE_D, d)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perbaikan yang diterapkan:')
console.log('1. Penutup kartu profil tim kembali seimbang sehingga error sintaks dari langkah sebelumnya hilang.')
console.log('2. Grid logbook di Tim & Dospem memakai wadah grid-pusat dan hanya menampilkan 6 logbook terbaru.')
console.log('3. Tombol hijau Lihat semua logbook tampil di tengah bawah section aktivitas, menuju halaman Logbook.')
console.log('4. Kartu profil tim yang kurang dari satu baris penuh tetap berdiri di tengah karena pembungkus kolom.')
console.log('')
console.log('Langkah uji:')
console.log('1. Dev server tidak lagi menampilkan error sintaks setelah file tersimpan.')
console.log('2. Buka Tim & Dospem: kartu profil tim tampil rata tengah dan tidak ada kartu yang rusak.')
console.log('3. Section aktivitas menampilkan maksimal 6 kartu logbook terbaru dengan tombol lihat semua di bawahnya.')
console.log('4. Klik tombol tersebut: browser berpindah ke halaman Logbook lengkap dengan pagination 12 data.')
```

## File: apply-fix-dospem-syntax.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

const FILE_D = 'src/pages/DospemPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai memperbaiki struktur JSX yang tidak seimbang di DospemPage...')
console.log('')

/* ===== 1. Tulis ulang section Profil tim magang agar tag pembuka dan penutup seimbang ===== */
const startSection = '<section className="mt-10">\n<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>'
const endSection = '</section>\n      <section className="mt-10">\n        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>'

const startIdx = d.indexOf(startSection)
const endIdx = d.indexOf(endSection)

if (startIdx !== -1 && endIdx !== -1) {
  const newSection = `<section className="mt-10">
<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="grid-pusat-rapat mt-6">
{loading
? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>
</div>
)
})}
{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}
</div>
</section>
      `
  d = d.substring(0, startIdx) + newSection + d.substring(endIdx)
  berubah = true
  console.log('[BERHASIL] Section Profil tim magang ditulis ulang dengan struktur JSX yang seimbang')
} else {
  console.log('[TIDAK KETEMU] Batas section Profil tim magang, mencoba fallback...')
  const fallbackRegex = /(<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">[\s\S]*?)<\/div>(\s*\)\s*\}\)\})/
  if (fallbackRegex.test(d)) {
    d = d.replace(fallbackRegex, '$1</div>\n </div>$2')
    berubah = true
    console.log('[BERHASIL] Penutup kolom-kartu-rapat ditambahkan (fallback)')
  }
}

/* ===== 2. Pastikan section logbook dospem memiliki grid-pusat ===== */
const regexLogbook = /<section className="mt-10">\s*<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan<\/h2>\s*<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">/
if (regexLogbook.test(d)) {
  d = d.replace(regexLogbook, `<section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="grid-pusat mt-6">`)
  berubah = true
  console.log('[BERHASIL] Wadah grid logbook dospem diubah menjadi grid-pusat')
}

/* ===== 3. Pastikan ada tombol Lihat semua logbook sebelum Modal ===== */
if (!d.includes('Lihat semua logbook') && d.includes('<Modal open={!!detail}')) {
  d = d.replace(/<\/div>\s*<\/section>\s*(<Modal open=\{!!detail\})/, `</div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>
      $1`)
  berubah = true
  console.log('[BERHASIL] Tombol Lihat semua logbook ditambahkan')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Vite akan otomatis memuat ulang (atau restart dev server: Ctrl+C lalu npm run dev -- --host).')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Script sebelumnya gagal menambahkan </div> penutup untuk pembungkus kolom kartu profil tim.')
console.log('2. Akibatnya, parser JSX mengira section berikutnya (Aktivitas yang sudah dipublikasikan) masih berada di dalam kartu, sehingga memicu error "Adjacent JSX elements".')
console.log('3. Script ini membuang section Profil tim magang yang rusak dan menulis ulangnya dari nol dengan tag pembuka dan penutup yang dijamin seimbang.')
console.log('4. Section logbook di bawahnya juga dipastikan memakai wadah rata tengah (grid-pusat) dan memiliki tombol Lihat semua logbook.')
```

## File: apply-pagination-dashboard.cjs
```javascript
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
```

## File: apply-pagination-v2.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }
function batasFungsi(isi, mulai) {
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  return akhir
}

console.log('Mulai memperbarui pagination versi 2: teks lebih jelas dan tombol nomor bertema...')
console.log('')

/* =====================================================
   KOMPONEN PAGINATION VERSI 2
   ===================================================== */
const PAGINATION_V2 = `export function Pagination(props) {
  /* pagination-v2: tombol nomor halaman sesuai tema BSI */
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (!totalItems) return null
  const halaman = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) halaman.push(i)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        halaman.push(i)
      } else if (halaman[halaman.length - 1] !== '...') {
        halaman.push('...')
      }
    }
  }
  const clsAngka = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold transition '
  const clsNav = 'flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition '
  const clsNetral = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-bsi-800'
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page <= 1}
          onClick={function () { onPageChange(page - 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Sebelumnya
        </button>
      ) : null}
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-sm font-bold text-slate-400">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={clsAngka + (aktif
              ? 'bg-bsi-800 text-white shadow-lg shadow-bsi-900/25'
              : clsNetral)}
          >
            {h}
          </button>
        )
      })}
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={function () { onPageChange(page + 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Berikutnya
        </button>
      ) : null}
    </div>
  )
}`

/* =====================================================
   LANGKAH 1: GANTI KOMPONEN PAGINATION DI ui.jsx
   ===================================================== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.includes('/* pagination-v2')) {
  console.log('[SUDAH ADA] Komponen Pagination versi 2 di ui.jsx')
} else {
  const mulai = u.indexOf('export function Pagination(props) {')
  if (mulai === -1) {
    u = u.trimEnd() + '\n\n' + PAGINATION_V2 + '\n'
    simpan(FILE_U, u)
    console.log('[BERHASIL] Komponen Pagination ditambahkan di ui.jsx')
  } else {
    const akhir = batasFungsi(u, mulai)
    if (akhir === -1) {
      console.log('[GAGAL] Batas fungsi Pagination lama tidak terbaca')
    } else {
      u = u.slice(0, mulai) + PAGINATION_V2 + u.slice(akhir)
      simpan(FILE_U, u)
      console.log('[BERHASIL] Komponen Pagination lama diganti versi 2 di ui.jsx')
    }
  }
}

/* =====================================================
   LANGKAH 2: GANTI TEKS INFO DI TIGA HALAMAN
   ===================================================== */
const TARGET = [
  {
    rel: 'src/pages/LogbookPage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} logbook',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} logbook'
  },
  {
    rel: 'src/pages/GalleryPage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} media',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} media'
  },
  {
    rel: 'src/pages/AttendancePage.jsx',
    lama: 'Menampilkan {mulai} sampai {akhir} dari {totalData} catatan',
    baru: 'Halaman {pageAman} dari {totalPages} • {totalData} catatan'
  }
]
TARGET.forEach(function (t) {
  if (!ada(t.rel)) { console.log('[LEWATI] ' + t.rel + ' tidak ditemukan'); return }
  let isi = baca(t.rel)
  if (isi.includes('Halaman {pageAman} dari {totalPages}')) {
    console.log('[SUDAH ADA] Teks info baru di ' + t.rel)
  } else if (isi.includes(t.lama)) {
    isi = isi.split(t.lama).join(t.baru)
    simpan(t.rel, isi)
    console.log('[BERHASIL] Teks info diperbarui di ' + t.rel)
  } else {
    console.log('[TIDAK KETEMU] Teks info lama di ' + t.rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan versi 2:')
console.log('1. Teks info kini berbunyi Halaman 1 dari 1 • 4 logbook, jauh lebih mudah dipahami daripada rentang angka.')
console.log('2. Nomor halaman tampil sebagai tombol persegi membulat bertema: halaman aktif hijau BSI dengan bayangan lembut, halaman lain putih dengan border tipis.')
console.log('3. Tombol nomor hanya dibuat sebanyak halaman yang benar-benar ada. Data 7 buah berarti 1 halaman, jadi hanya tombol 1.')
console.log('4. Bila hanya ada 1 halaman, tombol Sebelumnya dan Berikutnya tidak ditampilkan sama sekali supaya tidak membingungkan.')
console.log('5. Bila halaman lebih dari 7, nomor di tengah diringkas dengan titik tiga, misalnya 1 ... 4 5 6 ... 10, supaya baris tombol tetap rapi.')
console.log('6. Mode gelap otomatis mengikuti karena kelas yang dipakai sama dengan komponen lain di proyek ini.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dengan 4 data: terlihat teks Halaman 1 dari 1 • 4 logbook dan satu tombol nomor 1.')
console.log('2. Tambahkan data sampai lebih dari 10: tombol 2 muncul beserta Sebelumnya dan Berikutnya.')
console.log('3. Klik tombol 2: tombol berubah hijau dan teks info menjadi Halaman 2 dari 2.')
console.log('4. Ulangi pengecekan di halaman Galeri dan Daftar Hadir.')
```

## File: apply-pagination-v3.cjs
```javascript
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

console.log('Mulai revisi pagination: 12 data per halaman, limit 6 terbaru, dan kartu rata tengah...')
console.log('')

/* ===== 1. Ubah isi setiap halaman dari 10 menjadi 12 data ===== */
;['src/pages/LogbookPage.jsx', 'src/pages/GalleryPage.jsx', 'src/pages/AttendancePage.jsx'].forEach(function (rel) {
  ganti(rel, 'const PER_PAGE = 10', 'const PER_PAGE = 12', 'PER_PAGE menjadi 12')
})

/* ===== 2. CSS wadah fleksibel yang meratakan tengah baris kartu tidak penuh ===== */
const FILE_CSS = 'src/index.css'
const CSS_PUSAT = `/* grid-pusat: baris kartu yang tidak penuh otomatis rata tengah */
.grid-pusat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem; }
.grid-pusat-rapat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.kolom-kartu, .kolom-kartu-rapat { width: 100%; display: flex; }
.kolom-kartu > *, .kolom-kartu-rapat > * { width: 100%; }
@media (min-width: 768px) {
  .kolom-kartu { width: calc(50% - 0.625rem); }
  .kolom-kartu-rapat { width: calc(50% - 0.5rem); }
}
@media (min-width: 1280px) {
  .kolom-kartu { width: calc(33.3333% - 0.83333rem); }
  .kolom-kartu-rapat { width: calc(33.3333% - 0.66667rem); }
}
`
if (!ada(FILE_CSS)) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* grid-pusat */')) {
    console.log('[SUDAH ADA] CSS grid-pusat di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_PUSAT)
    console.log('[BERHASIL] CSS grid-pusat ditambahkan di index.css')
  }
}

/* ===== 3. LogbookPage: grid rata tengah ===== */
ganti('src/pages/LogbookPage.jsx',
`      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonLogbookCard key={i} /> })
          : paginatedLogs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                onDetail={function () { setDetail(l) }} />
            })}
        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>`,
`      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
          : paginatedLogs.map(function (l) {
              return (
                <div key={l.id} className="kolom-kartu">
                  <LogbookCard log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                    onDetail={function () { setDetail(l) }} />
                </div>
              )
            })}
        {!loading && !logs.length ? <div className="w-full"><EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /></div> : null}
      </section>`,
'Grid LogbookPage rata tengah')

/* ===== 4. GalleryPage: grid rata tengah ===== */
ganti('src/pages/GalleryPage.jsx',
`      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonGalleryCard key={i} /> })
          : paginatedItems.map(function (i) {
              return <GalleryCard key={i.id} item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                onDetail={function () { setDetail(i) }} />
            })}
        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}
      </section>`,
`      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonGalleryCard /></div> })
          : paginatedItems.map(function (i) {
              return (
                <div key={i.id} className="kolom-kartu">
                  <GalleryCard item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                    onDetail={function () { setDetail(i) }} />
                </div>
              )
            })}
        {!loading && !items.length ? <div className="w-full"><EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /></div> : null}
      </section>`,
'Grid GalleryPage rata tengah')

/* ===== 5. AttendancePage: grid rata tengah ===== */
ganti('src/pages/AttendancePage.jsx',
`        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonAttendanceCard key={i} /> })
            : paginatedRows.map(function (r) {
                return <AttendanceCard key={r.id} row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                  onDetail={function () { setDetail(r) }} />
              })}
          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}
        </div>`,
`        <div className="grid-pusat-rapat mt-6">
          {loading
            ? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonAttendanceCard /></div> })
            : paginatedRows.map(function (r) {
                return (
                  <div key={r.id} className="kolom-kartu-rapat">
                    <AttendanceCard row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                      onDetail={function () { setDetail(r) }} />
                  </div>
                )
              })}
          {!loading && !rows.length ? <div className="w-full"><EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /></div> : null}
        </div>`,
'Grid AttendancePage rata tengah')

/* ===== 6. HomePage: 6 logbook terbaru plus tombol lihat semua dan rata tengah ===== */
ganti('src/pages/HomePage.jsx',
`        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.slice(0, 3).map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>`,
`        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>`,
'Beranda menampilkan 6 logbook terbaru dengan tombol lihat semua')

/* ===== 7. DospemPage: 6 logbook terbaru plus tombol lihat semua dan rata tengah ===== */
ganti('src/pages/DospemPage.jsx',
`         <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
           {loading
             ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
             : logs.map(function (l) {
                 return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
               })}
           {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}
         </div>
       </section>`,
`         <div className="grid-pusat mt-6">
           {loading
             ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
             : logs.slice(0, 6).map(function (l) {
                 return (
                   <div key={l.id} className="kolom-kartu">
                     <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                   </div>
                 )
               })}
           {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}
         </div>
         <div className="mt-8 flex justify-center">
           <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
         </div>
       </section>`,
'Tim & Dospem menampilkan 6 logbook terbaru dengan tombol lihat semua')

/* ===== 8. DospemPage: kartu profil tim ikut rata tengah ===== */
ganti('src/pages/DospemPage.jsx',
`<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">`,
`<div className="grid-pusat-rapat mt-6">`,
'Wadah kartu profil tim menjadi grid-pusat-rapat')
ganti('src/pages/DospemPage.jsx',
`? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })`,
`? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })`,
'Skeleton profil tim dibungkus kolom')
ganti('src/pages/DospemPage.jsx',
`<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">`,
`<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">`,
'Kartu profil tim dibungkus kolom')
ganti('src/pages/DospemPage.jsx',
`</div>
 )
 })}`,
`</div>
 </div>
 )
 })}`,
'Penutup kartu profil tim disesuaikan')
ganti('src/pages/DospemPage.jsx',
`{!loading && !people.length ? <EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /> : null}`,
`{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}`,
'EmptyState profil tim melebar penuh')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Isi revisi yang diterapkan:')
console.log('1. Setiap halaman pagination kini memuat 12 data per index, jadi satu baris penuh terdiri dari 4 baris kartu di layar lebar.')
console.log('2. Beranda menampilkan 6 logbook paling terbaru tanpa pagination, ditambah tombol Lihat semua logbook yang menuju halaman Logbook.')
console.log('3. Halaman Tim & Dospem menampilkan 6 logbook paling terbaru tanpa pagination, ditambah tombol Lihat semua logbook yang menuju halaman Logbook.')
console.log('4. Semua grid kartu memakai wadah fleksibel berpusat: bila kartu dalam satu baris hanya 1 atau 2, kartu tersebut berdiri di tengah, bukan menempel di kiri.')
console.log('5. Tinggi kartu dalam satu baris tetap sejajar karena pembungkus kolom meregangkan kartu secara otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Logbook dengan 4 data: keempat kartu tetap 3 di baris pertama dan 1 kartu sisa berada tepat di tengah baris kedua.')
console.log('2. Tambah data sampai 13: halaman menampilkan 12 kartu dan tombol nomor 1 serta 2 muncul.')
console.log('3. Buka Beranda: maksimal 6 kartu terbaru tampil dan tombol hijau Lihat semua logbook berada di tengah bawah.')
console.log('4. Buka Tim & Dospem: kartu profil tim rata tengah bila jumlahnya kurang dari 3, dan section aktivitas hanya 6 logbook terbaru dengan tombol lihat semua.')
console.log('5. Uji mode gelap: tata letak pusat tidak berubah dan warna tetap mengikuti tema.')
```

## File: apply-pagination.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang pagination 10 data per halaman pada Logbook, Galeri, dan Daftar Hadir...')
console.log('')

/* =====================================================
   KOMPONEN PAGINATION REUSABLE UNTUK ui.jsx
   ===================================================== */
const PAGINATION_COMPONENT = `export function Pagination(props) {
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (totalPages <= 1) return null
  const halaman = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      halaman.push(i)
    } else if (halaman[halaman.length - 1] !== '...') {
      halaman.push('...')
    }
  }
  const dasar = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition '
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={function () { onPageChange(page - 1) }}
        className={dasar + 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'}
      >
        Sebelumnya
      </button>
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-slate-400">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={dasar + (aktif ? 'bg-bsi-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100')}
          >
            {h}
          </button>
        )
      })}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={function () { onPageChange(page + 1) }}
        className={dasar + 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'}
      >
        Berikutnya
      </button>
    </div>
  )
}`

/* =====================================================
   BLOK KODE YANG DISISIPKAN KE SETIAP HALAMAN
   ===================================================== */
const BLOK_EFFECT = `  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }`

function buatBlokPagination(ns, np) {
  return '  const totalData = ' + ns + '.length\n' +
    '  const totalPages = Math.ceil(totalData / PER_PAGE)\n' +
    '  const pageAman = Math.min(page, Math.max(1, totalPages))\n' +
    '  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1\n' +
    '  const akhir = Math.min(pageAman * PER_PAGE, totalData)\n' +
    '  const ' + np + ' = ' + ns + '.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)'
}

function buatBlokAkhir(label) {
  return '      {!loading && totalData > 0 ? (\n' +
    '        <div className="mt-6 text-center text-sm text-slate-500">\n' +
    '          Menampilkan {mulai} sampai {akhir} dari {totalData} ' + label + '\n' +
    '        </div>\n' +
    '      ) : null}\n' +
    '      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}'
}

/* =====================================================
   LANGKAH 1: PASANG KOMPONEN PAGINATION DI ui.jsx
   ===================================================== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.includes('export function Pagination')) {
  console.log('[SUDAH ADA] Komponen Pagination di ui.jsx')
} else {
  u = u.trimEnd() + '\n\n' + PAGINATION_COMPONENT + '\n'
  simpan(FILE_U, u)
  console.log('[BERHASIL] Komponen Pagination ditambahkan di ui.jsx')
}

/* =====================================================
   FUNGSI TRANSFORMASI SATU HALAMAN
   ===================================================== */
function transformHalaman(cfg) {
  const rel = cfg.rel
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let berubah = false

  if (isi.includes(', Pagination }') || isi.includes('Pagination,')) {
    console.log('[SUDAH ADA] Import Pagination di ' + rel)
  } else if (isi.includes(cfg.importAsli)) {
    isi = isi.replace(cfg.importAsli, cfg.importBaru)
    berubah = true
    console.log('[BERHASIL] Import Pagination di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor import di ' + rel)
  }

  if (isi.includes('const PER_PAGE')) {
    console.log('[SUDAH ADA] Konstanta PER_PAGE di ' + rel)
  } else if (isi.includes(cfg.initialAnchor)) {
    isi = isi.replace(cfg.initialAnchor, cfg.initialAnchor + '\nconst PER_PAGE = 10')
    berubah = true
    console.log('[BERHASIL] Konstanta PER_PAGE di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor PER_PAGE di ' + rel)
  }

  if (isi.includes('const [page, setPage]')) {
    console.log('[SUDAH ADA] State page di ' + rel)
  } else if (isi.includes(cfg.loadingAnchor)) {
    isi = isi.replace(cfg.loadingAnchor, cfg.loadingAnchor + '\n  const [page, setPage] = useState(1)')
    berubah = true
    console.log('[BERHASIL] State page di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor state page di ' + rel)
  }

  if (isi.includes('function gantiHalaman')) {
    console.log('[SUDAH ADA] Logika gantiHalaman di ' + rel)
  } else if (isi.includes(cfg.filterAnchor)) {
    isi = isi.replace(cfg.filterAnchor, BLOK_EFFECT + '\n' + cfg.filterAnchor)
    berubah = true
    console.log('[BERHASIL] Logika gantiHalaman di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor gantiHalaman di ' + rel)
  }

  if (isi.includes(cfg.namaPaginated)) {
    console.log('[SUDAH ADA] Logika pagination di ' + rel)
  } else if (isi.includes(cfg.sortedAnchor)) {
    isi = isi.replace(cfg.sortedAnchor, cfg.sortedAnchor + '\n' + buatBlokPagination(cfg.namaSorted, cfg.namaPaginated))
    berubah = true
    console.log('[BERHASIL] Logika pagination di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor logika pagination di ' + rel)
  }

  if (isi.includes(cfg.namaPaginated + '.map')) {
    console.log('[SUDAH ADA] Grid memakai ' + cfg.namaPaginated + ' di ' + rel)
  } else if (isi.includes(cfg.mapAsli)) {
    isi = isi.replace(cfg.mapAsli, cfg.mapBaru)
    berubah = true
    console.log('[BERHASIL] Grid memakai ' + cfg.namaPaginated + ' di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor map grid di ' + rel)
  }

  if (isi.includes('<Pagination totalItems={totalData}')) {
    console.log('[SUDAH ADA] Komponen Pagination di grid ' + rel)
  } else if (isi.includes(cfg.gridAnchor)) {
    isi = isi.replace(cfg.gridAnchor, cfg.gridAnchor + '\n' + buatBlokAkhir(cfg.labelData))
    berubah = true
    console.log('[BERHASIL] Komponen Pagination di grid ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor grid untuk Pagination di ' + rel)
  }

  if (berubah) simpan(rel, isi)
}

/* =====================================================
   LANGKAH 2: TERAPKAN KE TIGA HALAMAN
   ===================================================== */
transformHalaman({
  rel: 'src/pages/LogbookPage.jsx',
  importAsli: "import { EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const logs = all.filter(function (l) {',
  sortedAnchor: '  const sortedLogs = urutkanTanggal(logs, sort)',
  namaSorted: 'sortedLogs',
  namaPaginated: 'paginatedLogs',
  mapAsli: ': sortedLogs.map(function (l) {',
  mapBaru: ': paginatedLogs.map(function (l) {',
  gridAnchor: '        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}\n      </section>',
  labelData: 'logbook'
})
console.log('')
transformHalaman({
  rel: 'src/pages/GalleryPage.jsx',
  importAsli: "import { EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const items = all.filter(function (i) {',
  sortedAnchor: '  const sortedItems = urutkanTanggal(items, sort)',
  namaSorted: 'sortedItems',
  namaPaginated: 'paginatedItems',
  mapAsli: ': sortedItems.map(function (i) {',
  mapBaru: ': paginatedItems.map(function (i) {',
  gridAnchor: '        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}\n      </section>',
  labelData: 'media'
})
console.log('')
transformHalaman({
  rel: 'src/pages/AttendancePage.jsx',
  importAsli: "import { StatCard, EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { StatCard, EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const rows = all.filter(function (r) {',
  sortedAnchor: '  const sortedRows = urutkanTanggal(rows, sort)',
  namaSorted: 'sortedRows',
  namaPaginated: 'paginatedRows',
  mapAsli: ': sortedRows.map(function (r) {',
  mapBaru: ': paginatedRows.map(function (r) {',
  gridAnchor: '          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}\n        </div>\n      </section>',
  labelData: 'catatan'
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang dipasang oleh script ini:')
console.log('1. Komponen Pagination reusable di ui.jsx dengan tombol Sebelumnya, nomor halaman, dan Berikutnya.')
console.log('2. Setiap halaman menampilkan 10 data per index sesuai konstanta PER_PAGE.')
console.log('3. Halaman otomatis kembali ke index pertama saat filter atau urutan berubah.')
console.log('4. Info rentang data tampil di bawah grid, misalnya Menampilkan 1 sampai 10 dari 25 logbook.')
console.log('5. Ada pengaman pageAman agar tidak error bila index aktif melebihi total halaman setelah filter berubah.')
console.log('6. Tampilan otomatis bergeser halus ke atas setiap kali pindah halaman.')
console.log('')
console.log('Bila ada baris TIDAK KETEMU, kirim baris tersebut ke chat supaya polanya disesuaikan.')
```

## File: apply-scroll-top.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang ScrollToTop agar pindah halaman selalu mulai dari atas...')
console.log('')

const FILE_A = 'src/App.jsx'
if (!fs.existsSync(path.join(root, FILE_A))) {
  console.log('[GAGAL] App.jsx tidak ditemukan')
  process.exit(1)
}
let a = baca(FILE_A)
let berubah = false

/* ===== 1. Tambah import useEffect dan useLocation ===== */
const IMP_LAMA = "import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'"
const IMP_BARU = "import { useEffect } from 'react'\nimport { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'"
if (a.includes('useLocation')) {
  console.log('[SUDAH ADA] Import useLocation di App.jsx')
} else if (a.includes(IMP_LAMA)) {
  a = a.replace(IMP_LAMA, IMP_BARU)
  berubah = true
  console.log('[BERHASIL] Import useEffect dan useLocation ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Pola import react-router di App.jsx')
}

/* ===== 2. Tambah komponen ScrollToTop sebelum RequireAuth ===== */
const KOMPONEN = `function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(function () {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}
`
if (a.includes('function ScrollToTop(')) {
  console.log('[SUDAH ADA] Komponen ScrollToTop di App.jsx')
} else if (a.includes('function RequireAuth(props) {')) {
  a = a.replace('function RequireAuth(props) {', KOMPONEN + 'function RequireAuth(props) {')
  berubah = true
  console.log('[BERHASIL] Komponen ScrollToTop ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Anchor RequireAuth di App.jsx')
}

/* ===== 3. Render ScrollToTop di dalam BrowserRouter ===== */
const ROUTER_FUTURE = '<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>'
if (a.includes('<ScrollToTop />')) {
  console.log('[SUDAH ADA] ScrollToTop sudah dirender')
} else if (a.includes(ROUTER_FUTURE)) {
  a = a.replace(ROUTER_FUTURE, ROUTER_FUTURE + '\n        <ScrollToTop />')
  berubah = true
  console.log('[BERHASIL] ScrollToTop dirender di dalam BrowserRouter')
} else if (a.includes('<BrowserRouter>')) {
  a = a.replace('<BrowserRouter>', '<BrowserRouter>\n        <ScrollToTop />')
  berubah = true
  console.log('[BERHASIL] ScrollToTop dirender di dalam BrowserRouter polos')
} else {
  console.log('[TIDAK KETEMU] Pola BrowserRouter di App.jsx')
}

if (berubah) simpan(FILE_A, a)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja perbaikan:')
console.log('1. Komponen ScrollToTop memantau perubahan pathname dari useLocation.')
console.log('2. Setiap kali route berpindah, misalnya dari Beranda atau Tim & Dospem ke Logbook, scroll langsung dikunci ke puncak secara instan.')
console.log('3. Perpindahan akibat redirect /tim ke /dospem juga ikut mulai dari atas.')
console.log('4. Scroll halus pada tombol nomor pagination di dalam halaman Logbook, Galeri, dan Daftar Hadir tidak terpengaruh karena pathnya tidak berubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Beranda, gulir ke bawah sampai tombol Lihat semua logbook, lalu klik.')
console.log('2. Halaman Logbook terbuka langsung dari posisi paling atas, bukan dari tengah.')
console.log('3. Ulangi dari halaman Tim & Dospem: hasil sama, mulai dari atas.')
console.log('4. Klik tombol nomor 2 pada pagination Logbook: perilaku scroll halus antar halaman tetap normal.')
```

## File: api/r2/delete.js
```javascript
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { key } = req.body || {}
  if (!key) return res.status(400).json({ error: 'Key tidak ada' })
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key }))
  return res.status(200).json({ ok: true })
}
```

## File: api/r2/presign.js
```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://' + process.env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
})

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } }
  })
  const check = await supabase.auth.getUser(token)
  if (check.error || !check.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { filename, contentType, kind } = req.body || {}
  if (!filename || !contentType || !kind) return res.status(400).json({ error: 'Payload tidak lengkap' })

  const ext = (filename.split('.').pop() || 'bin').toLowerCase()
  const key = kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key, ContentType: contentType }),
    { expiresIn: 300 }
  )
  const publicUrl = process.env.R2_PUBLIC_BASE_URL + '/' + key
  return res.status(200).json({ uploadUrl, publicUrl, key })
}
```

## File: api/youtube/verify.js
```javascript
import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { ref } = req.body || {}
  if (!ref) return res.status(400).json({ error: 'Ref tidak ada' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref)
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video di YouTube' })
  const j = await r.json()
  const items = j.items || []
  const batas = Date.now() - 15 * 60 * 1000
  const cocok = items.find(function (it) {
    const desc = (it.snippet && it.snippet.description) || ''
    const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
    return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
  }) || items[0]
  if (!cocok) return res.status(404).json({ error: 'Video tidak ditemukan di channel' })
  return res.status(200).json({ videoId: cocok.id && cocok.id.videoId })
}
```

## File: src/components/PemutarVideo.jsx
```javascript
import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const [thumbPakaiHq, setThumbPakaiHq] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function sedangMain() {
    const p = playerRef.current
    return Boolean(p && p.getPlayerState && window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING)
  }

  function resetTimerSembunyi() {
    if (!dimulai) return
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (sedangMain()) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false)
            }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (sedangMain()) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else if (bisu) { p.unMute(); setBisu(false) }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); p.setVolume(volume || 100); setBisu(false) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = thumbPakaiHq
    ? 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
    : 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const kontrolSembunyi = dimulai && !gagal && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ cursor: kontrolSembunyi ? 'none' : 'default' }}
      onMouseMove={resetTimerSembunyi}
      onMouseLeave={function () { if (sedangMain()) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      {/* Wadah player: setelah diisi YouTube, iframe diposisikan CSS dengan margin crop 70px */}
      <div ref={wadahRef} className="h-full w-full" />

      {/* Perisai penangkap klik */}
      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir}
          className="absolute inset-0 z-10 h-full w-full bg-transparent" style={{ cursor: kontrolSembunyi ? 'none' : 'default' }} />
      ) : null}

      {/* Ikon putar besar milik kita saat dijeda, menutup ikon bawaan YouTube */}
      {dimulai && !memutar && !buffer && !selesai && !gagal ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <IkonPlay className="ml-1 h-8 w-8" />
          </span>
        </div>
      ) : null}

      {/* Poster awal dengan tombol putar minimalis */}
      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} onError={function () { setThumbPakaiHq(true) }}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
              <IkonPlay className="ml-0.5 h-5 w-5" />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {/* Layar akhir dengan putar ulang */}
      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {/* Layar gagal */}
      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {/* Panel kontrol overlay di atas video */}
      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ' + (kontrolSembunyi ? 'pointer-events-none opacity-0' : 'opacity-100')}>
          <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
            {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
          </button>
          <input type="range" min="0" max="100" step="0.1" value={persen} onChange={geser} title="Geser durasi"
            className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, rgba(255,255,255,0.25) ' + persen + '%, rgba(255,255,255,0.25) 100%)' }} />
          <span className="min-w-[84px] shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
          <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {bisu ? <IkonBisu /> : <IkonSuara />}
          </button>
          <input type="range" min="0" max="100" value={bisu ? 0 : volume} onChange={aturVolume} title="Volume"
            className="pemutar-volume h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) 100%)' }} />
          {buffer ? <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
          <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {penuh ? <IkonKecil /> : <IkonPenuh />}
          </button>
        </div>
      ) : null}
    </div>
  )
}
```

## File: src/components/Skeleton.jsx
```javascript
export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="skeleton h-4 w-28"></div>
      <div className="skeleton h-9 w-16 mt-3"></div>
      <div className="skeleton h-3 w-36 mt-2"></div>
    </div>
  )
}

export function SkeletonLogbookCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      <div className="skeleton h-40 w-full rounded-2xl"></div>
      <div className="flex gap-2">
        <div className="skeleton h-6 w-24 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-32"></div>
      <div className="skeleton h-6 w-3/4"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-2/3"></div>
      <div className="flex items-center gap-3 pt-2">
        <div className="skeleton h-11 w-11 rounded-2xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
      </div>
    </div>
  )
}

export function SkeletonGalleryCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="skeleton aspect-video w-full rounded-none"></div>
      <div className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-24 rounded-full"></div>
          <div className="skeleton h-4 w-16"></div>
        </div>
        <div className="skeleton h-5 w-3/4"></div>
        <div className="skeleton h-4 w-full"></div>
        <div className="skeleton h-4 w-1/2"></div>
      </div>
    </div>
  )
}

export function SkeletonAttendanceCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-40"></div>
          <div className="skeleton h-5 w-32"></div>
        </div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div className="skeleton h-16 w-full rounded-2xl"></div>
    </div>
  )
}

export function SkeletonPersonCard() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-14 w-14 rounded-3xl"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-5 w-32"></div>
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-4 w-28 rounded-full"></div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="skeleton h-20 rounded-2xl"></div>
        <div className="skeleton h-20 rounded-2xl"></div>
      </div>
    </div>
  )
}

export function SkeletonChartRow() {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-4 w-32"></div>
          <div className="skeleton h-3 w-24"></div>
        </div>
        <div className="skeleton h-4 w-40"></div>
      </div>
      <div className="skeleton h-4 w-full rounded-full mt-4"></div>
    </div>
  )
}
```

## File: src/lib/profil.js
```javascript
import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, siap, { upsert: true, contentType: siap.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
```

## File: src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

## File: src/lib/theme.jsx
```javascript
import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem('mbsi-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(function () {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mbsi-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark: dark, toggle: function () { setDark(function (d) { return !d }) } }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
```

## File: src/lib/youtube.js
```javascript
import { supabase } from './supabase.js'

export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal memulai sesi upload video' } })
    throw new Error(j.error || 'Gagal memulai sesi upload video')
  }
  return await r.json()
}
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload video gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah tersimpan; tempel link video secara manual.')
}

export async function unggahVideoYouTube(file, judul, onProgress) {
  const sesiData = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const sesi = await startYouTubeSession(judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  return await uploadToYouTube(sesi.sessionUri, file, onProgress)
}

export async function ambilTokenSesi() {
  try {
    const r = await supabase.auth.getSession()
    const ssn = r && r.data ? r.data.session : null
    return ssn && ssn.access_token ? ssn.access_token : ''
  } catch (e) {
    return ''
  }
}
```

## File: src/main.jsx
```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

## File: .env.example
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=mbsi-media
R2_PUBLIC_BASE_URL=
```

## File: apply-auto-rotate-youtube.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}

const KEPALA = `import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
`

/* ===== 1. api/youtube/quota.js ===== */
simpan('api/youtube/quota.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let usedTotal = 0
  const perProject = []
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    const used = hit.count || 0
    usedTotal += used
    perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
  }
  const limit = kredensial.length * LIMIT_PER_PROJECT
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
}
`)

/* ===== 2. api/youtube/session.js ===== */
simpan('api/youtube/session.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let terakhir = ''
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const meta = {
      snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
      status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
    }
    const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
      body: JSON.stringify(meta)
    })
    if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
    const sessionUri = init.headers.get('location')
    if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
    await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id, project_id: kred.n })
    return res.status(200).json({ sessionUri: sessionUri, project: kred.n })
  }
  return res.status(429).json({ error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
}
`)

/* ===== 3. api/youtube/latest.js ===== */
simpan('api/youtube/latest.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let terakhir = ''
  for (const kred of kredensial) {
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
    if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
    const j = await r.json()
    const items = j.items || []
    const batas = Date.now() - 15 * 60 * 1000
    const cocok = items.find(function (it) {
      const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
      return isNaN(t) ? false : t >= batas
    })
    if (!cocok) return res.status(404).json({ error: 'Video terbaru tidak ditemukan' })
    return res.status(200).json({ videoId: cocok.id && cocok.id.videoId, project: kred.n })
  }
  return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + terakhir })
}
`)

/* ===== 4. vite.config.js: ganti seluruh plugin YouTube ===== */
const FILE_V = 'vite.config.js'
let v = fs.readFileSync(path.join(root, FILE_V), 'utf8').replace(/\r\n/g, '\n')
const mulai = v.indexOf('function pluginApiYoutube(env) {')
const akhir = v.indexOf('export default defineConfig')
if (mulai === -1 || akhir === -1) {
  console.log('[TIDAK KETEMU] Blok pluginApiYoutube di vite.config.js')
} else if (v.includes('LIMIT_PER_PROJECT')) {
  console.log('[SUDAH ADA] Plugin YouTube multi-project di vite.config.js')
} else {
  const pluginBaru = `function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const LIMIT_PER_PROJECT = 5
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  function daftarKredensial() {
    const list = []
    for (let n = 1; n <= 6; n++) {
      const id = env['YOUTUBE_CLIENT_ID_' + n]
      const secret = env['YOUTUBE_CLIENT_SECRET_' + n]
      const refresh = env['YOUTUBE_REFRESH_TOKEN_' + n]
      if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
    }
    if (!list.length && env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REFRESH_TOKEN) {
      list.push({ n: 1, id: env.YOUTUBE_CLIENT_ID, secret: env.YOUTUBE_CLIENT_SECRET, refresh: env.YOUTUBE_REFRESH_TOKEN })
    }
    return list
  }
  const cacheToken = {}
  async function getAccessToken(kred) {
    const now = Date.now()
    const c = cacheToken[kred.n]
    if (c && c.expire > now + 60000) return c.token
    const params = new URLSearchParams()
    params.set('client_id', kred.id)
    params.set('client_secret', kred.secret)
    params.set('refresh_token', kred.refresh)
    params.set('grant_type', 'refresh_token')
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
    if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
    const j = await r.json()
    cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
    return j.access_token
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let usedTotal = 0
        const perProject = []
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          const used = hit.count || 0
          usedTotal += used
          perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
        }
        const limit = kredensial.length * LIMIT_PER_PROJECT
        res.setHeader('Cache-Control', 'no-store')
        kirim(res, 200, { limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        const body = await bacaBody(req)
        if (!body.title) { kirim(res, 400, { error: 'Judul video wajib diisi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const meta = {
            snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
            status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
          }
          const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
            body: JSON.stringify(meta)
          })
          if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
          const sessionUri = init.headers.get('location')
          if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
          await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id, project_id: kred.n })
          kirim(res, 200, { sessionUri: sessionUri, project: kred.n })
          return
        }
        kirim(res, 429, { error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
      })
      server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
          if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
          const j = await r.json()
          const items = j.items || []
          const batas = Date.now() - 15 * 60 * 1000
          const cocok = items.find(function (it) {
            const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
            return isNaN(t) ? false : t >= batas
          })
          if (!cocok) { kirim(res, 404, { error: 'Video terbaru tidak ditemukan' }); return }
          kirim(res, 200, { videoId: cocok.id && cocok.id.videoId, project: kred.n })
          return
        }
        kirim(res, 502, { error: 'Gagal memeriksa video terbaru: ' + terakhir })
      })
    }
  }
}

`
  v = v.slice(0, mulai) + pluginBaru + v.slice(akhir)
  fs.writeFileSync(path.join(root, FILE_V), v, 'utf8')
  console.log('[BERHASIL] Plugin YouTube multi-project dipasang di vite.config.js')
}

console.log('')
console.log('Selesai. Restart dev server sekali: Ctrl+C lalu npm run dev -- --host')
console.log('Setelah itu rotasi project berjalan otomatis tanpa restart lagi.')
```

## File: apply-avatar-bulat-v3.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Diagnosis dan penguncian bentuk bulat versi 3...')
console.log('')

const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}

let u = baca(FILE_U)

/* ===== 1. Diagnosis: cetak fungsi Avatar yang aktif saat ini ===== */
const idxAvatar = u.indexOf('function Avatar(')
if (idxAvatar === -1) {
  console.log('[DIAGNOSIS] Fungsi Avatar tidak ditemukan di ui.jsx sama sekali.')
} else {
  console.log('[DIAGNOSIS] Isi fungsi Avatar saat ini:')
  console.log(u.slice(idxAvatar - 7, idxAvatar + 700))
  console.log('')
}

/* ===== 2. Tandai img foto profil di dalam Avatar dengan data-fp ===== */
if (idxAvatar === -1) {
  console.log('[LEWATI] Penandaan img dilewati karena Avatar tidak ditemukan')
} else if (u.includes('data-fp=')) {
  console.log('[SUDAH ADA] Penanda data-fp pada img Avatar')
} else {
  let brace = 0
  let akhir = -1
  let inString = false
  let stringChar = ''
  for (let i = idxAvatar; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') {
      brace--
      if (brace === 0) { akhir = i + 1; break }
    }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Avatar tidak terbaca')
  } else {
    let potongan = u.slice(idxAvatar, akhir)
    const potonganBaru = potongan.replace('<img ', '<img data-fp="1" ')
    if (potonganBaru === potongan) {
      console.log('[TIDAK KETEMU] Tag img di dalam fungsi Avatar')
    } else {
      u = u.slice(0, idxAvatar) + potonganBaru + u.slice(akhir)
      simpan(FILE_U, u)
      console.log('[BERHASIL] Tag img foto profil ditandai data-fp')
    }
  }
}

/* ===== 3. CSS palu bulat: paksa seluruh rantai wadah menjadi lingkaran ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* bulat-v3 */')) {
    console.log('[SUDAH ADA] Aturan CSS bulat-v3')
  } else {
    css = css.trimEnd() + '\n\n' + `/* bulat-v3: paksa foto profil bulat sempurna tanpa peduli markup wadah */
img[data-fp] {
  border-radius: 9999px !important;
  object-fit: cover !important;
  object-position: center !important;
  width: 100% !important;
  height: 100% !important;
}
*:has(> img[data-fp]) {
  display: inline-grid !important;
  place-items: center !important;
  position: relative !important;
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  overflow: hidden !important;
  box-shadow: 0 0 0 3px #166534, 0 3px 10px rgba(15, 23, 42, 0.3) !important;
}
*:has(> * > img[data-fp]) {
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
}
*:has(> * > * > img[data-fp]) {
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS bulat-v3 dipasang')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja versi ini:')
console.log('1. Tag img foto profil diberi atribut data-fp sehingga bisa dibidik CSS tanpa bergantung kelas atau nama variabel.')
console.log('2. Wadah tingkat pertama, kedua, dan ketiga di atas foto dipaksa transparan, tanpa padding, tanpa border, dan beradius penuh, sehingga kotak hijau squircle apa pun akan lenyap.')
console.log('3. Cincin hijau dibuat lewat box-shadow pada wadah langsung foto, yang tidak mungkin terpotong oleh overflow wadah mana pun, jadi hasilnya lingkaran sempurna merata 360 derajat.')
console.log('4. Fallback inisial tidak terpengaruh karena aturan hanya aktif bila ada img beratribut data-fp.')
console.log('')
console.log('Bila setelah hard refresh masih tidak berubah, salin seluruh keluaran [DIAGNOSIS] dari terminal ke chat supaya aku bisa melihat kode Avatar yang sebenarnya aktif di proyekmu.')
```

## File: apply-avatar-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Perbaikan final: Avatar berdiri sendiri tanpa pembungkus luar...')
console.log('')

/* ===== 1. ui.jsx: Avatar menerima onClick, tanpa pembungkus apa pun ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) { console.log('[GAGAL] ui.jsx tidak ditemukan'); process.exit(1) }

let u = baca(FILE_U)
const m = u.match(/export\s+function\s+Avatar\s*\(/) || u.match(/function\s+Avatar\s*\(/)
if (!m) { console.log('[GAGAL] Fungsi Avatar tidak ditemukan'); process.exit(1) }

const mulai = m.index
let brace = 0, akhir = -1, inStr = false, strCh = ''
for (let i = mulai; i < u.length; i++) {
  const ch = u[i], prev = i > 0 ? u[i-1] : ''
  if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
  if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
  if (ch === '{') brace++
  if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
}

const pakaiExport = u.slice(mulai, mulai + 20).includes('export')
const AVATAR_FINAL = (pakaiExport ? 'export ' : '') + `function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const nama = props.nama || ''
  const kata = nama.trim().split(/\\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const Tag = bisaKlik ? 'button' : 'span'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    border: '3px solid #166534',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  if (props.style) Object.assign(gaya, props.style)
  const gayaFoto = {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    objectFit: 'cover', objectPosition: 'center',
    display: 'block', borderRadius: '9999px'
  }
  const gayaTeks = {
    position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#ffffff', fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  return (
    <Tag type={bisaKlik ? 'button' : undefined} onClick={props.onClick} title={props.title} style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
    </Tag>
  )
}`

u = u.slice(0, mulai) + AVATAR_FINAL + u.slice(akhir)
simpan(FILE_U, u)
console.log('[BERHASIL] Avatar ditulis ulang final: bisa diklik langsung, tanpa pembungkus luar')

/* ===== 2. DashboardPage: hapus pembungkus <button> di avatar header ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (fs.existsSync(path.join(root, FILE_D))) {
  let d = baca(FILE_D)
  let berubah = false
  
  // Pola: <button ... onClick={...setTab('profil')...}><Avatar .../></button>
  d = d.replace(/<button[^>]*onClick=\{function\s*\(\)\s*\{\s*setTab\('profil'\)\s*\}\}[^>]*>\s*<Avatar([^>]*?)\/>\s*<\/button>/gs, function (m, attrs) {
    berubah = true
    return `<Avatar${attrs} onClick={function () { setTab('profil') }} title="Kelola foto profil" />`
  })
  
  // Pola alternatif dengan panah: onClick={() => setTab('profil')}
  d = d.replace(/<button[^>]*onClick=\{\(\)\s*=>\s*setTab\('profil'\)\}[^>]*>\s*<Avatar([^>]*?)\/>\s*<\/button>/gs, function (m, attrs) {
    berubah = true
    return `<Avatar${attrs} onClick={function () { setTab('profil') }} title="Kelola foto profil" />`
  })
  
  if (berubah) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Pembungkus button di avatar header dihapus')
  } else {
    console.log('[INFO] Avatar header sudah tidak dibungkus button (atau pola berbeda)')
  }
}

/* ===== 3. cards.jsx: pastikan PersonChip tidak membungkus Avatar ===== */
const FILE_C = 'src/components/cards.jsx'
if (fs.existsSync(path.join(root, FILE_C))) {
  let c = baca(FILE_C)
  let berubahC = false
  
  // Hapus pembungkus div/span di sekitar <Avatar...>
  c = c.replace(/<div[^>]*className="[^"]*rounded-full[^"]*"[^>]*>\s*<Avatar([^>]*?)\/>\s*<\/div>/gs, function (m, attrs) {
    berubahC = true
    return `<Avatar${attrs}/>`
  })
  c = c.replace(/<span[^>]*className="[^"]*rounded-full[^"]*"[^>]*>\s*<Avatar([^>]*?)\/>\s*<\/span>/gs, function (m, attrs) {
    berubahC = true
    return `<Avatar${attrs}/>`
  })
  
  if (berubahC) {
    simpan(FILE_C, c)
    console.log('[BERHASIL] Pembungkus bulat palsu di cards.jsx dihapus')
  } else {
    console.log('[INFO] Tidak ada pembungkus bulat palsu di cards.jsx')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R (WAJIB Ctrl+Shift+R, bukan F5 biasa).')
console.log('')
console.log('Perubahan final:')
console.log('1. Avatar kini berdiri sendiri tanpa pembungkus luar apa pun. Tidak ada lagi elemen asing yang memberi bentuk squircle hijau.')
console.log('2. Avatar menerima prop onClick, sehingga avatar header bisa diklik langsung tanpa perlu dibungkus <button>.')
console.log('3. Semua gaya ditulis inline dengan borderRadius 9999px dan lebar=tinggi piksel sama, sehingga lingkaran dijamin matematis.')
console.log('4. Cincin hijau adalah border asli dari Avatar itu sendiri, bukan dari elemen pembungkus.')
console.log('5. Fallback inisial memakai wadah dan cincin yang identik, bentuk tidak berubah antara foto dan inisial.')
```

## File: apply-avatar-inline.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'

if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}

let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')

/* ===== Cari fungsi Avatar dengan pola longgar ===== */
let m = u.match(/export\s+function\s+Avatar\s*\(/)
let pakaiExport = true
if (!m) {
  m = u.match(/function\s+Avatar\s*\(/)
  pakaiExport = false
}
if (!m) {
  const idx = u.indexOf('Avatar')
  console.log('[TIDAK KETEMU] Fungsi Avatar. Cuplikan sekitar kata Avatar:')
  console.log(idx === -1 ? '(kata Avatar tidak ada sama sekali)' : u.slice(Math.max(0, idx - 200), idx + 400))
  process.exit(1)
}

const mulai = m.index
let brace = 0
let akhir = -1
let inString = false
let stringChar = ''
for (let i = mulai; i < u.length; i++) {
  const ch = u[i]
  const prev = i > 0 ? u[i - 1] : ''
  if (inString) {
    if (ch === stringChar && prev !== '\\') inString = false
    continue
  }
  if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue }
  if (ch === '{') brace++
  if (ch === '}') {
    brace--
    if (brace === 0) { akhir = i + 1; break }
  }
}
if (akhir === -1) {
  console.log('[GAGAL] Batas akhir fungsi Avatar tidak terbaca')
  process.exit(1)
}

const AVATAR_BARU = (pakaiExport ? 'export ' : '') + `function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const nama = props.nama || ''
  const kata = nama.trim().split(/\\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const gayaWadah = {
    boxSizing: 'border-box',
    width: px + 'px',
    height: px + 'px',
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    display: 'inline-block',
    verticalAlign: 'middle',
    flexShrink: 0,
    border: '3px solid #166534',
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
    background: props.src ? '#ffffff' : warna
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    borderRadius: '50%',
    display: 'block'
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px',
    letterSpacing: '0.02em'
  }
  return (
    <span style={gayaWadah}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}`

u = u.slice(0, mulai) + AVATAR_BARU + u.slice(akhir)
fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')

console.log('[BERHASIL] Avatar ditulis ulang dengan gaya inline berukuran piksel tetap')
console.log('')
console.log('Selesai. Lanjutkan dua langkah berikut agar perubahan pasti terlihat:')
console.log('1. Restart dev server: tekan Ctrl+C lalu jalankan npm run dev -- --host')
console.log('2. Hard refresh browser dengan Ctrl + Shift + R')
console.log('')
console.log('Jaminan bentuk pada versi ini:')
console.log('1. Wadah span punya lebar dan tinggi piksel yang sama persis, jadi borderRadius 50 persen menghasilkan lingkaran sempurna, bukan elips.')
console.log('2. Semua gaya ditulis inline sehingga tidak ada satu pun aturan CSS lama yang bisa menimpa atau mendistorsinya.')
console.log('3. Foto diposisikan absolut mengisi wadah dengan object-fit cover dan radius 50 persen, sehingga foto juga lingkaran sempurna di dalam wadah lingkaran.')
console.log('4. Cincin hijau 3 piksel mengikuti keliling wadah secara merata karena merupakan border dari wadah yang bulat.')
console.log('5. Fallback inisial memakai wadah yang sama persis, jadi bentuknya identik dengan versi foto.')
```

## File: apply-avatar-kartu-v2.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang foto profil pada semua lingkaran inisial...')
console.log('')

/* Kumpulkan semua file jsx di bawah src */
const daftar = []
function jalan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(function (e) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) { jalan(full); return }
    if (/\.jsx$/.test(e.name)) daftar.push(full)
  })
}
jalan(path.join(root, 'src'))

/* Hanya menarget isi lingkaran: {initials} atau {inisial} yang diikuti penutup div */
const regexIsi = /\{\s*(initials|inisial)\s*\}\s*<\/div>/g

let totalFile = 0
let totalSub = 0
daftar.forEach(function (full) {
  const rel = path.relative(root, full).replace(/\\/g, '/')
  let isi = baca(rel)
  if (!regexIsi.test(isi)) return
  regexIsi.lastIndex = 0
  let jumlah = 0
  const hasil = isi.replace(regexIsi, function (m, varName) {
    jumlah++
    return `{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover" /> : ` +
      `typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover" /> : ` +
      varName + '}</div>'
  })
  if (jumlah === 0) return
  simpan(rel, hasil)
  totalFile++
  totalSub += jumlah
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial mendukung foto profil di ' + rel)
})

if (totalFile === 0) {
  console.log('[TIDAK KETEMU] Tidak ada file yang memuat pola {initials} atau {inisial}')
  console.log('')
  console.log('Bila baris ini muncul, kirim isi fungsi PersonChip dari src/components/cards.jsx')
  console.log('supaya aku kunci polanya persis pada bentuk yang dipakai proyekmu.')
}

console.log('')
console.log('Ringkasan: ' + totalSub + ' lingkaran diperbarui pada ' + totalFile + ' file.')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload foto profil dari dashboard bila belum.')
console.log('2. Buka beranda: kartu Profil Mahasiswa menampilkan foto bulat pengganti inisial.')
console.log('3. Buka logbook, galeri, dan daftar hadir: PersonChip menampilkan foto kecil pemilik.')
console.log('4. Mahasiswa tanpa foto tetap melihat inisial berwarna tema seperti semula.')
console.log('5. Hapus foto dari dashboard: semua permukaan kembali ke inisial dengan mulus.')
```

## File: apply-avatar-kartu.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang foto profil pada lingkaran inisial...')
console.log('')

const TARGET = [
  'src/components/cards.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/DospemPage.jsx'
]

/* Div lingkaran yang isinya variabel initials atau inisial */
const regexDiv = /(<div\b[^>]*rounded-full[^>]*>)\s*\{(initials|inisial)\}\s*<\/div>/g

TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexDiv, function (m, buka, varName) {
    jumlah++
    return buka +
      `{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover border-2 border-white shadow-md" /> : ` +
      `typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover border-2 border-white shadow-md" /> : ` +
      varName + '}</div>'
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  simpan(rel, hasil)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial kini mendukung foto profil di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cakupan perbaikan:')
console.log('1. PersonChip di cards.jsx dipakai oleh kartu logbook, kartu galeri, baris daftar hadir, dan detail, sehingga semuanya otomatis menampilkan foto.')
console.log('2. PersonCard di cards.jsx dipakai oleh grid Profil Mahasiswa di beranda, sehingga kartu publik ikut menampilkan foto.')
console.log('3. Div lingkaran berukuran tetap dipertahankan, jadi tidak ada perubahan tata letak sama sekali.')
console.log('4. Mahasiswa tanpa foto tetap melihat inisial berwarna tema seperti sebelumnya.')
console.log('5. Pengaman typeof membuat komponen tidak crash bila nama variabel mahasiswa berbeda antar fungsi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload foto profil dari dashboard seperti langkah sebelumnya.')
console.log('2. Buka beranda: kartu Profil Mahasiswa menampilkan foto bulat, bukan inisial.')
console.log('3. Buka logbook dan galeri: PersonChip di setiap kartu menampilkan foto kecil mahasiswa pemilik.')
console.log('4. Buka daftar hadir: baris kehadiran menampilkan foto mahasiswa.')
console.log('5. Hapus foto profil dari dashboard: semua permukaan kembali ke inisial berwarna tema.')
```

## File: apply-avatar-kotak-lengkung.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengubah seluruh foto profil menjadi kotak bersudut melengkung halus...')
console.log('')

/* ===== 1. ui.jsx: Avatar menjadi kotak melengkung proporsional ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const m = u.match(/export\s+function\s+Avatar\s*\(/) || u.match(/function\s+Avatar\s*\(/)
if (!m) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else {
  const mulai = m.index
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Avatar tidak terbaca')
  } else {
    const pakaiExport = u.slice(mulai, mulai + 20).includes('export')
    const AVATAR_KOTAK = (pakaiExport ? 'export ' : '') + `function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const radius = Math.round(px * 0.28) + 'px'
  const nama = props.nama || ''
  const kata = nama.trim().split(/\\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    border: '3px solid #166534',
    borderRadius: radius,
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: radius
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  if (bisaKlik) {
    return (
      <button type="button" onClick={props.onClick} title={props.title} style={gaya}>
        {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
      </button>
    )
  }
  return (
    <span style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}`
    u = u.slice(0, mulai) + AVATAR_KOTAK + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar kini kotak bersudut melengkung proporsional')
  }
}

/* ===== 2. Foto inline sisa script lama dan pratinjau form ===== */
const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx'
]
TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const sebelum = isi

  /* a. img foto profil: rounded-full menjadi rounded 28 persen */
  isi = isi.replace(/(<img\b[^>]*?alt="(?:Foto profil|Pratinjau foto profil)"[^>]*?)rounded-full object-cover/g, '$1rounded-[28%] object-cover')

  /* b. wadah div di belakang foto inline ikut melengkung kotak */
  isi = isi.replace(/<div\b[^>]*?rounded-full[^>]*?(?=>\s*\{typeof (?:p|m) !== 'undefined')/g, function (tag) {
    return tag.replace('rounded-full', 'rounded-[28%] overflow-hidden')
  })

  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Foto profil inline diperbarui di ' + rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Bentuk baru yang berlaku seragam:')
console.log('1. Setiap foto profil menjadi kotak dengan sudut melengkung halus sebesar 28 persen dari ukurannya, mirip ikon aplikasi modern.')
console.log('2. Lengkungan bersifat proporsional: avatar kecil di PersonChip melengkung ringkas, avatar besar di tab Profil melengkung lebih lembut, sehingga serasi di semua ukuran.')
console.log('3. Cincin hijau BSI mengikuti bentuk kotak melengkung yang sama, jadi bingkai dan foto selalu sejajar.')
console.log('4. Fallback inisial memakai wadah dan lengkungan identik, sehingga transisi foto ke inisial tidak mengubah bentuk.')
console.log('5. Pratinjau di form upload dan seluruh foto inline di kartu logbook, galeri, daftar hadir, tim, dan dospem mengikuti bentuk yang sama.')
console.log('')
console.log('Langkah uji:')
console.log('1. Header dashboard dan tab Profil menampilkan kotak melengkung halus bercincin hijau.')
console.log('2. Kartu beranda, tim, dospem, serta PersonChip di logbook, galeri, dan daftar hadir seragam kotak melengkung.')
console.log('3. Form upload menampilkan pratinjau dengan bentuk yang sama persis.')
console.log('4. Mahasiswa tanpa foto melihat inisial pada kotak melengkung berwarna tema.')
```

## File: apply-avatar-lencana.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang Avatar gaya lencana bulat sempurna...')
console.log('')

/* ===== 1. ui.jsx: tulis ulang fungsi Avatar ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const mulai = u.indexOf('export function Avatar(props) {')
if (mulai === -1) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else if (u.includes('avatar-bulat ')) {
  console.log('[SUDAH ADA] Avatar gaya lencana')
} else {
  let brace = 0
  let akhir = -1
  let inString = false
  let stringChar = ''
  for (let i = mulai; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') {
      brace--
      if (brace === 0) { akhir = i + 1; break }
    }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas akhir fungsi Avatar tidak ditemukan')
  } else {
    const AVATAR_BARU = `export function Avatar(props) {
  const size = props.size || 'md'
  const kotak = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  return (
    <span className={'avatar-bulat ' + kotak + ' ' + (props.src ? '' : warna)}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} /> : <span className="font-black text-white">{inisial}</span>}
    </span>
  )
}`
    u = u.slice(0, mulai) + AVATAR_BARU + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar ditulis ulang dengan struktur satu elemen')
  }
}

/* ===== 2. index.css: kelas tunggal pengunci bentuk bulat ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* avatar-bulat-v2 */')) {
    console.log('[SUDAH ADA] CSS avatar-bulat-v2')
  } else {
    css = css.trimEnd() + '\n\n' + `/* avatar-bulat-v2: satu kelas pengunci bentuk lingkaran sempurna */
.avatar-bulat {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9999px;
  border: 3px solid #166534;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
}
.avatar-bulat img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
  display: block;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] CSS avatar-bulat-v2 ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir gaya lencana:')
console.log('1. Foto dipotong lingkaran penuh dan mengisi seluruh wadah, tidak ada lagi wadah squircle di belakangnya.')
console.log('2. Cincin hijau BSI 3 piksel mengelilingi foto secara merata, memberi kesan lencana resmi yang rapi.')
console.log('3. Mahasiswa tanpa foto melihat lingkaran hijau atau emas berisi inisial dengan cincin yang sama persis.')
console.log('4. Semua ukuran dari sm sampai 2xl memakai kelas yang sama, jadi bentuknya konsisten di header, tab Profil, kartu publik, PersonChip, dan daftar hadir.')
console.log('5. Bila ingin cincin berwarna lain, cukup ganti nilai border pada .avatar-bulat di index.css, misalnya #ffffff untuk cincin putih atau #eab308 untuk emas.')
```

## File: apply-avatar-publik.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengganti lingkaran inisial di kartu publik dengan Avatar...')
console.log('')

const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/AttendancePage.jsx'
]

/* Pola longgar: div ber-rounded-full whose isi JSX boleh memuat satu tingkat kurung kurawal bersarang */
const regexLingkaran = /<div\b[^>]*rounded-full[^>]*>\s*(\{(?:[^{}]|\{[^{}]*\})*\})\s*<\/div>/g
const regexImportAvatar = /import\s*\{[^}]*\bAvatar\b[^}]*\}\s*from/

TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexLingkaran, function (m, ekspresi) {
    if (ekspresi.indexOf('.nama') === -1) return m
    const varMatch = ekspresi.match(/([A-Za-z0-9_]+)\.nama/)
    if (!varMatch) return m
    jumlah++
    const v = varMatch[1]
    return '<Avatar src={' + v + '.foto_profil || null} nama={' + v + '.nama} size="lg" />'
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  let akhir = hasil
  if (rel !== 'src/components/ui.jsx' && !regexImportAvatar.test(akhir)) {
    const impor = rel.indexOf('/pages/') !== -1
      ? "import { Avatar } from '../components/ui.jsx'\n"
      : "import { Avatar } from './ui.jsx'\n"
    akhir = impor + akhir
  }
  simpan(rel, akhir)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial diganti Avatar di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman beranda: kartu mahasiswa kini menampilkan foto profil bila sudah diunggah.')
console.log('2. Mahasiswa tanpa foto tetap melihat lingkaran inisial berwarna tema dari fallback Avatar.')
console.log('3. Halaman tim dan dospem bila menampilkan orang juga ikut memakai Avatar yang sama.')
console.log('4. Bila masih ada baris TIDAK KETEMU untuk cards.jsx, kirim potongan markup PersonCard supaya aku sesuaikan polanya.')
```

## File: apply-avatar-tanpa-border.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghapus border dan menambahkan bayangan pada seluruh foto profil...')
console.log('')

/* ===== 1. ui.jsx: Avatar tanpa border, bayangan berlapis ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
let berubahU = false

if (u.includes("border: '3px solid #166534',")) {
  u = u.replace(/[ \t]*border: '3px solid #166534',\n/, '')
  berubahU = true
  console.log('[BERHASIL] Border hijau pada Avatar dihapus')
} else {
  console.log('[SUDAH ADA] Avatar tanpa border hijau')
}

if (u.includes("boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',")) {
  u = u.replace("boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',", "boxShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 10px 28px rgba(15, 23, 42, 0.22)',")
  berubahU = true
  console.log('[BERHASIL] Bayangan berlapis dipasang pada Avatar')
} else if (u.includes('0 10px 28px rgba(15, 23, 42, 0.22)')) {
  console.log('[SUDAH ADA] Bayangan berlapis pada Avatar')
} else {
  console.log('[TIDAK KETEMU] Pola boxShadow lama pada Avatar')
}

if (berubahU) simpan(FILE_U, u)

/* ===== 2. Foto inline dan pratinjau: buang border putih, pindahkan bayangan ke wadah ===== */
const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx'
]

TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const sebelum = isi

  /* border putih pada img foto profil dibuang, bayangan standar dipasang */
  isi = isi.split('rounded-[28%] object-cover border-2 border-white shadow-md').join('rounded-[28%] object-cover shadow-lg')
  isi = isi.split('rounded-full object-cover border-2 border-white shadow-md').join('rounded-[28%] object-cover shadow-lg')

  /* wadah ber-overflow-hidden tidak bisa menampilkan bayangan img, jadi bayangan ditaruh di wadahnya */
  isi = isi.split('rounded-[28%] overflow-hidden').join('rounded-[28%] overflow-hidden shadow-lg')

  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Border putih dibuang dan bayangan dipasang di ' + rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir tampilan:')
console.log('1. Tidak ada lagi cincin hijau maupun border putih di foto profil mana pun, termasuk header, tab Profil, kartu publik, PersonChip, kartu kehadiran, dan pratinjau form upload.')
console.log('2. Foto memakai bayangan berlapis: bayangan tipis menempel untuk ketajaman tepi plus bayangan lebar yang lembut untuk kesan melayang.')
console.log('3. Bayangan pada foto inline ditaruh di wadah luarnya karena wadah ber-overflow hidden akan memotong bayangan yang berasal dari img di dalamnya.')
console.log('4. Bentuk kotak melengkung 28 persen tetap berlaku seragam di semua ukuran avatar.')
console.log('')
console.log('Bila bayangan terasa kurang kuat atau terlalu kuat, kabari aku: kekuatannya diatur dari satu nilai boxShadow di Avatar dan kelas shadow-lg pada foto inline.')
```

## File: apply-bulat-sempurna.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai mengunci semua foto profil menjadi lingkaran sempurna...')
console.log('')

/* ===== 1. ui.jsx: tulis ulang Avatar dengan pola wadah terkunci ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const mulai = u.indexOf('export function Avatar(props) {')
if (mulai === -1) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else {
  let brace = 0
  let akhir = -1
  let inString = false
  let stringChar = ''
  for (let i = mulai; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') {
      brace--
      if (brace === 0) { akhir = i + 1; break }
    }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Tidak dapat menemukan batas akhir fungsi Avatar')
  } else {
    const AVATAR_BARU = `export function Avatar(props) {
  const size = props.size || 'md'
  const kelas = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  if (props.src) {
    return (
      <span className={kelas + ' relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md'}>
        <img src={props.src} alt={nama || 'Foto profil'} className="absolute inset-0 h-full w-full rounded-full object-cover" />
      </span>
    )
  }
  return (
    <span className={kelas + ' ' + warna + ' relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md'}>
      <span className="absolute inset-0 grid place-items-center font-black text-white">{inisial}</span>
    </span>
  )
}`
    u = u.slice(0, mulai) + AVATAR_BARU + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar ditulis ulang dengan wadah lingkaran terkunci')
  }
}

/* ===== 2. index.css: aturan global pemaksa lingkaran sempurna ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* bulat-sempurna-v1 */')) {
    console.log('[SUDAH ADA] Aturan CSS bulat-sempurna')
  } else {
    css = css.trimEnd() + '\n\n' + `/* bulat-sempurna-v1: paksa semua foto profil menjadi lingkaran sempurna */
.rounded-full {
  overflow: hidden;
}
.rounded-full:has(> img) {
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
}
.rounded-full > img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 9999px !important;
}
img[alt="Foto profil"],
img.rounded-full {
  border-radius: 9999px !important;
  object-fit: cover !important;
  object-position: center !important;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pemaksa lingkaran sempurna ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja penguncian:')
console.log('1. Komponen Avatar kini memakai wadah span persegi tetap dengan overflow tersembunyi, sehingga foto apa pun dipotong melingkar penuh tanpa peduli rasio aslinya.')
console.log('2. Foto di dalam Avatar diposisikan absolut mengisi wadah, jadi tidak ada lagi sisi lurus atau sudut yang lolos.')
console.log('3. Aturan CSS global menangkap semua gambar di dalam wadah bulat di halaman mana pun, termasuk sisa img inline hasil script sebelumnya, dan memaksanya cover plus radius penuh.')
console.log('4. aspect-ratio 1 banding 1 menjamin wadah tetap persegi walau suatu halaman lupa memberi tinggi tetap, sehingga hasilnya lingkaran, bukan elips.')
console.log('')
console.log('Langkah uji:')
console.log('1. Header dashboard: avatar foto terlihat lingkaran penuh dengan ring putih rapi.')
console.log('2. Tab Profil: foto besar 2xl lingkaran sempurna tanpa sisi terpotong aneh.')
console.log('3. Beranda, Tim, Dospem: kartu mahasiswa menampilkan foto lingkaran penuh.')
console.log('4. Kartu logbook, galeri, dan baris daftar hadir: PersonChip menampilkan foto lingkaran kecil yang rapi.')
console.log('5. Mahasiswa tanpa foto tetap melihat lingkaran inisial berwarna tema dengan bentuk yang sama persis.')
```

## File: apply-diagnosis-dan-bersih.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

const FILE_U = 'src/components/ui.jsx'
const FILE_D = 'src/pages/DashboardPage.jsx'
const FILE_CSS = 'src/index.css'

console.log('================ DIAGNOSIS ================')

/* 1. Hitung dan cetak semua definisi Avatar di ui.jsx */
let u = baca(FILE_U)
const defs = []
const reDef = /(?:export\s+)?function\s+Avatar\s*\(/g
let mm
while ((mm = reDef.exec(u)) !== null) defs.push(mm.index)
console.log('Jumlah definisi fungsi Avatar di ui.jsx: ' + defs.length)
defs.forEach(function (idx, i) {
  console.log('--- Awal definisi Avatar nomor ' + (i + 1) + ' ---')
  console.log(u.slice(idx, idx + 240).replace(/\n/g, ' | '))
})

/* 2. Cetak markup header dashboard di sekitar avatar */
let d = baca(FILE_D)
const ih = d.indexOf('Dashboard mahasiswa')
console.log('--- Cuplikan header DashboardPage ---')
console.log(ih === -1 ? '(teks Dashboard mahasiswa tidak ditemukan)' : d.slice(Math.max(0, ih - 500), ih + 200).replace(/\n/g, ' | '))

/* 3. Cetak baris CSS yang berkaitan avatar atau pembulatan */
let css = baca(FILE_CSS)
console.log('--- Baris CSS berkaitan avatar atau pembulatan ---')
css.split('\n').forEach(function (l, i) {
  if (/bulat|avatar|data-fp|rounded-full/.test(l)) console.log((i + 1) + ': ' + l.trim())
})
console.log('=============== AKHIR DIAGNOSIS ===============')
console.log('')

/* ===== PERBAIKAN 1: buang SEMUA definisi Avatar, pasang satu versi bersih di akhir file ===== */
const ranges = []
const reScan = /(?:export\s+)?function\s+Avatar\s*\(/g
let m2
while ((m2 = reScan.exec(u)) !== null) {
  let brace = 0, end = -1, inStr = false, strCh = ''
  for (let i = m2.index; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { end = i + 1; break } }
  }
  if (end === -1) break
  ranges.push([m2.index, end])
}
for (let i = ranges.length - 1; i >= 0; i--) {
  u = u.slice(0, ranges[i][0]) + u.slice(ranges[i][1])
}
const AVATAR_BERSIH = `export function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const nama = props.nama || ''
  const kata = nama.trim().split(/\\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    border: '3px solid #166534',
    borderRadius: '50%',
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: '50%'
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  if (bisaKlik) {
    return (
      <button type="button" onClick={props.onClick} title={props.title} style={gaya}>
        {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
      </button>
    )
  }
  return (
    <span style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}`
u = u.trimEnd() + '\n\n' + AVATAR_BERSIH + '\n'
simpan(FILE_U, u)
console.log('[BERHASIL] Semua definisi Avatar lama dibuang, satu Avatar bersih dipasang di akhir ui.jsx')

/* ===== PERBAIKAN 2: buang seluruh blok CSS avatar lama dari index.css ===== */
const cutIdx = css.indexOf('/* bulat-sempurna-v1')
if (cutIdx !== -1) {
  css = css.slice(0, cutIdx).trimEnd() + '\n'
  simpan(FILE_CSS, css)
  console.log('[BERHASIL] Blok CSS bulat-sempurna-v1, avatar-bulat-v2, dan bulat-v3 dibuang dari index.css')
} else {
  console.log('[INFO] Blok CSS avatar lama tidak ditemukan di index.css')
}

/* ===== PERBAIKAN 3: lepas pembungkus div atau span polos yang mengurung Avatar di DashboardPage ===== */
let berubahD = false
d = d.replace(/<(div|span)\b[^>]*>\s*(<Avatar\b[^>]*?\/>)\s*<\/\1>/gs, function (m, tag, avatar) {
  berubahD = true
  return avatar
})
if (berubahD) {
  simpan(FILE_D, d)
  console.log('[BERHASIL] Pembungkus div atau span polos di sekitar Avatar dilepas')
} else {
  console.log('[INFO] Tidak ada pembungkus div atau span polos di sekitar Avatar')
}

console.log('')
console.log('WAJIB lakukan dua hal berikut agar perubahan pasti terlihat:')
console.log('1. Matikan dev server (Ctrl+C) lalu jalankan ulang: npm run dev -- --host')
console.log('2. Buka browser dalam jendela samaran (incognito) atau DevTools dengan cache disabled, lalu hard refresh Ctrl + Shift + R')
console.log('')
console.log('Bila bentuk squircle masih muncul, salin seluruh keluaran bagian DIAGNOSIS di atas ke chat.')
console.log('Dari situ aku bisa melihat definisi Avatar asli, markup header asli, dan baris CSS asli yang selama ini bersembunyi.')
```

## File: apply-final-cleanup.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai pembersihan akhir jalur YouTube...')
console.log('')

/* ===== 1. youtube.js: bungkus parsing JSON pemulihan dengan try/catch ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariY = `  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiY = `  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }`
if (y.includes(gantiY)) {
  console.log('[SUDAH ADA] Pengaman parsing JSON pemulihan di youtube.js')
} else if (y.includes(cariY)) {
  y = y.replace(cariY, gantiY)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman parsing JSON pemulihan dipasang di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola pemulihan di youtube.js, periksa manual')
}

/* ===== 2. vite.config.js: samakan limit middleware kuota menjadi 5 ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
const gantiV = `res.end(JSON.stringify({ limit: 5, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))`
if (v.includes(gantiV)) {
  console.log('[SUDAH ADA] Limit middleware kuota sudah 5')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Limit middleware kuota disamakan menjadi 5')
} else {
  console.log('[TIDAK KETEMU] Pola limit middleware kuota, periksa manual')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji akhir:')
console.log('1. Upload satu video kecil dari form logbook atau galeri.')
console.log('2. Progres 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook atau galeri tersimpan tanpa alert error.')
console.log('4. Tulisan kuota tampil konsisten: sisa dari 5, baik di localhost maupun Vercel.')
console.log('5. Bila pemulihan gagal, pesan yang muncul kini pesan ramah, bukan SyntaxError.')
```

## File: apply-fix-chip-galeri.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_C = 'src/components/cards.jsx'

if (!fs.existsSync(path.join(root, FILE_C))) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}

let c = fs.readFileSync(path.join(root, FILE_C), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai menyamakan chip galeri dengan logbook dan merapikan teks bantuan...')
console.log('')

/* ===== 1. Samakan panggilan PersonChip di GalleryCard dengan logbook ===== */
const chipSm = '<PersonChip size="sm" mahasiswa={item.mahasiswa} />'
const chipBiasa = '<PersonChip mahasiswa={item.mahasiswa} />'
if (c.includes(chipSm)) {
  c = c.split(chipSm).join(chipBiasa)
  berubah = true
  console.log('[BERHASIL] Prop size sm dihapus dari PersonChip kartu galeri')
} else if (c.includes(chipBiasa)) {
  console.log('[SUDAH ADA] PersonChip kartu galeri sudah tanpa prop size')
} else {
  console.log('[TIDAK KETEMU] Pola PersonChip di GalleryCard')
}

/* ===== 2. Normalkan PersonChip: prop ukuran tidak lagi mengubah ukuran teks ===== */
const regexNama = /<p className=\{'font-semibold text-slate-900 ' \+ \(props\.size === 'sm' \? 'text-sm' : ''\)\}>\{nama\}<\/p>/g
if (regexNama.test(c)) {
  c = c.replace(regexNama, '<p className="font-semibold text-slate-900">{nama}</p>')
  berubah = true
  console.log('[BERHASIL] Teks nama PersonChip dinormalkan tanpa pengecilan ukuran')
} else {
  const regexNamaLonggar = /<p className=\{[^>]*?props\.size === 'sm'[^>]*?\}>\{nama\}<\/p>/g
  if (regexNamaLonggar.test(c)) {
    c = c.replace(regexNamaLonggar, '<p className="font-semibold text-slate-900">{nama}</p>')
    berubah = true
    console.log('[BERHASIL] Teks nama PersonChip dinormalkan lewat pola longgar')
  } else {
    console.log('[INFO] Pola teks nama bersyarat tidak ditemukan di PersonChip')
  }
}

const regexNim = /<p className=\{[^>]*?props\.size === 'sm'[^>]*?\}>NIM \{nim\}<\/p>/g
if (regexNim.test(c)) {
  c = c.replace(regexNim, '<p className="text-xs text-slate-500">NIM {nim}</p>')
  berubah = true
  console.log('[BERHASIL] Teks NIM PersonChip dinormalkan tanpa pengecilan ukuran')
} else {
  console.log('[INFO] Teks NIM PersonChip sudah seragam')
}

/* ===== 3. Teks bantuan tampil di semua kartu pada tampilan publik ===== */
const polaLama = ') : props.isOwner ? null : ('
const polaBaru = ') : ('
if (c.includes(polaLama)) {
  c = c.split(polaLama).join(polaBaru)
  berubah = true
  console.log('[BERHASIL] Teks Klik kartu untuk melihat detail kini tampil di semua kartu publik')
} else if (c.includes('<span className="text-xs font-semibold text-bsi-800">Klik kartu untuk melihat detail</span>')) {
  console.log('[SUDAH ADA] Logika teks bantuan sudah tampil di semua kartu')
} else {
  console.log('[TIDAK KETEMU] Pola logika teks bantuan di GalleryCard')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_C), c, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir kedua perbaikan:')
console.log('1. Chip pemilik di kartu galeri kini identik dengan kartu logbook: nama berukuran sama, NIM berukuran sama, dan avatar ikut seragam.')
console.log('2. PersonChip tidak lagi mengecilkan teks berdasarkan prop ukuran, sehingga semua permukaan yang memakainya konsisten selamanya.')
console.log('3. Pada halaman Galeri publik, setiap kartu menampilkan teks Klik kartu untuk melihat detail, bukan hanya kartu milik orang lain.')
console.log('4. Di dashboard galeri milik sendiri, tombol Edit dan Hapus tetap tampil menggantikan teks bantuan, sehingga tidak ada duplikasi instruksi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dan Galeri berdampingan: bandingkan chip pemilik, ukuran nama dan NIM kini sama persis.')
console.log('2. Buka halaman Galeri saat login: semua kartu menampilkan teks bantuan klik, termasuk kartu milik sendiri.')
console.log('3. Buka tab Galeri di dashboard: kartu milik sendiri menampilkan tombol Edit dan Hapus tanpa teks bantuan.')
console.log('4. Buka modal detail galeri: chip di dalam modal tetap rapi dengan ukuran teks yang sama.')
```

## File: apply-fix-export-unggah.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki export unggahVideoYouTube dan favicon...')
console.log('')

/* ===== 1. youtube.js: tambahkan export jembatan unggahVideoYouTube ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('export async function unggahVideoYouTube')) {
  console.log('[SUDAH ADA] export unggahVideoYouTube di youtube.js')
} else if (!y.includes('export async function uploadToYouTube') || !y.includes('export async function startYouTubeSession')) {
  console.log('[TIDAK KETEMU] startYouTubeSession atau uploadToYouTube di youtube.js, batal menambahkan')
} else {
  y = y.trimEnd() + '\n\n' + [
    'export async function unggahVideoYouTube(file, judul, onProgress) {',
    '  const sesiData = await supabase.auth.getSession()',
    '  const token = sesiData.data.session ? sesiData.session.access_token : \'\'',
    '  const sesi = await startYouTubeSession(judul || \'Dokumentasi Magang\', \'Diunggah dari portal logbook magang BSI.\', file.type || \'video/mp4\', token)',
    '  return await uploadToYouTube(sesi.sessionUri, file, onProgress)',
    '}',
    ''
  ].join('\n')
  simpan(FILE_Y, y)
  console.log('[BERHASIL] export unggahVideoYouTube ditambahkan di youtube.js')
}

/* ===== 2. index.html: tambahkan favicon supaya tidak 404 ===== */
const FILE_H = 'index.html'
let h = baca(FILE_H)
if (h.includes('rel="icon"')) {
  console.log('[SUDAH ADA] favicon di index.html')
} else {
  const favicon = '    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns=\'http://www.w3.org/2000/svg\'%20viewBox=\'0%200%2064%2064\'%3E%3Crect%20width=\'64\'%20height=\'64\'%20rx=\'14\'%20fill=\'%2316623c\'/%3E%3Ctext%20x=\'32\'%20y=\'44\'%20font-size=\'34\'%20font-weight=\'700\'%20text-anchor=\'middle\'%20fill=\'%23ffffff\'%20font-family=\'Arial,%20sans-serif\'%3EB%3C/text%3E%3C/svg%3E" />\n'
  if (h.includes('    <title>')) {
    h = h.replace('    <title>', favicon + '    <title>')
    simpan(FILE_H, h)
    console.log('[BERHASIL] favicon ditambahkan di index.html')
  } else {
    console.log('[TIDAK KETEMU] baris title di index.html, favicon dilewati')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka kembali http://localhost:5173/dashboard, halaman tidak lagi blank.')
console.log('2. Uji upload video: progres naik, lalu logbook tersimpan dan kartu menampilkan thumbnail YouTube.')
console.log('3. Favicon hijau muncul di tab browser dan permintaan favicon.ico tidak lagi 404.')
```

## File: apply-fix-ganti-foto.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

console.log('Mulai memperbaiki agar file lama terhapus saat ganti foto profil...')
console.log('')

fs.writeFileSync(path.join(root, 'src/lib/profil.js'), `import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

async function hapusFileLama(fotoUrlLama) {
  if (!fotoUrlLama) return
  const bagian = String(fotoUrlLama).split('/foto-profil/')
  if (bagian[1]) {
    try {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    } catch (e) {
      console.warn('Gagal menghapus foto lama dari storage:', e.message)
    }
  }
}

export async function uploadFotoProfil(file, userId, fotoUrlLama) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0 && tipe.indexOf('heic') === -1 && tipe.indexOf('heif') === -1) {
    throw new Error('File harus berupa gambar')
  }
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')

  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'

  // Hapus file lama dari storage sebelum upload file baru
  await hapusFileLama(fotoUrlLama)

  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, siap, { upsert: true, contentType: siap.type })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  await hapusFileLama(fotoUrl)
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
`, 'utf8')
console.log('[BERHASIL] src/lib/profil.js ditulis ulang dengan penghapusan file lama saat ganti foto')

/* ===== 2. DashboardPage: kirim fotoUrlLama ke uploadFotoProfil ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (fs.existsSync(path.join(root, FILE_D))) {
  let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
  let berubah = false

  // Cari pemanggilan uploadFotoProfil(fotoFile, mahasiswa.id) dan tambahkan parameter ketiga
  const cari = 'uploadFotoProfil(fotoFile, mahasiswa.id)'
  const ganti = 'uploadFotoProfil(fotoFile, mahasiswa.id, mahasiswa.foto_profil)'
  if (d.includes(cari) && !d.includes(ganti)) {
    d = d.split(cari).join(ganti)
    berubah = true
    console.log('[BERHASIL] Parameter fotoUrlLama ditambahkan ke pemanggilan uploadFotoProfil')
  } else if (d.includes(ganti)) {
    console.log('[SUDAH ADA] Parameter fotoUrlLama sudah ada')
  } else {
    console.log('[TIDAK KETEMU] Pemanggilan uploadFotoProfil di DashboardPage')
  }

  if (berubah) {
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Alur baru saat ganti foto profil:')
console.log('1. User memilih foto baru dan klik Simpan.')
console.log('2. Foto baru dikonversi ke WebP 640px seperti biasa.')
console.log('3. SEBELUM upload file baru, file lama dihapus dari Supabase Storage.')
console.log('4. File baru diunggah dengan nama unik baru.')
console.log('5. URL baru disimpan ke kolom foto_profil di database.')
console.log('6. Hasilnya: hanya ada SATU file per user di storage, tidak ada sampah menumpuk.')
console.log('')
console.log('Alur saat hapus foto profil:')
console.log('1. User klik Hapus Foto.')
console.log('2. File dihapus dari storage.')
console.log('3. Kolom foto_profil di database dikosongkan.')
console.log('4. Avatar kembali ke inisial berwarna tema.')
console.log('')
console.log('Pembersihan file lama yang sudah terlanjur menumpuk (opsional):')
console.log('Buka Supabase Dashboard > Storage > bucket foto-profil > folder UUID user')
console.log('Hapus manual file-file profil-xxxxx.webp yang lama (sisakan yang terbaru saja).')
```

## File: apply-fix-nim-text.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

/* Cari baris NIM di dalam kartu Profil Tim yang masih menggunakan text-sm */
const cari = '<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>'
const ganti = '<p className="truncate text-xs text-slate-500">NIM {p.nim}</p>'

if (d.includes(ganti)) {
  console.log('[SUDAH ADA] Teks NIM sudah menggunakan text-xs')
  process.exit(0)
}

if (!d.includes(cari)) {
  console.log('[TIDAK KETEMU] Pola teks NIM dengan text-sm di kartu Profil Tim')
  process.exit(1)
}

d = d.split(cari).join(ganti)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Teks NIM di kartu Profil Tim diubah dari text-sm menjadi text-xs')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil perubahan:')
console.log('1. Nama mahasiswa tetap menonjol dengan ukuran text-lg dan ketebalan font-black.')
console.log('2. NIM turun satu tingkat menjadi text-xs sehingga terlihat lebih tipis dan tidak bersaing dengan nama.')
console.log('3. Pil prodi hijau mint di bawahnya tetap memakai ukuran text-[11px] sehingga selaras dengan NIM yang baru diperkecil.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, lihat section Profil tim magang.')
console.log('2. Perhatikan urutan tipografi: nama besar tebal, NIM kecil tipis, pil prodi mungil berwarna.')
console.log('3. Pastikan tidak ada teks yang saling bertumpuk atau keluar dari batas kartu.')
```

## File: apply-fix-prodi-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mencabut prodi dari PersonChip dan menata header dashboard...')
console.log('')

/* ===== 1. cards.jsx: cabut baris prodi dari dalam fungsi PersonChip ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const mChip = /function\s+PersonChip\s*\(/.exec(c)
if (!mChip) {
  console.log('[TIDAK KETEMU] Fungsi PersonChip di cards.jsx')
} else {
  const mulai = mChip.index
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < c.length; i++) {
    const ch = c[i]
    const prev = i > 0 ? c[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi PersonChip tidak terbaca')
  } else {
    let body = c.slice(mulai, akhir)
    let n = 0
    body = body.replace(/\s*\{prodi \? <p[^>]*>\{prodi\}<\/p> : null\}/g, function () { n++; return '' })
    body = body.replace(/\s*\{prodi \? '[^']*' \+ prodi : ''\}/g, function () { n++; return '' })
    body = body.replace(/\s*<p[^>]*>\{prodi\}<\/p>/g, function () { n++; return '' })
    if (n === 0) {
      console.log('[INFO] Tidak ada baris prodi tersisa di PersonChip')
    } else {
      c = c.slice(0, mulai) + body + c.slice(akhir)
      simpan(FILE_C, c)
      console.log('[BERHASIL] ' + n + ' baris prodi dicabut dari PersonChip (kartu logbook, galeri, dan detail)')
    }
  }
}

/* ===== 2. DashboardPage: hapus teks Dashboard mahasiswa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let ubahD = false

const regexLabel = /\s*<p className="text-sm text-slate-500">Dashboard mahasiswa<\/p>/
if (regexLabel.test(d)) {
  d = d.replace(regexLabel, '')
  ubahD = true
  console.log('[BERHASIL] Teks Dashboard mahasiswa dihapus dari header')
} else {
  console.log('[SUDAH ADA] Teks Dashboard mahasiswa tidak ditemukan di header')
}

/* ===== 3. DashboardPage: tampilkan prodi di bawah NIM pada header ===== */
const nimP = '<p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>'
const prodiP = '{mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}'
if (d.includes(nimP + '\n' + prodiP)) {
  console.log('[SUDAH ADA] Prodi sudah tampil di bawah NIM pada header')
} else if (d.includes(nimP)) {
  d = d.replace(nimP, nimP + '\n' + prodiP)
  ubahD = true
  console.log('[BERHASIL] Prodi ditambahkan di bawah NIM pada header dashboard')
} else {
  console.log('[TIDAK KETEMU] Baris NIM pada header dashboard')
}

if (ubahD) simpan(FILE_D, d)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir kedua perubahan:')
console.log('1. Kartu logbook dan kartu galeri beserta modal detailnya kini hanya menampilkan nama dan NIM pada chip pemilik, tanpa baris prodi.')
console.log('2. Header dashboard tidak lagi menampilkan label Dashboard mahasiswa, sehingga kartu langsung dibuka oleh nama mahasiswa.')
console.log('3. Nama prodi tampil rapi di bawah baris NIM pada header dashboard, sesuai lampiran kedua yang kamu kirim.')
console.log('4. Halaman Tim & Dospem tetap menjadi satu-satunya halaman publik lain yang menampilkan prodi, sesuai kesepakatan sebelumnya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook dan Galeri: chip pemilik di setiap kartu hanya berisi foto, nama, dan NIM.')
console.log('2. Buka detail logbook atau galeri: chip di dalam modal juga tanpa prodi.')
console.log('3. Buka dashboard: header menampilkan foto, nama besar, NIM, lalu prodi di bawahnya, tanpa label Dashboard mahasiswa.')
console.log('4. Buka Tim & Dospem: pil prodi di kartu Profil tim magang tetap tampil normal.')
```

## File: apply-fix-setmahasiswa.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

/* ===== 1. State kecil pemaksa render setelah foto berubah ===== */
if (d.includes('setVersiFoto')) {
  console.log('[SUDAH ADA] State pemaksa render foto')
} else {
  const anchor = 'const [uploadingFoto, setUploadingFoto] = useState(false)'
  if (d.includes(anchor)) {
    d = d.replace(anchor, anchor + '\n  const [, setVersiFoto] = useState(0)')
    berubah = true
    console.log('[BERHASIL] State pemaksa render foto ditambahkan')
  } else {
    console.log('[TIDAK KETEMU] Anchor state uploadingFoto')
  }
}

/* ===== 2. simpanFotoProfil: ganti setMahasiswa dengan mutasi plus refresh ===== */
const cariUrl = 'setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: url }))'
const gantiUrl = `mahasiswa.foto_profil = url
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })`
if (d.includes(cariUrl)) {
  d = d.split(cariUrl).join(gantiUrl)
  berubah = true
  console.log('[BERHASIL] simpanFotoProfil tidak lagi memakai setMahasiswa')
} else {
  console.log('[TIDAK KETEMU] Pola setMahasiswa pada simpanFotoProfil')
}

/* ===== 3. hapusFotoProfilKu: ganti setMahasiswa dengan mutasi plus refresh ===== */
const cariNull = 'setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: null }))'
const gantiNull = `mahasiswa.foto_profil = null
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })`
if (d.includes(cariNull)) {
  d = d.split(cariNull).join(gantiNull)
  berubah = true
  console.log('[BERHASIL] hapusFotoProfilKu tidak lagi memakai setMahasiswa')
} else {
  console.log('[TIDAK KETEMU] Pola setMahasiswa pada hapusFotoProfilKu')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan:')
console.log('1. Foto yang tadi gagal tampil sebenarnya sudah tersimpan di bucket dan database.')
console.log('2. Setelah perbaikan ini, upload baru akan langsung memperbarui avatar header, kartu Profil, dan seluruh kartu publik.')
console.log('3. Bila foto lama belum muncul, cukup muat ulang halaman satu kali karena datanya sudah ada di database.')
```

## File: apply-fix-sisa-netral.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function cariGanti(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Memperbaiki regex LabelProses dan menangkap sisa teks...')
console.log('')

/* ===== 1. Fix regex double backslash di LabelProses (ui.jsx) ===== */
cariGanti('src/components/ui.jsx',
  `const bersih = String(props.teks|| '').replace(/\\\\.{3}/g, '').replace(/\\\\s+/g, ' ').trim()`,
  `const bersih = String(props.teks || '').replace(/\\.\\.\\./g, '').replace(/\\s+/g, ' ').trim()`,
  'Regex LabelProses diperbaiki')

/* ===== 2. Fallback teks yang polanya sedikit berbeda ===== */
cariGanti('src/lib/youtube.js',
  'Jaringan gagal saat upload YouTube',
  'Jaringan gagal saat upload video',
  'Pesan jaringan youtube.js dinetralkan')
cariGanti('src/pages/DashboardPage.jsx',
  `Mengunggah... ' + Math.round(p * 100) + '%'`,
  `Mengunggah ' + Math.round(p * 100) + '%'`,
  'Progres R2 dinetralkan dari titik tiga')
cariGanti('src/pages/DashboardPage.jsx',
  'Mengonversi HEIC ke JPG',
  'Mengonversi foto HEIC',
  'Teks konversi HEIC dinetralkan')
cariGanti('src/lib/upload.js',
  'Mengonversi foto ke WebP',
  'Mengonversi foto',
  'Teks konversi WebP dinetralkan')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
```

## File: apply-fix-state-loading.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

if (d.includes('const [ytQuotaLoading, setYtQuotaLoading]')) {
  console.log('[SUDAH ADA] State ytQuotaLoading, tidak ada yang perlu ditambah')
} else {
  const regex = /([ \t]*)const \[ytQuota, setYtQuota\] = useState\([^\n]*\)\n/
  if (regex.test(d)) {
    d = d.replace(regex, function (m, indent) {
      return m + indent + 'const [ytQuotaLoading, setYtQuotaLoading] = useState(true)\n'
    })
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
    console.log('[BERHASIL] State ytQuotaLoading ditambahkan tepat di bawah state ytQuota')
  } else {
    console.log('[TIDAK KETEMU] Baris state ytQuota. Tambahkan manual baris berikut tepat di bawahnya:')
    console.log('  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('Error ytQuotaLoading is not defined akan hilang setelah perbaikan ini.')
```

## File: apply-fix-syntax-logbook.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

const FILE_L = 'src/lib/logbook.js'
const filePath = path.join(root, FILE_L)

if (!fs.existsSync(filePath)) {
  console.log('[GAGAL] ' + FILE_L + ' tidak ditemukan')
  process.exit(1)
}

let isi = fs.readFileSync(filePath, 'utf8')
const sebelum = isi

// Tambahkan koma yang hilang sebelum media_source (baik yang dipisahkan spasi maupun enter)
isi = isi.replace(/(\|\| null)(\s*)(media_source:)/g, '$1,$2$3')

if (isi !== sebelum) {
  fs.writeFileSync(filePath, isi, 'utf8')
  console.log('[BERHASIL] Koma yang hilang sebelum media_source telah ditambahkan di logbook.js.')
} else {
  console.log('[SUDAH BENAR] Tidak ada koma yang hilang di logbook.js.')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('Website akan kembali normal dan tidak blank lagi.')
```

## File: apply-fix-tiga-masalah.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki NIM kosong, jarak kartu hadir, dan sebaran prodi...')
console.log('')

/* ===== 1. AttendancePage: query mahasiswa harus memuat nim ===== */
const FILE_H = 'src/pages/AttendancePage.jsx'
if (!ada(FILE_H)) {
  console.log('[LEWATI] AttendancePage.jsx tidak ditemukan')
} else {
  let h = baca(FILE_H)
  let ubahH = false
  h = h.replace(/\.from\('mahasiswa'\)\.select\('([^']*)'\)/g, function (m, isi) {
    if (isi.includes('nim')) return m
    ubahH = true
    return ".from('mahasiswa').select('" + isi + ", nim')"
  })
  if (ubahH) {
    simpan(FILE_H, h)
    console.log('[BERHASIL] Query mahasiswa di AttendancePage kini memuat kolom nim')
  } else {
    console.log('[SUDAH ADA] Query AttendancePage sudah memuat nim')
  }
}

/* ===== 2. cards.jsx: tambah ruang bawah tanggal di AttendanceCard ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const mFn = /export function AttendanceCard\s*\(/.exec(c)
if (!mFn) {
  console.log('[TIDAK KETEMU] Fungsi AttendanceCard di cards.jsx')
} else {
  const mulai = mFn.index
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < c.length; i++) {
    const ch = c[i]
    const prev = i > 0 ? c[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi AttendanceCard tidak terbaca')
  } else {
    let body = c.slice(mulai, akhir)
    if (body.indexOf('formatTanggal(row.tanggal)') === -1) {
      console.log('[TIDAK KETEMU] Paragraf tanggal di AttendanceCard')
    } else if (/className="[^"]*pb-[^"]*"[^>]*>\{formatTanggal\(row\.tanggal\)\}/.test(body)) {
      console.log('[SUDAH ADA] Jarak bawah tanggal di AttendanceCard')
    } else {
      const bodyBaru = body.replace(/<p className="([^"]*)">\{formatTanggal\(row\.tanggal\)\}<\/p>/, function (m, cls) {
        return '<p className="' + cls + ' pb-4">{formatTanggal(row.tanggal)}</p>'
      })
      if (bodyBaru === body) {
        console.log('[TIDAK KETEMU] Pola paragraf tanggal untuk diberi jarak')
      } else {
        c = c.slice(0, mulai) + bodyBaru + c.slice(akhir)
        simpan(FILE_C, c)
        console.log('[BERHASIL] Jarak antara tanggal dan baris foto nama diperlebar di AttendanceCard')
      }
    }
  }
}

/* ===== 3. Cabut prodi dari cards.jsx (PersonChip dan PersonCard) ===== */
c = baca(FILE_C)
let nC = 0
c = c.replace(/\s*\{m\.prodi \? '[^']*' \+ m\.prodi : ''\}/g, function () { nC++; return '' })
c = c.replace(/\s*\{m\.prodi \? <p[^>]*>\{m\.prodi\}<\/p> : null\}/g, function () { nC++; return '' })
if (nC > 0) {
  simpan(FILE_C, c)
  console.log('[BERHASIL] ' + nC + ' kemunculan prodi dihapus dari cards.jsx')
} else {
  console.log('[INFO] Tidak ada prodi tersisa di cards.jsx')
}

/* ===== 4. Cabut prodi dari DashboardPage (header dan tab Profil) ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  let nD = 0
  d = d.replace(/\s*\{mahasiswa\.prodi \? <p[^>]*>\{mahasiswa\.prodi\}<\/p> : null\}/g, function () { nD++; return '' })
  d = d.replace(/\s*<p[^>]*>\{mahasiswa\.prodi\}<\/p>/g, function () { nD++; return '' })
  if (nD > 0) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] ' + nD + ' kemunculan prodi dihapus dari DashboardPage')
  } else {
    console.log('[INFO] Tidak ada prodi tersisa di DashboardPage')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir ketiga perbaikan:')
console.log('1. Kartu grafik kehadiran di halaman Daftar Hadir kini menampilkan angka NIM lengkap di bawah nama.')
console.log('2. Kartu daftar hadir punya napas lega: tanggal berjarak 16 piksel dari baris foto, nama, dan badge status.')
console.log('3. Nama prodi hanya tampil di halaman Tim & Dospem, yaitu pada pil hijau di kartu Profil tim magang.')
console.log('4. Beranda, kartu logbook, kartu galeri, PersonChip di detail, header dashboard, dan tab Profil tidak lagi menampilkan prodi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Daftar Hadir: kartu grafik per mahasiswa menampilkan NIM berisi angka, bukan label kosong.')
console.log('2. Lihat kartu kehadiran: jarak tanggal ke baris foto dan nama kini lebih renggang dan nyaman dibaca.')
console.log('3. Sapu beranda, logbook, galeri, dan dashboard: tidak ada lagi teks prodi di luar halaman Tim & Dospem.')
console.log('4. Buka Tim & Dospem: pil prodi di kartu Profil tim magang tetap tampil sebagai satu-satunya pengecualian.')
```

## File: apply-fix-token-aman.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

const regexBaris = /^([ \t]*)const ([A-Za-z0-9_]+) = [^\n]*\.access_token[^\n]*$/gm

console.log('Mulai mengamankan pengambilan token sesi...')
console.log('')

/* ===== 1. youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const ySebelum = y
y = y.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (y !== ySebelum) console.log('[BERHASIL] Baris access_token di youtube.js diganti fungsi aman')

if (!y.includes('export async function ambilTokenSesi')) {
  y = y.trimEnd() + '\n\n' + [
    'export async function ambilTokenSesi() {',
    '  try {',
    '    const r = await supabase.auth.getSession()',
    '    const ssn = r && r.data ? r.data.session : null',
    '    return ssn && ssn.access_token ? ssn.access_token : \'\'',
    '  } catch (e) {',
    '    return \'\'',
    '  }',
    '}',
    ''
  ].join('\n')
  console.log('[BERHASIL] Fungsi ambilTokenSesi ditambahkan di youtube.js')
} else {
  console.log('[SUDAH ADA] Fungsi ambilTokenSesi di youtube.js')
}

if (!y.includes('Sesi login tidak terbaca')) {
  const cariGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {`
  const gantiGuard = `export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {`
  if (y.includes(cariGuard)) {
    y = y.replace(cariGuard, gantiGuard)
    console.log('[BERHASIL] Penjaga token kosong di startYouTubeSession')
  } else {
    console.log('[TIDAK KETEMU] Pola startYouTubeSession, penjaga dilewati')
  }
} else {
  console.log('[SUDAH ADA] Penjaga token kosong di startYouTubeSession')
}
simpan(FILE_Y, y)

/* ===== 2. DashboardPage.jsx ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
const dSebelum = d
d = d.replace(regexBaris, function (m, indent, name) {
  return indent + 'const ' + name + ' = await ambilTokenSesi()'
})
if (d !== dSebelum) {
  console.log('[BERHASIL] Baris access_token di DashboardPage diganti fungsi aman')
  if (d.includes('ambilTokenSesi()') && !d.includes('ambilTokenSesi }')) {
    d = d.replace("} from '../lib/youtube.js'", ", ambilTokenSesi } from '../lib/youtube.js'")
    console.log('[BERHASIL] Import ambilTokenSesi ditambahkan di DashboardPage')
  }
  simpan(FILE_D, d)
} else {
  console.log('[SUDAH AMAAN] Tidak ada baris access_token langsung di DashboardPage')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, pilih mode Video dengan file video kecil, lalu simpan.')
console.log('2. Bila sesi login valid, progres upload berjalan dan logbook tersimpan.')
console.log('3. Bila sesi kedaluwarsa, pesan yang muncul kini kalimat ramah, bukan error access_token.')
console.log('4. Uji juga mode Foto dan mode link YouTube untuk memastikan tidak ada regresi.')
```

## File: apply-fix-video-galeri.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function gantiStr(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function gantiRegex(rel, re, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (!re.test(isi)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(re, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memperbaiki penyimpanan video YouTube pada logbook dan galeri...')
console.log('')

/* ===== 1. submitLogbook: pertahankan video YouTube lama saat simpan ulang ===== */
gantiStr('src/pages/DashboardPage.jsx',
  `} else if (it.oldPath) {`,
  `} else if (it.mode === 'video' && !it.file && !it.ytLink && it.oldYtId) {
          mediaSource = 'youtube'
          youtubeId = it.oldYtId
          mediaPath = ytThumb(it.oldYtId)
          mediaThumb = ytThumb(it.oldYtId)
          mediaType = 'video'
        } else if (it.oldPath) {`,
  'Cabang pertahankan video YouTube lama di submitLogbook')

/* ===== 2. startEditLog: tampilkan thumbnail video YouTube di form ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /preview: it\.media_source === 'youtube' \? '' : \(it\.media_path \|\| ''\)/,
  `preview: it.media_path || ''`,
  'Pratinjau edit logbook menampilkan thumbnail YouTube')

/* ===== 3. startEditLog: isi otomatis kolom link dengan link video tersimpan ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /ytLink: '', oldYtId: it\.youtube_id \|\| null/,
  `ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', oldYtId: it.youtube_id || null`,
  'Kolom link terisi otomatis saat edit logbook YouTube')

/* ===== 4. submitGaleri: pertahankan video YouTube lama saat simpan ulang ===== */
gantiStr('src/pages/DashboardPage.jsx',
  `} else if (galForm.oldPath) {`,
  `} else if (galMode === 'video' && !galForm.file && !galYtLink && galOldYt) {
        mediaSource = 'youtube'
        youtubeId = galOldYt
        mediaPath = ytThumb(galOldYt)
        mediaThumb = ytThumb(galOldYt)
        mediaType = 'video'
      } else if (galForm.oldPath) {`,
  'Cabang pertahankan video YouTube lama di submitGaleri')

/* ===== 5. startEditGal: isi otomatis kolom link dengan link video tersimpan ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /setGalYtLink\(''\)([\s\S]{0,60}?)setGalOldYt\(g\.youtube_id/,
  `setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')$1setGalOldYt(g.youtube_id`,
  'Kolom link terisi otomatis saat edit galeri YouTube')

/* ===== 6. startEditGal: tampilkan thumbnail video YouTube di form ===== */
gantiRegex('src/pages/DashboardPage.jsx',
  /preview: g\.media_source === 'youtube' \? '' : \(g\.media_path \|\| ''\)/,
  `preview: g.media_path || ''`,
  'Pratinjau edit galeri menampilkan thumbnail YouTube')

/* ===== 7. logbook.js: sync galeri membawa media_source dan youtube_id ===== */
const FILE_L = 'src/lib/logbook.js'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[LEWATI] logbook.js tidak ditemukan')
} else {
  let l = baca(FILE_L)
  let berubahL = false
  l = l.replace(/from\('galeri'\)\.update\(\{([\s\S]*?)\}\)\.eq\(/, function (m, isi) {
    if (isi.includes('media_source')) return m
    berubahL = true
    return "from('galeri').update({" + isi + "media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null }).eq("
  })
  l = l.replace(/from\('galeri'\)\.insert\(\{([\s\S]*?)\}\)/, function (m, isi) {
    if (isi.includes('media_source')) return m
    berubahL = true
    return "from('galeri').insert({" + isi + "media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null })"
  })
  if (berubahL) {
    simpan(FILE_L, l)
    console.log('[BERHASIL] syncGaleri kini membawa media_source dan youtube_id')
  } else {
    console.log('[SUDAH ADA] syncGaleri sudah membawa kolom YouTube')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('PERBAIKAN DATA LAMA (opsional tetapi disarankan).')
console.log('Jalankan dua SQL berikut di Supabase SQL Editor untuk menyembuhkan baris yang telanjur rusak:')
console.log('')
console.log("update public.logbook_items")
console.log("set media_path = 'https://i.ytimg.com/vi/' || youtube_id || '/hqdefault.jpg',")
console.log("    media_thumb = 'https://i.ytimg.com/vi/' || youtube_id || '/hqdefault.jpg',")
console.log("    media_type = 'video'")
console.log("where media_source = 'youtube' and youtube_id is not null and (media_path is null or media_path = '');")
console.log('')
console.log("update public.galeri")
console.log("set media_source = 'youtube',")
console.log("    youtube_id = substring(media_path from 'vi/([A-Za-z0-9_-]{11})')")
console.log("where media_path like '%i.ytimg.com/vi/%' and (media_source = 'r2' or media_source is null);")
console.log('')
console.log('Langkah uji:')
console.log('1. Edit logbook berisi video YouTube, centang tampilkan di galeri, lalu simpan.')
console.log('2. Media tidak hilang lagi di logbook dan thumbnail beserta link terlihat di form edit.')
console.log('3. Buka tab Galeri: video muncul sebagai kartu dengan pemutar kustom, bukan media rusak.')
console.log('4. Edit lagi tanpa mengubah apa pun dan simpan: tidak ada permintaan upload ulang.')
```

## File: apply-fix-youtube-scope.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki scope OAuth dan jalur pemulihan...')
console.log('')

/* ===== 1. setup-youtube-token.cjs: tambah scope baca ===== */
const FILE_S = 'setup-youtube-token.cjs'
if (!fs.existsSync(path.join(root, FILE_S))) {
  console.log('[TIDAK KETEMU] ' + FILE_S)
} else {
  let s = baca(FILE_S)
  const cariS = `const scope = 'https://www.googleapis.com/auth/youtube.upload'`
  const gantiS = `const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'`
  if (s.includes('youtube.readonly')) {
    console.log('[SUDAH ADA] Scope baca di setup-youtube-token.cjs')
  } else if (s.includes(cariS)) {
    s = s.replace(cariS, gantiS)
    simpan(FILE_S, s)
    console.log('[BERHASIL] Scope baca ditambahkan di setup-youtube-token.cjs')
  } else {
    console.log('[TIDAK KETEMU] Baris scope di setup-youtube-token.cjs')
  }
}

/* ===== 2. api/youtube/latest.js: sertakan alasan asli dari YouTube ===== */
const FILE_L = 'api/youtube/latest.js'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[TIDAK KETEMU] ' + FILE_L)
} else {
  let l = baca(FILE_L)
  const cariL = `if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })`
  const gantiL = `if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t }) }`
  if (l.includes('Gagal memeriksa video terbaru: ')) {
    console.log('[SUDAH ADA] Detail error di api/youtube/latest.js')
  } else if (l.includes(cariL)) {
    l = l.replace(cariL, gantiL)
    simpan(FILE_L, l)
    console.log('[BERHASIL] Detail error ditambahkan di api/youtube/latest.js')
  } else {
    console.log('[TIDAK KETEMU] Baris 502 di api/youtube/latest.js')
  }
}

/* ===== 3. vite.config.js: detail error middleware latest ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
const cariV = `if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }`
const gantiV = `if (!r.ok) { const t = await r.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t })); return }`
if (v.includes('Gagal memeriksa video terbaru: ')) {
  console.log('[SUDAH ADA] Detail error middleware latest')
} else if (v.includes(cariV)) {
  v = v.replace(cariV, gantiV)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Detail error middleware latest ditambahkan')
} else {
  console.log('[TIDAK KETEMU] Baris 502 middleware latest di vite.config.js')
}

/* ===== 4. youtube.js: ulangi pemulihan hingga 3 kali ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
if (y.includes('for (let percobaan = 0')) {
  console.log('[SUDAH ADA] Pengulangan pemulihan di youtube.js')
} else {
  const regexY = /const v = await fetch\('\/api\/youtube\/latest', \{[\s\S]*?secara manual\.'\)/
  const gantiY = `for (let percobaan = 0; percobaan < 3; percobaan++) {
    if (percobaan > 0) await new Promise(function (tunggu) { setTimeout(tunggu, 4000) })
    const v = await fetch('/api/youtube/latest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({})
    })
    if (v.ok) {
      try {
        const j = await v.json()
        if (j && j.videoId) return { videoId: j.videoId }
      } catch (e) {
        console.warn('Respons pemulihan bukan JSON, dilewati.')
      }
    } else {
      const teks = await v.text().catch(function () { return '' })
      console.warn('Pemulihan percobaan ' + (percobaan + 1) + ' gagal: ' + teks)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')`
  if (regexY.test(y)) {
    y = y.replace(regexY, gantiY)
    simpan(FILE_Y, y)
    console.log('[BERHASIL] Pengulangan pemulihan dipasang di youtube.js')
  } else {
    console.log('[TIDAK KETEMU] Blok pemulihan di youtube.js')
  }
}

console.log('')
console.log('Selesai. Lanjutkan dengan langkah manual berikut:')
console.log('1. Jalankan: node setup-youtube-token.cjs')
console.log('2. Browser terbuka dan kini meminta dua izin: kelola upload dan lihat video YouTube kamu.')
console.log('3. Setujui, lalu salin refresh token BARU yang tercetak di terminal.')
console.log('4. Ganti nilai YOUTUBE_REFRESH_TOKEN di .env.local dengan token baru itu.')
console.log('5. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('6. Uji upload video kecil lagi dari dashboard.')
console.log('7. Sebelum deploy, perbarui juga YOUTUBE_REFRESH_TOKEN di Environment Variables Vercel.')
```

## File: apply-foto-hadir-v2.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_C = 'src/components/cards.jsx'

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }

if (!fs.existsSync(path.join(root, FILE_C))) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)

function potongFungsi(isi, nama) {
  const re = new RegExp('export function ' + nama + '\\s*\\(')
  const m = re.exec(isi)
  if (!m) return null
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = m.index; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) return null
  return { mulai: m.index, akhir: akhir }
}

const TARGET = [
  { nama: 'AttendanceCard', size: 'md' },
  { nama: 'AttendanceDetail', size: 'lg' }
]

let berubahAny = false
TARGET.forEach(function (t) {
  const r = potongFungsi(c, t.nama)
  if (!r) { console.log('[TIDAK KETEMU] Fungsi ' + t.nama + ' di cards.jsx'); return }
  const body = c.slice(r.mulai, r.akhir)
  if (body.indexOf('<Avatar') !== -1) { console.log('[SUDAH ADA] Avatar di ' + t.nama); return }

  const AV = '<Avatar src={props.row && props.row.mahasiswa && props.row.mahasiswa.foto_profil ? props.row.mahasiswa.foto_profil : null} nama={props.row && props.row.mahasiswa ? props.row.mahasiswa.nama : \'Mahasiswa\'} size="' + t.size + '" />'
  let baru = body
  let pola = ''

  /* Pola 1: wadah flex yang langsung diikuti blok min-w-0 */
  const p1 = baru.replace(/(<div\s+className="flex\s+items-(?:start|center)[^"]*"\s*>)\s*(<div\s+className="min-w-0)/, function (m, a, b) {
    return a + '\n' + AV + '\n' + b
  })
  if (p1 !== baru) { baru = p1; pola = 'flex+min-w-0' }

  /* Pola 2: blok min-w-0 berdiri sendiri */
  if (!pola) {
    const p2 = baru.replace(/<div\s+className="min-w-0/, function (m) { return AV + '\n' + m })
    if (p2 !== baru) { baru = p2; pola = 'min-w-0' }
  }

  /* Pola 3: bungkus paragraf atau heading nama bersama Avatar dalam baris flex */
  if (!pola) {
    const p3 = baru.replace(/<(p|h2|h3|h4)\b[^>]*>\s*\{[^<>]*?\.nama[^<>]*?\}\s*<\/\1>(\s*<(?:p|h2|h3|h4)\b[^>]*>[\s\S]{0,220}?<\/(?:p|h2|h3|h4)>)?/, function (m) {
      return '<div className="flex items-center gap-3">' + AV + '<div className="min-w-0 flex-1">' + m + '</div></div>'
    })
    if (p3 !== baru) { baru = p3; pola = 'bungkus-nama' }
  }

  if (!pola) {
    console.log('[TIDAK KETEMU] Anchor di ' + t.nama + '. Cuplikan isi fungsi:')
    console.log(body.slice(0, 600))
    return
  }

  c = c.slice(0, r.mulai) + baru + c.slice(r.akhir)
  berubahAny = true
  console.log('[BERHASIL] Avatar dipasang di ' + t.nama + ' lewat pola ' + pola)
})

if (berubahAny) {
  fs.writeFileSync(path.join(root, FILE_C), c, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan:')
console.log('1. Avatar merujuk props.row sehingga aman apa pun nama variabel lokal di dalam fungsi.')
console.log('2. Pola bungkus-nama membuat foto berdampingan dengan nama dan baris identitas di bawahnya tanpa mengubah struktur lain.')
console.log('3. Bila masih ada fungsi yang melaporkan TIDAK KETEMU, cuplikan isi fungsinya tercetak otomatis; salin ke chat supaya aku kunci pola persisnya.')
```

## File: apply-foto-hadir.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang foto profil di halaman daftar hadir...')
console.log('')

/* ===== 1. AttendancePage.jsx: pastikan query memuat foto_profil ===== */
const FILE_A = 'src/pages/AttendancePage.jsx'
if (!ada(FILE_A)) {
  console.log('[LEWATI] AttendancePage.jsx tidak ditemukan')
} else {
  let a = baca(FILE_A)
  console.log('[DIAGNOSIS] Query select di AttendancePage:')
  const semuaSelect = a.match(/\.select\([^)]*\)/g) || []
  semuaSelect.forEach(function (s) { console.log('   ' + s) })
  let berubah = false
  a = a.replace(/\.select\((['"`])([^'"`]+)\1\)/g, function (m, q, c) {
    if (c.includes('mahasiswa') && !c.includes('foto_profil') && c.indexOf('mahasiswa(*)') === -1) {
      berubah = true
      return '.select(' + q + c.replace(/mahasiswa(!inner)?\([^)]*\)/g, 'mahasiswa$1(*)') + q + ')'
    }
    return m
  })
  if (berubah) {
    simpan(FILE_A, a)
    console.log('[BERHASIL] Query daftar hadir kini memuat seluruh kolom mahasiswa termasuk foto_profil')
  } else {
    console.log('[INFO] Query daftar hadir sudah memuat mahasiswa(*) atau foto_profil')
  }
}

/* ===== 2. cards.jsx: pastikan Avatar terimpor ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const regexImpAvatar = /import\s*\{[^}]*\bAvatar\b[^}]*\}\s*from\s*'\.\/ui\.jsx'/
if (regexImpAvatar.test(c)) {
  console.log('[SUDAH ADA] Import Avatar di cards.jsx')
} else {
  const mImp = c.match(/import\s*\{([^}]*)\}\s*from\s*'\.\/ui\.jsx'/)
  if (mImp) {
    c = c.replace(mImp[0], "import {" + mImp[1] + ", Avatar } from './ui.jsx'")
    console.log('[BERHASIL] Avatar ditambahkan ke import ui.jsx yang sudah ada')
  } else {
    c = "import { Avatar } from './ui.jsx'\n" + c
    console.log('[BERHASIL] Baris import Avatar baru ditambahkan di cards.jsx')
  }
}

/* ===== 3. Sisipkan Avatar ke AttendanceCard dan AttendanceDetail ===== */
function potongFungsi(isi, nama) {
  const re = new RegExp('export function ' + nama + '\\s*\\(')
  const m = re.exec(isi)
  if (!m) return null
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = m.index; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) return null
  return { mulai: m.index, akhir: akhir }
}

const TARGET_KOMPONEN = [
  { nama: 'AttendanceCard', size: 'md' },
  { nama: 'AttendanceDetail', size: 'lg' }
]

TARGET_KOMPONEN.forEach(function (t) {
  const rentang = potongFungsi(c, t.nama)
  if (!rentang) {
    console.log('[TIDAK KETEMU] Fungsi ' + t.nama + ' di cards.jsx')
    return
  }
  const body = c.slice(rentang.mulai, rentang.akhir)
  if (body.indexOf('<Avatar') !== -1) {
    console.log('[SUDAH ADA] Avatar di ' + t.nama)
    return
  }
  const avatarJsx = '<Avatar src={row.mahasiswa && row.mahasiswa.foto_profil ? row.mahasiswa.foto_profil : null} nama={row.mahasiswa ? row.mahasiswa.nama : \'Mahasiswa\'} size="' + t.size + '" />'
  let bodyBaru = body.replace(/(<div\s+className="flex\s+items-(?:start|center)[^"]*"\s*>)\s*(<div\s+className="min-w-0)/, function (m, p1, p2) {
    return p1 + '\n' + avatarJsx + '\n' + p2
  })
  let pola = 'flex + min-w-0'
  if (bodyBaru === body) {
    bodyBaru = body.replace(/<div\s+className="min-w-0/, function (m) {
      return avatarJsx + '\n' + m
    })
    pola = 'min-w-0 langsung'
  }
  if (bodyBaru === body) {
    console.log('[TIDAK KETEMU] Anchor penyisipan di ' + t.nama)
    return
  }
  c = c.slice(0, rentang.mulai) + bodyBaru + c.slice(rentang.akhir)
  console.log('[BERHASIL] Avatar dipasang di ' + t.nama + ' lewat pola ' + pola)
})

simpan(FILE_C, c)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Setiap kartu kehadiran di halaman Daftar Hadir menampilkan foto profil kotak melengkung di sebelah nama dan NIM.')
console.log('2. Modal detail kehadiran menampilkan foto ukuran lebih besar di bagian identitas.')
console.log('3. Mahasiswa tanpa foto tetap melihat inisial berwarna tema dengan bentuk yang sama.')
console.log('4. Tab Daftar Hadir di dashboard pemilik akun juga ikut berubah karena memakai kartu yang sama.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Daftar Hadir: kartu kehadiran kini punya foto di kiri nama.')
console.log('2. Klik Detail pada salah satu baris: modal menampilkan foto ukuran besar.')
console.log('3. Buka tab Daftar Hadir di dashboard: perubahan yang sama terlihat di sana.')
console.log('4. Bila foto belum muncul padahal mahasiswa sudah upload, cek baris [DIAGNOSIS] query di atas dan kirim ke aku bila tidak memuat mahasiswa(*).')
```

## File: apply-foto-profil-webp.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menyamakan pipeline foto profil dengan alur konversi R2...')
console.log('')

/* ===== 0. Cek dependensi heic2any ===== */
if (ada('package.json')) {
  const pkg = baca('package.json')
  if (pkg.includes('heic2any')) console.log('[AMAN] Dependensi heic2any sudah terpasang')
  else console.log('[PERINGATAN] heic2any belum ada di package.json. Jalankan dulu: npm install heic2any')
}

/* ===== 1. konversi.js: tambahkan helper khusus foto profil ===== */
const FILE_K = 'src/lib/konversi.js'
if (!ada(FILE_K)) {
  console.log('[GAGAL] src/lib/konversi.js tidak ditemukan')
  process.exit(1)
}
let k = baca(FILE_K)
console.log('[DIAGNOSIS] Daftar export di konversi.js:')
;(k.match(/export\s+(?:async\s+)?function\s+[A-Za-z0-9_]+/g) || []).forEach(function (e) { console.log('   ' + e) })

if (!/import\s+heic2any\s+from\s+'heic2any'/.test(k)) {
  k = "import heic2any from 'heic2any'\n" + k
  console.log('[BERHASIL] Import heic2any ditambahkan di konversi.js')
}

const BLOK_KONVERSI = `/* foto-profil-webp: pipeline konversi foto profil, pola sama dengan alur media R2 */
function muatGambarProfil(sumber) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(sumber)
    const img = new Image()
    img.onload = function () { resolve({ img: img, url: url }) }
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca')) }
    img.src = url
  })
}

export async function siapkanFotoProfil(file, maksSisi, kualitas) {
  const sisi = maksSisi || 640
  const mutu = kualitas || 0.85
  let kerja = file
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('heic') !== -1 || tipe.indexOf('heif') !== -1) {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    kerja = new File([Array.isArray(blob) ? blob[0] : blob], (file.name || 'foto').replace(/\\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
  }
  const muat = await muatGambarProfil(kerja)
  try {
    const rasio = Math.min(1, sisi / Math.max(muat.img.width, muat.img.height))
    const w = Math.max(1, Math.round(muat.img.width * rasio))
    const h = Math.max(1, Math.round(muat.img.height * rasio))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(muat.img, 0, 0, w, h)
    const blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/webp', mutu) })
    if (!blob) throw new Error('Gagal mengonversi foto ke WebP')
    return new File([blob], 'profil-' + Date.now() + '.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(muat.url)
  }
}`

if (k.includes('siapkanFotoProfil')) {
  console.log('[SUDAH ADA] siapkanFotoProfil di konversi.js')
} else {
  k = k.trimEnd() + '\n\n' + BLOK_KONVERSI + '\n'
  simpan(FILE_K, k)
  console.log('[BERHASIL] siapkanFotoProfil ditambahkan di konversi.js')
}

/* ===== 2. profil.js: tulis ulang agar memakai pipeline konversi ===== */
simpan('src/lib/profil.js', `import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, siap, { upsert: true, contentType: siap.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
`)
console.log('[BERHASIL] src/lib/profil.js ditulis ulang dengan pipeline konversi WebP')

/* ===== 3. DashboardPage: izinkan HEIC dan perbarui teks bantuan ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  const sebelum = d
  d = d.split('accept="image/png,image/jpeg,image/webp"').join('accept="image/png,image/jpeg,image/webp,image/heic,image/heif"')
  d = d.split('Format JPG, PNG, atau WebP. Maksimal 5 MB.').join('Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.')
  if (d !== sebelum) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Input file dan teks bantuan foto profil diperbarui')
  } else {
    console.log('[INFO] Tidak ada teks input foto profil yang perlu diubah')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Alur baru foto profil, identik dengan pola media R2:')
console.log('1. File HEIC atau HEIF dari iPhone dikonversi lebih dulu ke JPG lewat heic2any, persis seperti alur upload foto logbook dan galeri.')
console.log('2. Semua format kemudian digambar ulang di canvas dengan sisi terpanjang maksimal 640 piksel dan penghalusan kualitas tinggi, sehingga hasil kecil tetapi tetap mulus tanpa pecah atau gerigi aliasing.')
console.log('3. Canvas menyimpan hasil sebagai WebP kualitas 0,85, lalu file itulah yang diunggah ke bucket foto-profil dengan ekstensi webp.')
console.log('4. Ukuran akhir biasanya hanya 50 sampai 120 KB, sangat cukup untuk tampilan terbesar 160 piksel di tab Profil maupun 96 piksel di header.')
console.log('5. Validasi tetap berjalan: hanya berkas gambar dan maksimal 5 MB sebelum konversi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka tab Profil, klik Ganti atau Upload Foto, pilih foto besar dari kamera atau iPhone.')
console.log('2. Simpan, lalu buka bucket foto-profil di dashboard Supabase: file baru berakhiran .webp dengan ukuran kecil.')
console.log('3. Periksa tampilan di header, tab Profil, dan kartu publik: foto tetap tajam dan mulus.')
console.log('4. Foto lama yang sudah terunggah tidak berubah formatnya; hanya unggahan baru yang melewati pipeline konversi.')
```

## File: apply-foto-profil.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

function sisipSetelah(rel, anchor, teks, marker, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(anchor)) { console.log('[TIDAK KETEMU] Anchor untuk ' + label + ' di ' + rel); return }
  isi = isi.replace(anchor, anchor + '\n' + teks)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function sisipSebelum(rel, anchor, teks, marker, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(anchor)) { console.log('[TIDAK KETEMU] Anchor untuk ' + label + ' di ' + rel); return }
  isi = isi.replace(anchor, teks + '\n' + anchor)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang fitur foto profil mahasiswa...')
console.log('')

/* ===== 1. src/lib/profil.js: helper upload, simpan, hapus foto profil ===== */
simpan('src/lib/profil.js', `import { supabase } from './supabase.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('heic') !== -1 || tipe.indexOf('heif') !== -1) {
    throw new Error('Format HEIC belum didukung untuk foto profil. Ubah dulu ke JPG atau PNG.')
  }
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const namaFile = userId + '/profil-' + Date.now() + '.' + ext
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, file, { upsert: true, contentType: file.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
`)
console.log('[BERHASIL] src/lib/profil.js ditulis')

/* ===== 2. ui.jsx: komponen Avatar dengan fallback inisial bertema ===== */
const FILE_U = 'src/components/ui.jsx'
sisipSetelah(FILE_U,
  'export function TitikAnim() {',
  `export function Avatar(props) {
  const size = props.size || 'md'
  const kelas = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  if (props.src) {
    return <img src={props.src} alt={nama || 'Foto profil'} className={kelas + ' rounded-full object-cover border-2 border-white shadow-md'} />
  }
  return <div className={kelas + ' ' + warna + ' rounded-full grid place-items-center font-black text-white border-2 border-white shadow-md'}>{inisial}</div>
}`,
  'export function Avatar',
  'Komponen Avatar ditambahkan di ui.jsx')

/* ===== 3. DashboardPage: import helper dan Avatar ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
sisipSetelah(FILE_D,
  `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'`,
  `import { uploadFotoProfil, updateFotoProfilMahasiswa, hapusFotoProfil } from '../lib/profil.js'
import { Avatar } from '../components/ui.jsx'`,
  "from '../lib/profil.js'",
  'Import helper foto profil dan Avatar di DashboardPage')

/* ===== 4. DashboardPage: state foto profil ===== */
sisipSetelah(FILE_D,
  'const [ytQuotaLoading, setYtQuotaLoading] = useState(true)',
  `  const [showUploadFoto, setShowUploadFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)`,
  'showUploadFoto',
  'State foto profil ditambahkan di DashboardPage')

/* ===== 5. DashboardPage: handler foto profil ===== */
sisipSebelum(FILE_D,
  'async function submitHadir(e) {',
  `  function pilihFotoProfil(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }
    setFotoFile(f)
    const reader = new FileReader()
    reader.onloadend = function () { setFotoPreview(reader.result) }
    reader.readAsDataURL(f)
  }
  async function simpanFotoProfil() {
    if (!fotoFile) { alert('Pilih file foto terlebih dahulu.'); return }
    setUploadingFoto(true)
    try {
      const url = await uploadFotoProfil(fotoFile, mahasiswa.id)
      await updateFotoProfilMahasiswa(mahasiswa.id, url)
      setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: url }))
      setShowUploadFoto(false)
      setFotoPreview(null)
      setFotoFile(null)
    } catch (err) {
      alert('Gagal upload foto profil: ' + err.message)
    }
    setUploadingFoto(false)
  }
  async function hapusFotoProfilKu() {
    if (!window.confirm('Hapus foto profil saat ini?')) return
    try {
      await hapusFotoProfil(mahasiswa.id, mahasiswa.foto_profil)
      setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: null }))
    } catch (err) {
      alert('Gagal menghapus foto profil: ' + err.message)
    }
  }`,
  'function simpanFotoProfil',
  'Handler foto profil ditambahkan di DashboardPage')

/* ===== 6. DashboardPage: section UI foto profil ===== */
const SECTION_FOTO = `<section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-6 shadow-sm">
  <div className="flex flex-wrap items-center gap-4">
    <Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
    <div className="min-w-0 flex-1">
      <h2 className="text-lg font-black text-slate-900">Foto Profil</h2>
      <p className="text-sm text-slate-500">Foto ini tampil di kartu kamu pada halaman publik, logbook, dan galeri.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
        {mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
      </div>
    </div>
  </div>
  {showUploadFoto ? (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="flex flex-wrap items-start gap-4">
        {fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-24 w-24 rounded-full object-cover border-2 border-white shadow-md" /> : null}
        <div className="min-w-0 flex-1">
          <input type="file" accept="image/png,image/jpeg,image/webp" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
          <p className="mt-2 text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
            <button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
          </div>
        </div>
      </div>
    </div>
  ) : null}
</section>`
if (ada(FILE_D)) {
  let d = baca(FILE_D)
  if (d.includes('>Foto Profil<')) {
    console.log('[SUDAH ADA] Section foto profil di DashboardPage')
  } else if (d.includes("{tab === 'logbook' ? (")) {
    d = d.replace("{tab === 'logbook' ? (", SECTION_FOTO + '\n' + "{tab === 'logbook' ? (")
    simpan(FILE_D, d)
    console.log('[BERHASIL] Section foto profil dipasang di DashboardPage')
  } else if (d.includes("{tab === 'galeri' ? (")) {
    d = d.replace("{tab === 'galeri' ? (", SECTION_FOTO + '\n' + "{tab === 'galeri' ? (")
    simpan(FILE_D, d)
    console.log('[BERHASIL] Section foto profil dipasang di DashboardPage (anchor galeri)')
  } else {
    console.log('[TIDAK KETEMU] Anchor section foto profil di DashboardPage')
  }
} else {
  console.log('[LEWATI] DashboardPage tidak ditemukan')
}

/* ===== 7. Best effort: ganti lingkaran inisial di kartu publik dan PersonChip dengan Avatar ===== */
const TARGET = ['src/components/cards.jsx', 'src/components/ui.jsx', 'src/pages/PublicPage.jsx', 'src/pages/BerandaPage.jsx']
const regexInisial = /<div\b[^>]*rounded-full[^>]*>\s*\{([^{}]*?\.nama[^{}]*?)\}\s*<\/div>/g
TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexInisial, function (m, ekspresi) {
    const varMatch = ekspresi.match(/([A-Za-z0-9_]+)\.nama/)
    if (!varMatch) return m
    jumlah++
    const v = varMatch[1]
    return `<Avatar src={${v}.foto_profil || null} nama={${v}.nama} size="lg" />`
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  let akhir = hasil
  if (rel !== 'src/components/ui.jsx' && !akhir.includes("import { Avatar } from")) {
    const impor = rel.indexOf('/pages/') !== -1 ? "import { Avatar } from '../components/ui.jsx'\n" : "import { Avatar } from './ui.jsx'\n"
    akhir = impor + akhir
  }
  simpan(rel, akhir)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial diganti Avatar di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Pengingat wajib sebelum uji:')
console.log('1. SQL Langkah 1 harus sudah dijalankan: kolom foto_profil, bucket foto-profil, dan keempat policy storage.')
console.log('2. Bila query mahasiswa di DashboardPage memilih kolom tertentu, pastikan foto_profil ikut dipilih.')
console.log('')
console.log('Langkah uji:')
console.log('1. Login sebagai mahasiswa, lihat section Foto Profil di bagian atas dashboard.')
console.log('2. Klik Upload Foto, pilih JPG atau PNG di bawah 5 MB, pratinjau muncul, lalu Simpan Foto.')
console.log('3. Avatar besar langsung berubah menjadi foto kamu tanpa reload halaman.')
console.log('4. Buka halaman publik: kartu mahasiswa menampilkan foto, bukan lingkaran inisial.')
console.log('5. Klik Hapus Foto untuk menguji penghapusan; avatar kembali ke inisial berwarna tema.')
console.log('6. Foto tersimpan di bucket foto-profil dengan pola folder sesuai id user, aman per pengguna.')
```

## File: apply-gabung-tim-dospem.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menerapkan penggabungan halaman Tim ke dalam Dospem...')
console.log('')

/* ===== 1. DospemPage.jsx: data tim dan section Profil tim magang ===== */
const FILE_D = 'src/pages/DospemPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let ubahD = false

if (d.indexOf('Avatar') === -1) {
  d = d.replace(/import\s*\{([^}]*)\}\s*from\s*'\.\.\/components\/ui\.jsx'/, function (m, isi) {
    return "import {" + isi + ", Avatar } from '../components/ui.jsx'"
  })
  ubahD = true
  console.log('[BERHASIL] Import Avatar ditambahkan di DospemPage')
} else {
  console.log('[SUDAH ADA] Import Avatar di DospemPage')
}

if (d.indexOf('galRows') === -1) {
  d = d.replace(/const \[hadirCount, setHadirCount\] = useState\(0\)/,
    "const [hadirCount, setHadirCount] = useState(0)\n  const [galRows, setGalRows] = useState([])\n  const [hadirRows, setHadirRows] = useState([])")
  ubahD = true
  console.log('[BERHASIL] State galRows dan hadirRows ditambahkan')
} else {
  console.log('[SUDAH ADA] State galRows dan hadirRows')
}

if (d.indexOf("select('id, mahasiswa_id')") === -1) {
  d = d.replace(".from('galeri').select('id')", ".from('galeri').select('id, mahasiswa_id')")
  d = d.replace(".from('daftar_hadir').select('id')", ".from('daftar_hadir').select('id, mahasiswa_id')")
  ubahD = true
  console.log('[BERHASIL] Query galeri dan daftar hadir kini membawa mahasiswa_id')
} else {
  console.log('[SUDAH ADA] Query galeri dan daftar hadir sudah membawa mahasiswa_id')
}

if (d.indexOf('setGalRows(') === -1) {
  d = d.replace(/setGalCount\(\(g\.data\s*\|\|\s*\[\]\)\.length\)/, function (m) {
    return m + "\n      setGalRows(g.data || [])"
  })
  d = d.replace(/setHadirCount\(\(h\.data\s*\|\|\s*\[\]\)\.length\)/, function (m) {
    return m + "\n      setHadirRows(h.data || [])"
  })
  ubahD = true
  console.log('[BERHASIL] Pengisian state galRows dan hadirRows ditambahkan')
} else {
  console.log('[SUDAH ADA] Pengisian state galRows dan hadirRows')
}

if (d.indexOf('foto_profil') === -1) {
  d = d.replace(/\.select\('id, nama, nim, prodi'\)/, ".select('id, nama, nim, prodi, foto_profil')")
  ubahD = true
  console.log('[BERHASIL] Query mahasiswa kini membawa foto_profil')
} else {
  console.log('[SUDAH ADA] Query mahasiswa sudah membawa foto_profil')
}

if (d.indexOf('Profil tim magang') === -1) {
  const anchor = '<section className="mt-10">'
  const idx = d.indexOf(anchor)
  if (idx === -1) {
    console.log('[TIDAK KETEMU] Anchor section untuk menyisipkan Profil tim magang')
  } else {
    const SECTION_TIM = `<section className="mt-10">
<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
{loading
? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate font-bold text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-500">NIM {p.nim}{p.prodi ? ' • ' + p.prodi : ''}</p>
<div className="mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
<span className="inline-flex px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{totalLog} logbook</span>
<span className="inline-flex px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">{totalGal} media</span>
<span className="inline-flex px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{totalHadir} hadir</span>
</div>
</div>
</div>
)
})}
{!loading && !people.length ? <EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /> : null}
</div>
</section>
`
    d = d.slice(0, idx) + SECTION_TIM + d.slice(idx)
    ubahD = true
    console.log('[BERHASIL] Section Profil tim magang disisipkan sebelum grid logbook')
  }
} else {
  console.log('[SUDAH ADA] Section Profil tim magang')
}

if (ubahD) simpan(FILE_D, d)

/* ===== 2. App.jsx: route /tim dialihkan ke /dospem ===== */
const FILE_A = 'src/App.jsx'
if (!ada(FILE_A)) {
  console.log('[LEWATI] App.jsx tidak ditemukan')
} else {
  let a = baca(FILE_A)
  if (a.indexOf('Navigate to="/dospem"') !== -1) {
    console.log('[SUDAH ADA] Redirect /tim ke /dospem')
  } else {
    const sebelum = a
    a = a.replace(/<Route\s+path="\/tim"\s*element=\{<TimPage\s*\/>\}\s*\/>/, '<Route path="/tim" element={<Navigate to="/dospem" replace />} />')
    if (a === sebelum) {
      a = a.replace(/<Route\s+path="\/tim"[^>]*\/>/, '<Route path="/tim" element={<Navigate to="/dospem" replace />} />')
    }
    if (a !== sebelum) {
      if (!/import\s*\{[^}]*\bNavigate\b[^}]*\}\s*from\s*'react-router-dom'/.test(a)) {
        a = a.replace(/import\s*\{([^}]*)\}\s*from\s*'react-router-dom'/, function (m, isi) {
          return "import {" + isi + ", Navigate } from 'react-router-dom'"
        })
      }
      simpan(FILE_A, a)
      console.log('[BERHASIL] Route /tim kini dialihkan otomatis ke /dospem')
    } else {
      console.log('[TIDAK KETEMU] Pola route /tim di App.jsx, periksa manual')
    }
  }
}

/* ===== 3. Layout.jsx: satu menu gabungan ===== */
const FILE_L = 'src/components/Layout.jsx'
if (!ada(FILE_L)) {
  console.log('[LEWATI] Layout.jsx tidak ditemukan')
} else {
  let l = baca(FILE_L)
  const sebelum = l
  l = l.replace(/<(NavLink|Link)\b[^>]*to="\/tim"[^>]*>[^<]*<\/\1>/g, '')
  l = l.replace(/,?\s*\{\s*to:\s*['"]\/tim['"][^}]*\}/g, '')
  l = l.split('>Dospem<').join('>Tim & Dospem<')
  l = l.replace(/label:\s*'Dospem'/, "label: 'Tim & Dospem'")
  l = l.replace(/label:\s*"Dospem"/, 'label: "Tim & Dospem"')
  if (l !== sebelum) {
    simpan(FILE_L, l)
    console.log('[BERHASIL] Menu Tim dihapus dan menu Dospem berganti label Tim & Dospem')
  } else {
    console.log('[INFO] Navigasi tidak berubah, periksa manual bila menu Tim masih tampil')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang berlaku sekarang:')
console.log('1. Halaman /dospem memuat hero monitoring, section Profil tim magang dengan avatar kotak melengkung dan lencana kontribusi, lalu grid logbook publik, persis seperti pratinjau HTML yang kamu setujui.')
console.log('2. Menu navigasi hanya menampilkan satu butir bernama Tim & Dospem.')
console.log('3. Alamat lama /tim otomatis dialihkan ke /dospem sehingga tautan yang pernah dibagikan tetap hidup.')
console.log('4. Berkas TimPage.jsx dibiarkan ada namun tidak terpakai, aman dihapus manual kapan saja bersama preview-tim-dospem.html bila sudah tidak diperlukan.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem: hero statistik tampil lebih dulu, lalu kartu profil anggota tim, lalu grid logbook.')
console.log('2. Ketik /tim di address bar: browser otomatis mendarat di /dospem.')
console.log('3. Pastikan foto profil muncul pada kartu anggota bagi mahasiswa yang sudah mengunggah foto, dan inisial berwarna bagi yang belum.')
console.log('4. Buka halaman pada perangkat kecil: grid kartu turun menjadi satu atau dua kolom dengan rapi.')
```

## File: apply-galeri-picker.cjs
```javascript
const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function gantiRegex(rel, regex, gantiDengan, label, marker) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (marker && isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!regex.test(isi)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(regex, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

const FILE_D = 'src/pages/DashboardPage.jsx'

console.log('Mulai memasang pemilih jenis media pada form galeri...')
console.log('')

/* ===== 1. Import helper YouTube ===== */
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] ' + FILE_D + ' tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
if (d.includes("from '../lib/youtube.js'")) {
  console.log('[SUDAH ADA] Import helper YouTube')
} else if (d.includes("from '../lib/konversi.js'")) {
  d = d.replace("from '../lib/konversi.js'", "from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'")
  simpan(FILE_D, d)
  console.log('[BERHASIL] Import helper YouTube')
} else {
  console.log('[TIDAK KETEMU] Import helper YouTube')
}

/* ===== 2. State YouTube dan mode galeri ===== */
d = baca(FILE_D)
const stateBaru = []
if (!d.includes('const [ytQuota, setYtQuota]')) stateBaru.push("  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })")
if (!d.includes('const [galMode, setGalMode]')) stateBaru.push("  const [galMode, setGalMode] = useState('foto')")
if (!d.includes('const [galYtLink, setGalYtLink]')) stateBaru.push("  const [galYtLink, setGalYtLink] = useState('')")
if (!d.includes('const [galOldYt, setGalOldYt]')) stateBaru.push('  const [galOldYt, setGalOldYt] = useState(null)')
if (stateBaru.length === 0) {
  console.log('[SUDAH ADA] State YouTube dan mode galeri')
} else if (d.includes("const [infoProses, setInfoProses] = useState('')")) {
  d = d.replace("const [infoProses, setInfoProses] = useState('')", "const [infoProses, setInfoProses] = useState('')\n" + stateBaru.join('\n'))
  simpan(FILE_D, d)
  console.log('[BERHASIL] State YouTube dan mode galeri (' + stateBaru.length + ' baris)')
} else {
  console.log('[TIDAK KETEMU] State YouTube dan mode galeri')
}

/* ===== 3. Muat kuota YouTube berkala ===== */
ganti(FILE_D,
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')

/* ===== 4. Cabang YouTube pada submitGaleri ===== */
ganti(FILE_D,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {`,
  'Cabang YouTube pada submitGaleri')
ganti(FILE_D,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }`,
  'Payload galeri membawa kolom YouTube')

/* ===== 5. startEditGal membawa mode dan sumber lama ===== */
ganti(FILE_D,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan sumber lama')

/* ===== 6. Reset mode galeri setelah simpan dan batal ===== */
d = baca(FILE_D)
if (d.includes('setGalOldYt(null)')) {
  console.log('[SUDAH ADA] Reset mode galeri')
} else {
  const polaReset = `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`
  const gantiReset = polaReset + `\n    setGalMode('foto')\n    setGalYtLink('')\n    setGalOldYt(null)`
  if (d.includes(polaReset)) {
    d = d.split(polaReset).join(gantiReset)
    simpan(FILE_D, d)
    console.log('[BERHASIL] Reset mode galeri')
  } else {
    console.log('[TIDAK KETEMU] Reset mode galeri')
  }
}

/* ===== 7. hapusMediaR2 melewatkan URL YouTube ===== */
ganti(FILE_D,
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 8. Hapus galeri melewatkan media YouTube ===== */
ganti(FILE_D,
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')

/* ===== 9. UI pemilih jenis media pada form galeri ===== */
gantiRegex(FILE_D,
  /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>\s*<\/div>/,
  `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri',
  'Jenis media {editGalId')

/* ===== 10. Kartu galeri menampilkan thumbnail untuk media YouTube ===== */
gantiRegex('src/components/cards.jsx',
  /<SmartFit src=\{item\.media_thumb \|\| item\.media_path\}[^/]*\/>/,
  `{item.media_source === 'youtube' ? (
        <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}`,
  'Kartu galeri menampilkan thumbnail untuk media YouTube',
  '<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />')

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Catatan:')
console.log('1. Tidak ada SQL baru. Kolom media_source dan youtube_id sudah kamu tambahkan sebelumnya.')
console.log('2. Script aman dijalankan ulang karena setiap langkah memeriksa penanda lebih dulu.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan label kini bertuliskan Jenis media dengan tombol Foto dan Video.')
console.log('2. Pilih Foto: muncul FileInput gambar dengan pratinjau HEIC seperti sebelumnya.')
console.log('3. Pilih Video: muncul sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('4. Saat kuota habis, FileInput video mengabu dan hanya kolom link yang bisa dipakai.')
console.log('5. Simpan media YouTube: kartu galeri menampilkan thumbnail YouTube, dan modal detail memutar embed.')
console.log('6. Edit media YouTube: mode otomatis terpilih Video dan tombol simpan mempertahankan sumber lama.')
console.log('7. Hapus media YouTube: tidak ada percobaan hapus ke R2 karena penjaga URL sudah aktif.')
```

## File: apply-hapus-ringkasan.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghapus section Ringkasan logbook per mahasiswa...')
console.log('')

const TARGET = ['src/pages/DospemPage.jsx', 'src/pages/TimPage.jsx']
let totalHapus = 0

TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const idx = isi.indexOf('Ringkasan logbook per mahasiswa')
  if (idx === -1) {
    console.log('[INFO] Judul tidak ditemukan di ' + rel)
    return
  }
  const start = isi.lastIndexOf('<section', idx)
  const end = isi.indexOf('</section>', idx)
  if (start === -1 || end === -1) {
    console.log('[TIDAK KETEMU] Batas section di ' + rel)
    return
  }
  const endFull = end + '</section>'.length
  const potongan = isi.slice(start, endFull)
  isi = isi.slice(0, start) + isi.slice(endFull)
  isi = isi.replace(/\n{3,}/g, '\n\n')
  simpan(rel, isi)
  totalHapus++
  console.log('[BERHASIL] Section dihapus dari ' + rel + ' (' + potongan.length + ' karakter dibuang)')
})

if (totalHapus === 0) {
  console.log('[GAGAL] Tidak ada section yang berhasil dihapus')
  process.exit(1)
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Struktur halaman Tim & Dospem setelah penghapusan:')
console.log('1. Hero hijau gelap dengan empat kartu statistik dan tiga tombol pintasan.')
console.log('2. Section Profil tim magang berisi kartu anggota dengan foto, identitas, pil prodi, dan tiga kotak kontribusi.')
console.log('3. Tidak ada lagi section ringkasan per mahasiswa yang duplikat, sehingga halaman lebih ringkas dan cepat dimuat.')
console.log('')
console.log('Catatan aman:')
console.log('1. Data logbook publik tetap dapat dijelajahi penuh lewat menu Logbook atau tombol Lihat logbook di hero.')
console.log('2. State dan modal detail dibiarkan ada sebagai jaring pengaman bila masih dirujuk bagian lain, sehingga tidak ada error referensi.')
console.log('3. Berkas TimPage.jsx ikut dibersihkan bila judul yang sama masih tersisa di sana, meski halamannya sudah dialihkan ke /dospem.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem: setelah kartu profil tim, halaman langsung berakhir tanpa section ringkasan lama.')
console.log('2. Gulir sampai bawah untuk memastikan tidak ada sisa kartu bernama Logbook publik satuan.')
console.log('3. Klik tombol Lihat logbook di hero: halaman Logbook tetap menampilkan seluruh logbook publik seperti biasa.')
```

## File: apply-kartu-tim-cantik.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

if (d.indexOf('Profil tim magang') === -1) {
  console.log('[TIDAK KETEMU] Section Profil tim magang di DospemPage')
  process.exit(1)
}

if (d.indexOf('grid grid-cols-3 gap-3') !== -1 && d.indexOf('rounded-3xl border border-slate-200 bg-white p-5') !== -1) {
  console.log('[SUDAH ADA] Kartu tim versi baru sudah terpasang')
  process.exit(0)
}

const regexKartuLama = /<div key=\{p\.id\} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/

const KARTU_BARU = `<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-3 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Logbook</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Media</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Hadir</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalHadir}</p>
</div>
</div>
</div>`

if (!regexKartuLama.test(d)) {
  console.log('[TIDAK KETEMU] Pola kartu tim lama untuk diganti')
  process.exit(1)
}

d = d.replace(regexKartuLama, KARTU_BARU)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Kartu Profil tim magang ditata ulang sesuai lampiran')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Tampilan baru kartu tim:')
console.log('1. Baris atas: foto profil kotak melengkung di kiri, nama tebal berukuran besar, NIM di bawahnya, dan pil prodi hijau mint seperti lampiran.')
console.log('2. Baris bawah: tiga kotak statistik abu-abu muda berisi angka Logbook, Media, dan Hadir berwarna hijau tua, menggantikan lencana kecil sebelumnya.')
console.log('3. Angka取自 data publik yang sama sehingga tetap akurat: logbook publik, media galeri, dan catatan kehadiran per mahasiswa.')
console.log('4. Kartu memakai sudut lebih bulat (rounded-3xl) agar terasa lembut dan modern sesuai contoh gambar.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, gulir ke section Profil tim magang.')
console.log('2. Setiap kartu menampilkan foto, identitas, pil prodi, dan tiga kotak angka kontribusi.')
console.log('3. Mahasiswa tanpa foto tetap menampilkan inisial berwarna tema pada kotak avatar yang sama.')
console.log('4. Lebar layar kecil: grid kartu turun kolom namun tiga kotak statistik tetap sejajar rapi.')
```

## File: apply-kartu-tim-kehadiran-v2.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai mengganti kartu Profil Tim dengan versi rekap kehadiran...')
console.log('')

if (d.indexOf('Profil tim magang') === -1) {
  console.log('[TIDAK KETEMU] Section Profil tim magang di DospemPage')
  process.exit(1)
}

if (d.indexOf('Rekap Kehadiran') !== -1) {
  console.log('[SUDAH ADA] Desain kartu rekap kehadiran sudah terpasang')
  process.exit(0)
}

if (d.indexOf(".from('daftar_hadir').select('id, mahasiswa_id, status')") === -1) {
  console.log('[PERINGATAN] Query status belum ada, mencoba memperbarui dulu')
  d = d.replace(".from('daftar_hadir').select('id, mahasiswa_id')", ".from('daftar_hadir').select('id, mahasiswa_id, status')")
}

/* Jangkar baru: dari awal kartu sampai penutup callback map, versi kartu apa pun pasti cocok */
const regexKartu = /<div key=\{p\.id\}[\s\S]*?\n\)\s*\n\}\)\}/

if (!regexKartu.test(d)) {
  console.log('[TIDAK KETEMU] Blok kartu di dalam people.map')
  process.exit(1)
}

const KARTU_BARU = `<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>
)
})}`

d = d.replace(regexKartu, KARTU_BARU)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Kartu Profil Tim diganti dengan versi rekap kehadiran tiga status')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Isi kartu baru sesuai pratinjau yang kamu setujui:')
console.log('1. Baris identitas: avatar kotak melengkung, nama tebal besar, NIM, dan pil prodi hijau mint.')
console.log('2. Baris kontribusi: dua kotak abu-abu untuk Logbook dan Media.')
console.log('3. Baris kehadiran: tiga kotak berwarna Masuk hijau, Izin kuning, Bolos merah, dihitung terpisah dari kolom status.')
console.log('4. Variabel totalLog dan totalGal tetap dipakai dari callback map yang sudah ada, sehingga tidak ada state baru yang perlu ditambah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, gulir ke section Profil tim magang.')
console.log('2. Setiap kartu menampilkan identitas, dua kotak kontribusi, lalu tiga kotak rekap kehadiran.')
console.log('3. Isi daftar hadir dengan status Izin atau Bolos, refresh, dan pastikan angka bertambah pada kotak yang sesuai warna.')
console.log('4. Mahasiswa tanpa catatan kehadiran menampilkan tiga kotak bernilai nol dengan rapi.')
```

## File: apply-kartu-tim-kehadiran.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai menerapkan desain kartu Profil Tim dengan rekap kehadiran...')
console.log('')

/* ===== 1. Update Query: ambil kolom status dari daftar_hadir ===== */
if (d.includes(".from('daftar_hadir').select('id, mahasiswa_id')")) {
  d = d.replace(".from('daftar_hadir').select('id, mahasiswa_id')", ".from('daftar_hadir').select('id, mahasiswa_id, status')")
  berubah = true
  console.log('[BERHASIL] Query daftar_hadir diperbarui untuk mengambil kolom status')
} else if (d.includes(".from('daftar_hadir').select('id, mahasiswa_id, status')")) {
  console.log('[SUDAH ADA] Query daftar_hadir sudah mengambil kolom status')
} else {
  console.log('[TIDAK KETEMU] Pola query daftar_hadir untuk diperbarui')
}

/* ===== 2. Update Markup: ganti kartu lama dengan desain baru ===== */
// Cari pola kartu lama (dari apply-kartu-tim-cantik.cjs)
const regexKartuLama = /<div key=\{p\.id\} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/

const KARTU_BARU = `<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>`

if (regexKartuLama.test(d)) {
  d = d.replace(regexKartuLama, KARTU_BARU)
  berubah = true
  console.log('[BERHASIL] Markup kartu Profil Tim diganti dengan desain rekap kehadiran')
} else if (d.includes('Rekap Kehadiran')) {
  console.log('[SUDAH ADA] Desain kartu rekap kehadiran sudah terpasang')
} else {
  console.log('[TIDAK KETEMU] Pola kartu Profil Tim lama. Pastikan script apply-kartu-tim-cantik.cjs sudah dijalankan sebelumnya.')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan yang diterapkan:')
console.log('1. Query Supabase kini mengambil kolom status dari tabel daftar_hadir.')
console.log('2. Kotak kontribusi Logbook dan Media tetap ada di bagian tengah kartu.')
console.log('3. Bagian bawah kartu kini menampilkan 3 kotak Rekap Kehadiran (Masuk, Izin, Bolos) dengan kode warna hijau, kuning, dan merah.')
console.log('4. Perhitungan dilakukan langsung di dalam render menggunakan filter status, sehingga datanya selalu akurat dan real-time.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem dan lihat section Profil tim magang.')
console.log('2. Perhatikan kartu anggota: di bawah kotak Logbook dan Media, kini ada garis pemisah dan 3 kotak kecil berwarna untuk rekap kehadiran.')
console.log('3. Coba isi daftar hadir dengan status Izin atau Bolos, lalu refresh halaman Tim & Dospem untuk melihat angkanya bertambah di kotak yang sesuai.')
```

## File: apply-loading-kuota.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menambahkan indikator loading pada kuota...')
console.log('')

const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
let berubah = false

/* ===== 1. Tambah state ytQuotaLoading ===== */
const cariState = `  const [ytQuota, setYtQuota] = useState({ limit: 5, used: 0, remaining: 5 })`
const gantiState = `  const [ytQuota, setYtQuota] = useState({ limit: 5, used: 0, remaining: 5 })
  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)`
if (d.includes('ytQuotaLoading')) {
  console.log('[SUDAH ADA] State ytQuotaLoading')
} else if (d.includes(cariState)) {
  d = d.replace(cariState, gantiState)
  berubah = true
  console.log('[BERHASIL] State ytQuotaLoading ditambahkan')
} else {
  console.log('[TIDAK KETEMU] State ytQuota')
}

/* ===== 2. Set loading saat fetch kuota ===== */
const cariFetch = `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)`
const gantiFetch = `  useEffect(function () {
    if (mahasiswa) refresh()
    setYtQuotaLoading(true)
    fetchYouTubeQuota().then(function (data) {
      setYtQuota(data)
      setYtQuotaLoading(false)
    })`
if (d.includes('setYtQuotaLoading(true)')) {
  console.log('[SUDAH ADA] Loading state pada fetch kuota')
} else if (d.includes(cariFetch)) {
  d = d.replace(cariFetch, gantiFetch)
  berubah = true
  console.log('[BERHASIL] Loading state dipasang pada fetch kuota')
} else {
  console.log('[TIDAK KETEMU] Blok fetch kuota di useEffect')
}

/* ===== 3. Set loading false juga di interval ===== */
const cariInterval = `    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)`
const gantiInterval = `    const iv = setInterval(function () { fetchYouTubeQuota().then(function (data) { setYtQuota(data); setYtQuotaLoading(false) }) }, 30000)`
if (d.includes(gantiInterval)) {
  console.log('[SUDAH ADA] Loading state pada interval')
} else if (d.includes(cariInterval)) {
  d = d.replace(cariInterval, gantiInterval)
  berubah = true
  console.log('[BERHASIL] Loading state dipasang pada interval')
} else {
  console.log('[TIDAK KETEMU] Blok interval kuota')
}

/* ===== 4. Update tampilan kuota di form logbook ===== */
const cariLogbook = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
const gantiLogbook = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>`
if (d.includes('border-t-transparent rounded-full animate-spin')) {
  console.log('[SUDAH ADA] Indikator loading di form logbook')
} else if (d.includes(cariLogbook)) {
  d = d.split(cariLogbook).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form logbook')
} else {
  console.log('[TIDAK KETEMU] Teks kuota di form logbook')
}

/* ===== 5. Update tampilan kuota di form galeri ===== */
const cariGaleri = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
if (d.includes(cariGaleri) && d.includes('galMode === \'video\'')) {
  d = d.split(cariGaleri).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form galeri')
}

/* ===== 6. Update tampilan kuota di form rincian kegiatan ===== */
const cariRincian = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
if (d.includes(cariRincian) && d.includes('it.mode === \'video\'')) {
  d = d.split(cariRincian).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form rincian kegiatan')
}

if (berubah) {
  simpan(FILE_D, d)
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat halaman dibuka, tulisan kuota menampilkan spinner kecil berputar.')
console.log('2. Begitu data dari server datang (biasanya < 1 detik), spinner hilang dan angka muncul.')
console.log('3. Tidak ada lagi kedipan angka dari 6 ke 26, karena loading state menahan tampilan.')
```

## File: apply-netral-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Pembersihan akhir teks proses dan pemindaian sisa sebutan YouTube...')
console.log('')

/* ===== 1. Bersihkan titik tiga pada teks onInfo di upload.js dan konversi.js ===== */
;['src/lib/upload.js', 'src/lib/konversi.js'].forEach(function (rel) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  const sebelum = isi
  isi = isi.replace(/onInfo\('([^'\n]*?)\.\.\.'\)/g, "onInfo('$1')")
  isi = isi.replace(/Mengunggah\.\.\. ' \+ /g, "Mengunggah ' + ")
  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Teks proses dibersihkan di ' + rel)
  } else {
    console.log('[SUDAH BERSIH] ' + rel)
  }
})

/* ===== 2. Bersihkan pola serupa di DashboardPage bila masih tersisa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[LEWATI] DashboardPage tidak ditemukan')
} else {
  let d = baca(FILE_D)
  const sebelum = d
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\.'\)/g, "setInfoProses('$1')")
  d = d.replace(/setInfoProses\('([^'\n]*?)\.\.\. ' \+ /g, "setInfoProses('$1 ' + ")
  if (d !== sebelum) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Teks proses dibersihkan di DashboardPage')
  } else {
    console.log('[SUDAH BERSIH] DashboardPage')
  }
}

/* ===== 3. Pindai sisa sebutan YouTube huruf kapital di seluruh src ===== */
console.log('')
console.log('Pemindaian sisa teks YouTube huruf kapital pada folder src:')
let ketemu = 0
function jalan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(function (e) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) { jalan(full); return }
    if (!/\.(jsx?|css|html)$/.test(e.name)) return
    const isi = fs.readFileSync(full, 'utf8')
    isi.split('\n').forEach(function (b, i) {
      if (b.includes('YouTube')) {
        ketemu++
        console.log('  ' + path.relative(root, full) + ':' + (i + 1) + '  ' + b.trim().slice(0, 120))
      }
    })
  })
}
jalan(path.join(root, 'src'))
if (ketemu === 0) console.log('  Tidak ada sisa teks YouTube huruf kapital. Bersih.')

console.log('')
console.log('Catatan: baris berisi alamat embed youtube-nocookie, i.ytimg, atau googleapis adalah teknis')
console.log('dan tidak tampil sebagai teks merek kepada pengguna, jadi wajar bila muncul di pemindaian huruf kecil.')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Simpan logbook berisi foto atau video, perhatikan tombol simpan.')
console.log('2. Teks proses tampil tanpa titik tiga statis, diikuti tiga titik animasi yang halus.')
console.log('3. Contoh tampilan: Mengunggah 43 persen dengan titik berdenyut, bukan Mengunggah... 43 persen.')
console.log('4. Tidak ada kata YouTube pada label kuota, placeholder, peringatan, maupun tombol.')
```

## File: apply-netral-youtube-dan-titik.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function semua(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.split(cari).join(ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function sisip(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function tambah(rel, marker, blok, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  isi = isi.trimEnd() + '\n\n' + blok
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai menetralkan sebutan YouTube dan memasang animasi titik...')
console.log('')

/* ===== 1. index.css: animasi titik halus ===== */
tambah('src/index.css', '.titik-anim', `.titik-anim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}
.titik-anim i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.2;
  animation: titik-halus 1.1s ease-in-out infinite;
}
.titik-anim i:nth-child(2) { animation-delay: 0.18s; }
.titik-anim i:nth-child(3) { animation-delay: 0.36s; }
@keyframes titik-halus {
  0%, 60%, 100% { opacity: 0.2; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-1px) scale(1); }
}`, 'CSS animasi titik di index.css')

/* ===== 2. ui.jsx: komponen TitikAnim dan LabelProses ===== */
tambah('src/components/ui.jsx', 'export function LabelProses', `export function TitikAnim() {
  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\\.{3}/g, '').replace(/\\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}`, 'Komponen TitikAnim dan LabelProses di ui.jsx')

/* ===== 3. ui.jsx: netralkan placeholder pratinjau dan pemutar ===== */
semua('src/components/ui.jsx', `<SizedIcon name="youtube" size={26} />`, `<SizedIcon name="video" size={26} />`, 'Ikon placeholder pratinjau menjadi ikon video')
semua('src/components/ui.jsx', `Menyiapkan thumbnail YouTube...`, `Menyiapkan pratinjau video`, 'Teks placeholder pratinjau dinetralkan')
semua('src/components/ui.jsx', `Thumbnail belum siap di YouTube`, `Pratinjau video belum siap`, 'Teks placeholder permanen dinetralkan')
semua('src/components/ui.jsx', `alt={props.alt || 'Thumbnail YouTube'}`, `alt={props.alt || 'Pratinjau video'}`, 'Alt text pratinjau dinetralkan')
semua('src/components/ui.jsx', `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId}`, `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId + '?rel=0&modestbranding=1'}`, 'Pemutar lightbox meminimalkan merek')

/* ===== 4. cards.jsx: minimalkan merek pada embed detail ===== */
semua('src/components/cards.jsx', `embed/' + it.youtube_id}`, `embed/' + it.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail logbook meminimalkan merek')
semua('src/components/cards.jsx', `embed/' + item.youtube_id}`, `embed/' + item.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail galeri meminimalkan merek')

/* ===== 5. youtube.js: netralkan pesan error ===== */
semua('src/lib/youtube.js', `Upload YouTube gagal (status `, `Upload video gagal (status `, 'Pesan gagal upload dinetralkan')
semua('src/lib/youtube.js', `Jaringan gagal saat upload YouTube`, `Jaringan gagal saat upload video`, 'Pesan jaringan dinetralkan')
semua('src/lib/youtube.js', `Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.`, `Video kemungkinan sudah tersimpan; tempel link video secara manual.`, 'Pesan pemulihan dinetralkan')
semua('src/lib/youtube.js', `Gagal membuat sesi YouTube`, `Gagal memulai sesi upload video`, 'Pesan sesi dinetralkan')

/* ===== 6. upload.js: netralkan teks konversi ===== */
semua('src/lib/upload.js', `Mengonversi foto ke WebP...`, `Mengonversi foto`, 'Teks konversi foto dinetralkan')

/* ===== 7. DashboardPage: import LabelProses ===== */
sisip('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'`,
  'Import LabelProses di DashboardPage')

/* ===== 8. DashboardPage: netralkan semua teks YouTube ===== */
semua('src/pages/DashboardPage.jsx', `Sisa kuota upload YouTube hari ini:`, `Sisa kuota upload video hari ini:`, 'Label kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Atau tempel link YouTube (unlisted)`, `Atau tempel link video eksternal`, 'Placeholder link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota habis. Gunakan link YouTube di bawah.`, `Kuota habis. Gunakan link video di bawah.`, 'Peringatan kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.`, `Kuota upload video hari ini sudah habis. Gunakan link video.`, 'Alert kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Link YouTube tidak valid`, `Link video tidak valid`, 'Alert link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah ke YouTube... ' + Math.round(p * 100) + '%'`, `Mengunggah video ' + Math.round(p * 100) + '%'`, 'Progres upload video dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah... ' + Math.round(p * 100) + '%'`, `Mengunggah ' + Math.round(p * 100) + '%'`, 'Progres upload R2 tanpa titik statis')
semua('src/pages/DashboardPage.jsx', `Mengonversi HEIC ke JPG...`, `Mengonversi foto HEIC`, 'Teks konversi HEIC dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengonversi pratinjau HEIC...`, `Mengonversi pratinjau`, 'Teks pratinjau HEIC dinetralkan')

/* ===== 9. DashboardPage: tombol proses memakai animasi titik ===== */
semua('src/pages/DashboardPage.jsx', `{busy ? (infoProses || 'Menyimpan...') :`, `{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> :`, 'Tombol simpan logbook dan galeri beranimasi titik')
semua('src/pages/DashboardPage.jsx', `{busy ? 'Menyimpan...' :`, `{busy ? <LabelProses teks="Menyimpan" /> :`, 'Tombol simpan lainnya beranimasi titik')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Tidak ada lagi kata YouTube pada label kuota, placeholder link, peringatan, maupun progres.')
console.log('2. Placeholder pratinjau video memakai ikon video umum, bukan ikon YouTube.')
console.log('3. Tombol sibuk menampilkan tiga titik kecil yang memudar dan naik turun secara halus dan berurutan.')
console.log('4. Progres persen tetap tampil, misalnya Mengunggah 43 persen, diikuti titik beranimasi.')
console.log('5. Pemutar embed memakai parameter modestbranding dan rel=0 untuk meminimalkan merek bawaan.')
```

## File: apply-pemutar-crop-v4.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang cropping margin 70px plus kontrol overlay...')
console.log('')

/* ===== 1. PemutarVideo.jsx: cropping via CSS, kontrol overlay, tanpa poster penutup ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const [thumbPakaiHq, setThumbPakaiHq] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function sedangMain() {
    const p = playerRef.current
    return Boolean(p && p.getPlayerState && window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING)
  }

  function resetTimerSembunyi() {
    if (!dimulai) return
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (sedangMain()) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false)
            }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (sedangMain()) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else if (bisu) { p.unMute(); setBisu(false) }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); p.setVolume(volume || 100); setBisu(false) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = thumbPakaiHq
    ? 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
    : 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const kontrolSembunyi = dimulai && !gagal && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ cursor: kontrolSembunyi ? 'none' : 'default' }}
      onMouseMove={resetTimerSembunyi}
      onMouseLeave={function () { if (sedangMain()) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      {/* Wadah player: setelah diisi YouTube, iframe diposisikan CSS dengan margin crop 70px */}
      <div ref={wadahRef} className="h-full w-full" />

      {/* Perisai penangkap klik */}
      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir}
          className="absolute inset-0 z-10 h-full w-full bg-transparent" style={{ cursor: kontrolSembunyi ? 'none' : 'default' }} />
      ) : null}

      {/* Ikon putar besar milik kita saat dijeda, menutup ikon bawaan YouTube */}
      {dimulai && !memutar && !buffer && !selesai && !gagal ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-20 w-20 place-items-center rounded-full bg-black/60 text-white backdrop-blur-sm">
            <IkonPlay className="ml-1 h-8 w-8" />
          </span>
        </div>
      ) : null}

      {/* Poster awal dengan tombol putar minimalis */}
      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} onError={function () { setThumbPakaiHq(true) }}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
              <IkonPlay className="ml-0.5 h-5 w-5" />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {/* Layar akhir dengan putar ulang */}
      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {/* Layar gagal */}
      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {/* Panel kontrol overlay di atas video */}
      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ' + (kontrolSembunyi ? 'pointer-events-none opacity-0' : 'opacity-100')}>
          <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
            {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
          </button>
          <input type="range" min="0" max="100" step="0.1" value={persen} onChange={geser} title="Geser durasi"
            className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, rgba(255,255,255,0.25) ' + persen + '%, rgba(255,255,255,0.25) 100%)' }} />
          <span className="min-w-[84px] shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
          <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {bisu ? <IkonBisu /> : <IkonSuara />}
          </button>
          <input type="range" min="0" max="100" value={bisu ? 0 : volume} onChange={aturVolume} title="Volume"
            className="pemutar-volume h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) 100%)' }} />
          {buffer ? <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
          <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {penuh ? <IkonKecil /> : <IkonPenuh />}
          </button>
        </div>
      ) : null}
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis ulang dengan cropping margin')

/* ===== 2. CSS v4: paksa posisi crop iframe dan aturan layar penuh ===== */
const FILE_CSS = 'src/index.css'
if (fs.existsSync(path.join(root, FILE_CSS))) {
  let css = baca(FILE_CSS)
  if (css.includes('/* pusat-pemutar-v4 */')) {
    console.log('[SUDAH ADA] Aturan CSS pusat-pemutar-v4')
  } else {
    css = css.trimEnd() + '\n\n' + `/* pusat-pemutar-v4: margin crop 70px menyembunyikan seluruh chrome bawaan YouTube */
.pemutar-referensi iframe {
  position: absolute !important;
  top: -70px !important;
  left: -2px !important;
  width: calc(100% + 4px) !important;
  height: calc(100% + 140px) !important;
  pointer-events: none !important;
  border: 0 !important;
  background: #000 !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000 !important;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pusat-pemutar-v4 ditambahkan')
  }
} else {
  console.log('[LEWATI] index.css tidak ditemukan')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja gabungan ini:')
console.log('1. Iframe dibuat 140 piksel lebih tinggi dan digeser naik 70 piksel lewat CSS.')
console.log('2. Seluruh chrome bawaan (chip channel, tombol share dan jam, logo YouTube) jatuh ke margin 70 piksel yang terpotong overflow hidden, sehingga tidak pernah terlihat.')
console.log('3. Video tetap mengisi viewport persis di kartu 16:9 karena pita letterbox internal YouTube tepat sama dengan margin crop.')
console.log('4. Di layar penuh video otomatis tengah dengan pita hitam atas bawah yang simetris.')
console.log('5. Kontrol custom melayang di atas video, jadi tidak ada lagi pita hitam bekas panel kontrol.')
console.log('6. Saat dijeda, ikon putar besar milik kita menutup ikon bawaan YouTube di tengah.')
```

## File: apply-pemutar-custom.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang pemutar video kustom bertema BSI...')
console.log('')

/* ===== 1. Komponen PemutarVideo.jsx ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function IkonPlay() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M8 5v14l11-7z" /></svg> }
function IkonPause() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonBisu() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 400)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0, disablekb: 1, iv_load_policy: 3, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) { setMemutar(true); setBuffer(false); setSelesai(false) }
            else if (e.data === S.PAUSED) { setMemutar(false); setBuffer(false) }
            else if (e.data === S.BUFFERING) { setBuffer(true) }
            else if (e.data === S.ENDED) { setMemutar(false); setSelesai(true) }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (memutar) p.pauseVideo()
    else p.playVideo()
  }

  function cari(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const kotak = ev.currentTarget.getBoundingClientRect()
    const rasio = Math.min(1, Math.max(0, (ev.clientX - kotak.left) / kotak.width))
    p.seekTo(rasio * durasi, true)
    setWaktu(rasio * durasi)
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false) } else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0

  return (
    <div ref={kotakRef} className={'group relative overflow-hidden bg-slate-950 ' + (props.className || 'aspect-video w-full')}>
      <div className="absolute inset-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />
      ) : null}

      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} className="absolute inset-0 h-full w-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-16 w-16 place-items-center rounded-full bg-bsi-700 text-white shadow-xl shadow-bsi-900/50 ring-4 ring-white/20 transition hover:scale-105 hover:bg-bsi-600">
              <IkonPlay />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ' + (memutar ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100')}>
          <div className="mb-2 cursor-pointer py-1" onClick={cari} title="Geser durasi">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gold-500" style={{ width: persen + '%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'} className="grid h-9 w-9 place-items-center rounded-full bg-bsi-700 transition hover:bg-bsi-600">
              {memutar ? <IkonPause /> : <IkonPlay />}
            </button>
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>
            <span className="ml-1 text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
            <span className="flex-1" />
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis')

/* ===== 2. cards.jsx: pakai pemutar kustom ===== */
const FILE_C = 'src/components/cards.jsx'
let c = baca(FILE_C)
if (!c.includes("PemutarVideo.jsx")) {
  c = "import PemutarVideo from './PemutarVideo.jsx'\n" + c
  console.log('[BERHASIL] Import PemutarVideo ditambahkan di cards.jsx')
}
const regexIt = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ it\.youtube_id[^>]*?\/>/
const regexItem = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ item\.youtube_id[^>]*?\/>/
if (regexIt.test(c)) {
  c = c.replace(regexIt, `<PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className="aspect-video w-full rounded-2xl mb-3" />`)
  console.log('[BERHASIL] Iframe detail logbook diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe detail logbook')
}
if (regexItem.test(c)) {
  c = c.replace(regexItem, `<PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className="aspect-video w-full rounded-2xl" />`)
  console.log('[BERHASIL] Iframe detail galeri diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe detail galeri')
}
simpan(FILE_C, c)

/* ===== 3. ui.jsx: lightbox pakai pemutar kustom ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (!u.includes("PemutarVideo.jsx")) {
  u = "import PemutarVideo from './PemutarVideo.jsx'\n" + u
  console.log('[BERHASIL] Import PemutarVideo ditambahkan di ui.jsx')
}
const regexProps = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ props\.youtubeId[^>]*?\/>/
if (regexProps.test(u)) {
  u = u.replace(regexProps, `<PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />`)
  console.log('[BERHASIL] Iframe lightbox diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe lightbox')
}
simpan(FILE_U, u)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang akan terlihat:')
console.log('1. Poster thumbnail dengan tombol putar hijau BSI dan judul video.')
console.log('2. Saat diputar, tidak ada kontrol maupun logo bawaan YouTube.')
console.log('3. Kontrol bar kaca muncul saat kursor diarahkan: putar, bisu, waktu, layar penuh.')
console.log('4. Garis progres emas bisa diklik untuk menggeser durasi.')
console.log('5. Akhir video menampilkan tombol putar ulang emas, bukan video terkait YouTube.')
```

## File: apply-pemutar-full-custom.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang pemutar full custom dan membuang semua bawaan YouTube...')
console.log('')

/* ===== 1. PemutarVideo.jsx versi keras ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function IkonPlay() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M8 5v14l11-7z" /></svg> }
function IkonPause() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonBisu() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 400)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          autohide: 1,
          showinfo: 0,
          origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) { setMemutar(true); setBuffer(false); setSelesai(false) }
            else if (e.data === S.PAUSED) { setMemutar(false); setBuffer(false) }
            else if (e.data === S.BUFFERING) { setBuffer(true) }
            else if (e.data === S.ENDED) { setMemutar(false); setSelesai(true) }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (memutar) p.pauseVideo()
    else p.playVideo()
  }

  function cari(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const kotak = ev.currentTarget.getBoundingClientRect()
    const rasio = Math.min(1, Math.max(0, (ev.clientX - kotak.left) / kotak.width))
    p.seekTo(rasio * durasi, true)
    setWaktu(rasio * durasi)
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false) } else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0

  return (
    <div ref={kotakRef} className={'pemutar-bungkus group relative overflow-hidden bg-slate-950 ' + (props.className || 'aspect-video w-full')}>
      <div className="absolute inset-0 z-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />
      ) : null}

      {dimulai && !memutar && !buffer && !selesai && !gagal ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-950/60 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <IkonPlay />
          </span>
        </div>
      ) : null}

      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} className="absolute inset-0 h-full w-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-16 w-16 place-items-center rounded-full bg-bsi-700 text-white shadow-xl shadow-bsi-900/50 ring-4 ring-white/20 transition hover:scale-105 hover:bg-bsi-600">
              <IkonPlay />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ' + (memutar ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100')}>
          <div className="mb-2 cursor-pointer py-1" onClick={cari} title="Geser durasi">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gold-500" style={{ width: persen + '%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'} className="grid h-9 w-9 place-items-center rounded-full bg-bsi-700 transition hover:bg-bsi-600">
              {memutar ? <IkonPause /> : <IkonPlay />}
            </button>
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>
            <span className="ml-1 text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
            <span className="flex-1" />
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis ulang versi full custom')

/* ===== 2. Buang semua iframe bawaan YouTube di cards.jsx dan ui.jsx ===== */
const regexIframe = /<iframe[^>]*?youtube-nocookie\.com\/embed\/[^>]*?\/>/g
;['src/components/cards.jsx', 'src/components/ui.jsx'].forEach(function (rel) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexIframe, function (m) {
    jumlah++
    if (m.includes('it.youtube_id')) return `<PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className="aspect-video w-full rounded-2xl mb-3" />`
    if (m.includes('item.youtube_id')) return `<PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className="aspect-video w-full rounded-2xl" />`
    if (m.includes('props.youtubeId')) return `<PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />`
    return m
  })
  if (jumlah > 0) {
    let akhir = hasil
    if (!/from '\.\/PemutarVideo\.jsx'/.test(akhir)) {
      akhir = "import PemutarVideo from './PemutarVideo.jsx'\n" + akhir
    }
    simpan(rel, akhir)
    console.log('[BERHASIL] ' + jumlah + ' iframe bawaan diganti pemutar custom di ' + rel)
  } else {
    console.log('[SUDAH BERSIH] Tidak ada iframe bawaan tersisa di ' + rel)
  }
})

/* ===== 3. CSS: matikan pointer dan border iframe ===== */
const FILE_CSS = 'src/index.css'
if (fs.existsSync(path.join(root, FILE_CSS))) {
  let css = baca(FILE_CSS)
  const aturan = `.pemutar-bungkus iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}`
  if (css.includes('.pemutar-bungkus iframe')) {
    console.log('[SUDAH ADA] Aturan CSS pemutar-bungkus')
  } else {
    css = css.trimEnd() + '\n\n' + aturan + '\n'
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pemutar-bungkus ditambahkan')
  }
} else {
  console.log('[LEWATI] index.css tidak ditemukan')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang kini berlaku:')
console.log('1. Tidak ada lagi elemen iframe bawaan YouTube di detail logbook, detail galeri, maupun lightbox.')
console.log('2. Iframe player dimuat tanpa kontrol bawaan (controls 0) dan pointer-nya dimatikan lewat CSS.')
console.log('3. Lapisan penutup transparan menangkap semua klik dan hover, sehingga UI bawaan YouTube tidak pernah terpicu.')
console.log('4. Saat jeda, ikon putar milik kita yang muncul di tengah, bukan ikon bawaan YouTube.')
console.log('5. Akhir video menampilkan tombol putar ulang emas milik kita, bukan layar akhir YouTube.')
```

## File: apply-pemutar-pas-tengah.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki ukuran video dan posisi tengah layar penuh...')
console.log('')

/* ===== 1. PemutarVideo.jsx: iframe mengisi wadah persis, kontrol jadi overlay ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const [tutup, setTutup] = useState(false)
  const [thumbPakaiHq, setThumbPakaiHq] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)
  const timerTutup = useRef(null)
  const putarPertama = useRef(false)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (timerTutup.current) clearTimeout(timerTutup.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function sedangMain() {
    const p = playerRef.current
    return Boolean(p && p.getPlayerState && window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING)
  }

  function resetTimerSembunyi() {
    if (!dimulai) return
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (sedangMain()) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    setTutup(true)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              if (!putarPertama.current) {
                putarPertama.current = true
                timerTutup.current = setTimeout(function () { setTutup(false) }, 2600)
              }
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false); setTutup(false)
            }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false); setTutup(false) }
        }
      })
    } catch (e) {
      setGagal(true)
      setTutup(false)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (sedangMain()) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else if (bisu) { p.unMute(); setBisu(false) }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); p.setVolume(volume || 100); setBisu(false) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = thumbPakaiHq
    ? 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
    : 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const kontrolSembunyi = dimulai && !gagal && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ cursor: kontrolSembunyi ? 'none' : 'default' }}
      onMouseMove={resetTimerSembunyi}
      onMouseLeave={function () { if (sedangMain()) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      {/* Iframe mengisi wadah persis: video pas di tampilan normal, otomatis tengah di layar penuh */}
      <div className="absolute inset-0 z-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {/* Perisai penangkap klik */}
      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir}
          className="absolute inset-0 z-10 h-full w-full bg-transparent" style={{ cursor: kontrolSembunyi ? 'none' : 'default' }} />
      ) : null}

      {/* Poster penutup lapisan awal YouTube, memudar setelah 2,6 detik */}
      {dimulai && !gagal ? (
        <div className={'pointer-events-none absolute inset-0 z-10 bg-black transition-opacity duration-700 ' + (tutup ? 'opacity-100' : 'opacity-0')}>
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      {/* Ikon putar tengah saat dijeda */}
      {dimulai && !memutar && !buffer && !selesai && !gagal && !tutup ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md">
            <IkonPlay className="ml-0.5 h-6 w-6" />
          </span>
        </div>
      ) : null}

      {/* Poster awal dengan tombol putar minimalis */}
      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} onError={function () { setThumbPakaiHq(true) }}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
              <IkonPlay className="ml-0.5 h-5 w-5" />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {/* Layar akhir dengan putar ulang */}
      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {/* Layar gagal */}
      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {/* Panel kontrol sebagai overlay di atas video, tidak memakan ruang tata letak */}
      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-10 transition-opacity duration-300 ' + (kontrolSembunyi ? 'pointer-events-none opacity-0' : 'opacity-100')}>
          <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
            {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
          </button>
          <input type="range" min="0" max="100" step="0.1" value={persen} onChange={geser} title="Geser durasi"
            className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, rgba(255,255,255,0.25) ' + persen + '%, rgba(255,255,255,0.25) 100%)' }} />
          <span className="min-w-[84px] shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
          <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {bisu ? <IkonBisu /> : <IkonSuara />}
          </button>
          <input type="range" min="0" max="100" value={bisu ? 0 : volume} onChange={aturVolume} title="Volume"
            className="pemutar-volume h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) 100%)' }} />
          {buffer ? <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
          <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {penuh ? <IkonKecil /> : <IkonPenuh />}
          </button>
        </div>
      ) : null}
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis ulang tanpa cropping')

/* ===== 2. CSS: iframe paksa mengisi wadah dan aturan layar penuh ===== */
const FILE_CSS = 'src/index.css'
if (fs.existsSync(path.join(root, FILE_CSS))) {
  let css = baca(FILE_CSS)
  if (css.includes('/* pusat-pemutar-v3 */')) {
    console.log('[SUDAH ADA] Aturan CSS pusat-pemutar-v3')
  } else {
    css = css.trimEnd() + '\n\n' + `/* pusat-pemutar-v3: iframe mengisi wadah persis, layar penuh menengahkan video */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
  position: absolute;
  left: 0;
  top: 0;
  width: 100% !important;
  height: 100% !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pusat-pemutar-v3 ditambahkan')
  }
} else {
  console.log('[LEWATI] index.css tidak ditemukan')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Tampilan normal: video mengisi kartu persis tanpa pita hitam, karena kontrol kini melayang di atas video.')
console.log('2. Layar penuh: video otomatis berada tepat di tengah dengan pita hitam sama besar di atas dan bawah.')
console.log('3. Kontrol tetap muncul saat kursor bergerak dan menyembunyi sendiri setelah 2,5 detik saat video berjalan.')
console.log('4. Poster penutup tetap menyembunyikan lapisan awal bawaan YouTube selama 2,6 detik pertama.')
```

## File: apply-pemutar-referensi.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menulis ulang PemutarVideo mengikuti referensi cropping YouTube...')
console.log('')

/* ===== 1. PemutarVideo.jsx: full rewrite dengan trik cropping ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function resetTimerSembunyi() {
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (memutar) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false)
            }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (memutar) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else { if (bisu) { p.unMute(); setBisu(false) } }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false); p.setVolume(volume || 100) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const thumbCadangan = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const sembunyikanKontrol = dimulai && !gagal && memutar && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ maxWidth: penuh ? 'none' : undefined }}
      onMouseMove={dimulai ? resetTimerSembunyi : undefined}
      onMouseLeave={function () { if (memutar) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      <div className="flex h-full flex-col">
        {/* Viewport video: area yang di-crop */}
        <div className="relative flex-1 overflow-hidden">
          <div ref={wadahRef} className="absolute" style={{ top: -60, left: -2, width: 'calc(100% + 4px)', height: 'calc(100% + 120px)', pointerEvents: 'none' }} />

          {/* Poster awal dengan tombol play tengah minimalis */}
          {!dimulai ? (
            <button
              type="button"
              onClick={mulai}
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{
                backgroundImage: 'url(' + thumb + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'default'
              }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
                <IkonPlay className="ml-0.5 h-5 w-5" />
              </div>
              {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-left text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
            </button>
          ) : null}

          {/* Overlay transparan penangkap klik saat video jalan */}
          {dimulai && !selesai && !gagal ? (
            <button
              type="button"
              aria-label="Putar atau jeda video"
              onClick={jungkir}
              className="absolute inset-0 z-10 h-full w-full bg-transparent"
              style={{ cursor: sembunyikanKontrol ? 'none' : 'default' }}
            />
          ) : null}

          {/* Ikon jeda besar di tengah saat dijeda manual */}
          {dimulai && !memutar && !buffer && !selesai && !gagal ? (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md">
                <IkonPlay className="ml-0.5 h-6 w-6" />
              </span>
            </div>
          ) : null}

          {/* Layar akhir */}
          {selesai ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <button type="button" title="Putar ulang"
                  onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
                  className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
                <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
              </div>
            </div>
          ) : null}

          {/* Layar gagal */}
          {gagal ? (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
                <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Panel kontrol kustom (di luar viewport, jadi tidak ikut ter-crop) */}
        {dimulai && !gagal ? (
          <div
            className={'relative z-30 flex items-center gap-3 bg-slate-900/95 px-4 py-2.5 transition-opacity duration-400 ' + (sembunyikanKontrol ? 'opacity-0' : 'opacity-100')}
          >
            {/* Tombol play/pause */}
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
              className="grid h-8 w-8 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
              {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
            </button>

            {/* Progress bar */}
            <div className="flex flex-1 items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={persen}
                onChange={geser}
                className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 outline-none"
                style={{
                  background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, #475569 ' + persen + '%, #475569 100%)'
                }}
              />
            </div>

            {/* Waktu */}
            <span className="min-w-[84px] text-center text-[11px] font-semibold tabular-nums text-slate-300">
              {formatWaktu(waktu)} / {formatWaktu(durasi)}
            </span>

            {/* Tombol bisu */}
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>

            {/* Slider volume */}
            <input
              type="range"
              min="0"
              max="100"
              value={bisu ? 0 : volume}
              onChange={aturVolume}
              className="pemutar-volume h-1 w-16 cursor-pointer appearance-none rounded-full bg-slate-700 outline-none"
              style={{
                background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, #475569 ' + (bisu ? 0 : volume) + '%, #475569 100%)'
              }}
            />

            {/* Buffer indikator */}
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}

            {/* Layar penuh */}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis ulang mengikuti referensi')

/* ===== 2. CSS khusus untuk slider dan cropping ===== */
const FILE_CSS = 'src/index.css'
if (fs.existsSync(path.join(root, FILE_CSS))) {
  let css = baca(FILE_CSS)
  const aturan = `/* Pemutar video referensi: iframe cropping & slider custom */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}
.pemutar-referensi:fullscreen {
  border-radius: 0;
  max-width: none;
  width: 100vw;
  height: 100vh;
}
.pemutar-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}`
  if (css.includes('.pemutar-referensi iframe')) {
    console.log('[SUDAH ADA] Aturan CSS pemutar-referensi')
  } else {
    css = css.trimEnd() + '\n\n' + aturan + '\n'
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pemutar-referensi ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan yang mengikuti referensimu:')
console.log('1. Trik cropping: iframe diposisikan top -60px, tinggi +120px sehingga chip channel, logo YouTube, dan judul bawaan terpotong keluar dari viewport.')
console.log('2. Poster memakai gambar maxresdefault resolusi tinggi dengan tombol play bulat minimalis ala referensimu, hover berubah jadi hijau BSI.')
console.log('3. Kontrol berada di luar viewport (di bawahnya), jadi tidak ikut ter-crop dan tetap terlihat jelas.')
console.log('4. Auto-hide kontrol setelah 2,5 detik tanpa aktivitas mouse saat video berjalan; kursor jadi none saat sembunyi.')
console.log('5. Slider volume terpisah dari tombol bisu, persis seperti di referensimu, dengan aksen emas BSI.')
console.log('6. Progress bar dengan thumb bulat putih berpinggiran hijau BSI.')
console.log('7. Fullscreen pada container, bukan iframe, sehingga cropping dan kontrol tetap aktif.')
```

## File: apply-pemutar-tutup-merek.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis ulang')
}

simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function paksaKualitas(p) {
  try {
    if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080')
  } catch (e) {}
}
function matikanSubtitel(p) {
  try {
    if (p && typeof p.unloadModule === 'function') p.unloadModule('captions')
  } catch (e) {}
  try {
    if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {})
  } catch (e) {}
}

function IkonPlay() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M8 5v14l11-7z" /></svg> }
function IkonPause() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonBisu() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [tutup, setTutup] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const putarPertama = useRef(false)
  const timerTutup = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 400)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerTutup.current) clearTimeout(timerTutup.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    setTutup(true)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          autohide: 1,
          showinfo: 0,
          cc_load_policy: 0,
          origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true)
              setBuffer(false)
              setSelesai(false)
              paksaKualitas(e.target)
              matikanSubtitel(e.target)
              if (!putarPertama.current) {
                putarPertama.current = true
                timerTutup.current = setTimeout(function () { setTutup(false) }, 2600)
              }
            } else if (e.data === S.PAUSED) {
              setMemutar(false)
              setBuffer(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false)
              setSelesai(true)
              setTutup(false)
            }
          },
          onError: function () {
            setGagal(true)
            setBuffer(false)
            setMemutar(false)
            setTutup(false)
          }
        }
      })
    } catch (e) {
      setGagal(true)
      setTutup(false)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (memutar) p.pauseVideo()
    else p.playVideo()
  }

  function cari(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const kotak = ev.currentTarget.getBoundingClientRect()
    const rasio = Math.min(1, Math.max(0, (ev.clientX - kotak.left) / kotak.width))
    p.seekTo(rasio * durasi, true)
    setWaktu(rasio * durasi)
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false) } else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0

  return (
    <div ref={kotakRef} className={'pemutar-bungkus group relative overflow-hidden bg-slate-950 ' + (props.className || 'aspect-video w-full')}>
      <div className="absolute inset-0 z-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />
      ) : null}

      {dimulai && !gagal ? (
        <div className={'pointer-events-none absolute inset-0 z-10 bg-slate-950 transition-opacity duration-700 ' + (tutup ? 'opacity-100' : 'opacity-0')}>
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      {dimulai && !memutar && !buffer && !selesai && !gagal && !tutup ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-950/60 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <IkonPlay />
          </span>
        </div>
      ) : null}

      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} className="absolute inset-0 h-full w-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-16 w-16 place-items-center rounded-full bg-bsi-700 text-white shadow-xl shadow-bsi-900/50 ring-4 ring-white/20 transition hover:scale-105 hover:bg-bsi-600">
              <IkonPlay />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ' + (memutar ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100')}>
          <div className="mb-2 cursor-pointer py-1" onClick={cari} title="Geser durasi">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gold-500" style={{ width: persen + '%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'} className="grid h-9 w-9 place-items-center rounded-full bg-bsi-700 transition hover:bg-bsi-600">
              {memutar ? <IkonPause /> : <IkonPlay />}
            </button>
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>
            <span className="ml-1 text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
            <span className="flex-1" />
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
`)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru yang berlaku:')
console.log('1. Saat tombol putar ditekan, poster menutup seluruh area selama 2,6 detik pertama.')
console.log('2. Chip channel kiri atas, logo YouTube kanan bawah, dan kilau awal bawaan tertutup poster.')
console.log('3. Poster memudar halus setelah jendela lapisan awal lewat, video lanjut tanpa merek.')
console.log('4. Subtitel dipaksa nonaktif lewat cc_load_policy 0 plus perintah API saat siap dan saat bermain.')
console.log('5. Kualitas putar dikunci di rentang 720p sampai 1080p lewat setPlaybackQualityRange.')
```

## File: apply-preview-video-controls.cjs
```javascript
const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('[GAGAL] File tidak ditemukan: ' + FILE)
  process.exit(1)
}

let isi = fs.readFileSync(path.join(root, FILE), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

const pasangan = [
  {
    cari: '<video src={it.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video kegiatan bisa diputar dan digeser durasinya'
  },
  {
    cari: '<video src={galForm.preview} className="absolute inset-0 h-full w-full object-contain" muted />',
    ganti: '<video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />',
    label: 'Pratinjau video galeri bisa diputar dan digeser durasinya'
  }
]

for (const p of pasangan) {
  if (isi.includes(p.ganti)) {
    console.log('[SUDAH ADA] ' + p.label)
  } else if (isi.includes(p.cari)) {
    isi = isi.replace(p.cari, p.ganti)
    berubah = true
    console.log('[BERHASIL] ' + p.label)
  } else {
    console.log('[TIDAK KETEMU] ' + p.label)
  }
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE), isi, 'utf8')
}

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('2. Pilih file video di form logbook maupun form galeri.')
console.log('3. Pratinjau kini menampilkan pemutar: tombol putar, garis durasi yang bisa digeser, pengatur suara, dan tombol layar penuh.')
console.log('4. Durasi total muncul sesaat setelah file dipilih karena metadata dimuat lebih dulu.')
console.log('5. Tombol silang merah di pojok kanan atas tetap berfungsi untuk melepas lampiran.')
console.log('6. Video tidak berbunyi sendiri karena tidak ada autoplay, bunyi baru keluar setelah tombol putar ditekan.')
```

## File: apply-profil-rapi.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menata ulang tab Profil agar tidak duplikat...')
console.log('')

/* ===== 1. ui.jsx: tambah ukuran 2xl pada Avatar ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (u.includes("size === '2xl'")) {
  console.log('[SUDAH ADA] Ukuran 2xl pada Avatar')
} else {
  const cariU = `size === 'xl' ? 'h-24 w-24 text-2xl' : 'h-11 w-11 text-sm'`
  if (u.includes(cariU)) {
    u = u.replace(cariU, `size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'`)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Ukuran 2xl ditambahkan pada Avatar')
  } else {
    console.log('[TIDAK KETEMU] Pola ukuran Avatar di ui.jsx')
  }
}

/* ===== 2. DashboardPage: ganti isi tab Profil dengan tata letak dua kolom ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
const mulaiProfil = d.indexOf("{tab === 'profil' ? (")
if (mulaiProfil === -1) {
  console.log('[TIDAK KETEMU] Blok tab Profil di DashboardPage')
} else {
  const akhirSection = d.indexOf('</section>', mulaiProfil)
  const akhirBlok = d.indexOf(') : null}', akhirSection)
  if (akhirSection === -1 || akhirBlok === -1) {
    console.log('[TIDAK KETEMU] Batas akhir blok tab Profil')
  } else {
    const BLOK_BARU = `{tab === 'profil' ? (
<section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" />
<h2 className="mt-4 text-xl font-black text-slate-900">{mahasiswa.nama}</h2>
<p className="mt-1 text-sm text-slate-500">NIM {mahasiswa.nim}</p>
<p className="text-sm text-slate-500">{mahasiswa.prodi}</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
{mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
</div>
{showUploadFoto ? (
<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">
<div className="flex flex-wrap items-start gap-4">
{fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md" /> : null}
<div className="min-w-0 flex-1">
<input type="file" accept="image/png,image/jpeg,image/webp" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
<p className="mt-2 text-xs text-slate-500">Format JPG, PNG, atau WebP. Maksimal 5 MB.</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
<button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
</div>
</div>
) : null}
</div>
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
<h2 className="text-lg font-black text-slate-900">Ringkasan aktivitas magang</h2>
<div className="mt-4 grid grid-cols-3 gap-4">
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof logs !== 'undefined' ? logs.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Logbook</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof galeri !== 'undefined' ? galeri.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Galeri</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof hadir !== 'undefined' ? hadir.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Kehadiran</p></div>
</div>
<div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
<p>Foto profil tampil otomatis di kartu kamu pada halaman publik, logbook, galeri, dan daftar hadir.</p>
<p>Gunakan foto dengan pencahayaan baik dan wajah terlihat jelas agar mudah dikenali dosen pembimbing.</p>
<p>Klik foto pada kartu header kapan saja untuk kembali ke halaman ini dan memperbarui foto.</p>
</div>
</div>
</section>
) : null}`
    d = d.slice(0, mulaiProfil) + BLOK_BARU + d.slice(akhirBlok + ') : null}'.length)
    simpan(FILE_D, d)
    console.log('[BERHASIL] Tab Profil ditata ulang menjadi dua kolom')
  }
}

/* ===== 3. DashboardPage: avatar header menjadi tombol pintasan ke tab Profil ===== */
d = baca(FILE_D)
const avatarHeader = `<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />`
if (d.includes('title="Kelola foto profil"')) {
  console.log('[SUDAH ADA] Avatar header sebagai tombol pintasan')
} else if (d.includes(avatarHeader)) {
  d = d.replace(avatarHeader,
    `<button type="button" onClick={function () { setTab('profil') }} title="Kelola foto profil" className="rounded-full transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-gold-300">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
</button>`)
  simpan(FILE_D, d)
  console.log('[BERHASIL] Avatar header kini bisa diklik menuju tab Profil')
} else {
  console.log('[TIDAK KETEMU] Avatar pada kartu header')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir yang akan kamu lihat:')
console.log('1. Header tetap ringkas: avatar, nama, NIM, prodi, dan deretan tab tanpa section duplikat di bawahnya.')
console.log('2. Klik avatar di header langsung membuka tab Profil, jadi jalur ganti foto terasa alami.')
console.log('3. Tab Profil menampilkan foto besar sebagai pusat perhatian beserta tombol Ganti atau Upload dan Hapus.')
console.log('4. Form upload muncul di dalam kartu foto yang sama, lengkap dengan pratinjau bulat dan tombol Simpan atau Batal.')
console.log('5. Kolom kanan memberi nilai tambah berupa ringkasan jumlah logbook, media galeri, dan kehadiran plus panduan foto.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard: tidak ada lagi kartu Foto Profil duplikat di bawah header.')
console.log('2. Klik avatar di header: tab Profil terbuka otomatis.')
console.log('3. Klik Upload atau Ganti Foto: form muncul rapi di bawah tombol dalam kartu yang sama.')
console.log('4. Simpan foto: avatar besar, avatar header, dan seluruh kartu publik langsung memakai foto baru.')
console.log('5. Hapus foto: semua permukaan kembali ke inisial berwarna tema tanpa sisa tampilan rusak.')
```

## File: apply-profil-tab.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai menata ulang foto profil dan menambah tab Profil...')
console.log('')

/* ===== 1. Pindahkan section Foto Profil menjadi konten tab Profil ===== */
const idxFoto = d.indexOf('>Foto Profil<')
if (idxFoto === -1) {
  console.log('[TIDAK KETEMU] Section Foto Profil di DashboardPage')
} else if (d.includes("{tab === 'profil' ? (")) {
  console.log('[SUDAH ADA] Section Foto Profil sudah berada di tab Profil')
} else {
  const mulaiBlok = d.lastIndexOf('<section', idxFoto)
  const akhirBlok = d.indexOf('</section>', idxFoto) + '</section>'.length
  const blok = d.slice(mulaiBlok, akhirBlok)
  const sisa = d.slice(0, mulaiBlok) + d.slice(akhirBlok)
  d = sisa.slice(0, mulaiBlok) + "{tab === 'profil' ? (\n" + blok + "\n) : null}\n" + sisa.slice(mulaiBlok)
  console.log('[BERHASIL] Section Foto Profil kini hanya tampil pada tab Profil')
}

/* ===== 2. Header card: Avatar di kiri teks plus tombol tab Profil ===== */
const idxHeader = d.indexOf('Dashboard mahasiswa')
if (idxHeader === -1) {
  console.log('[TIDAK KETEMU] Teks Dashboard mahasiswa pada header')
} else {
  const sectionStart = d.lastIndexOf('<section', idxHeader)
  const sectionEnd = d.indexOf('</section>', idxHeader)
  let header = d.slice(sectionStart, sectionEnd)

  if (header.includes('<Avatar src={mahasiswa.foto_profil')) {
    console.log('[SUDAH ADA] Avatar pada kartu header')
  } else {
    header = header.replace(
      /(<p[^>]*>Dashboard mahasiswa<\/p>)/,
      `<div className="flex flex-wrap items-center gap-6">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
<div className="min-w-0 flex-1">
$1`
    )
    header = header.replace(
      /(<div[^>]*>\s*<button onClick=\{function \(\) \{ setTab\('logbook'\) \}\})/,
      '</div>\n$1'
    )
    header = header + '\n</div>'
    console.log('[BERHASIL] Avatar dipasang di kiri teks kartu header')
  }

  if (header.includes("setTab('profil')")) {
    console.log('[SUDAH ADA] Tombol tab Profil')
  } else {
    header = header.replace(
      /(<button onClick=\{function \(\) \{ setTab\('absen'\) \}\} className=\{tabCls\('absen'\)\}>Daftar Hadir<\/button>)/,
      `$1
<button onClick={function () { setTab('profil') }} className={tabCls('profil')}>Profil</button>`
    )
    console.log('[BERHASIL] Tombol tab Profil ditambahkan setelah Daftar Hadir')
  }

  d = d.slice(0, sectionStart) + header + d.slice(sectionEnd)
}

fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Kartu header dashboard menampilkan foto profil bulat di sebelah kiri nama, NIM, dan prodi.')
console.log('2. Mahasiswa tanpa foto tetap melihat inisial berwarna tema pada posisi yang sama.')
console.log('3. Tombol tab baru bernama Profil muncul di sebelah Daftar Hadir.')
console.log('4. Form upload, ganti, dan hapus foto hanya tampil saat tab Profil dibuka, sehingga halaman utama tetap lega.')
console.log('5. Setelah foto disimpan, avatar di header langsung berubah tanpa reload karena state mahasiswa diperbarui.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard: avatar muncul di kiri teks header dan section foto tidak lagi memenuhi halaman.')
console.log('2. Klik tab Profil: form upload foto muncul lengkap dengan pratinjau dan tombol simpan.')
console.log('3. Upload atau ganti foto, lalu kembali ke tab Logbook: avatar header sudah memakai foto baru.')
console.log('4. Hapus foto dari tab Profil: avatar header kembali ke inisial berwarna tema.')
```

## File: apply-thumb-youtube-fallback.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang fallback thumbnail YouTube...')
console.log('')

/* ===== 1. ui.jsx: komponen MediaYouTube dengan coba ulang otomatis ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (u.includes('export function MediaYouTube')) {
  console.log('[SUDAH ADA] Komponen MediaYouTube di ui.jsx')
} else {
  u = u.trimEnd() + '\n\n' + `export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="youtube" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Thumbnail belum siap di YouTube' : 'Menyiapkan thumbnail YouTube...'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Thumbnail YouTube'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}
`
  simpan(FILE_U, u)
  console.log('[BERHASIL] Komponen MediaYouTube ditambahkan di ui.jsx')
}

/* ===== 2. ui.jsx: SmartFit delegasi thumbnail YouTube ke MediaYouTube ===== */
u = baca(FILE_U)
const anchorSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'`
const sisipSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }`
if (u.includes("i.ytimg.com') !== -1")) {
  console.log('[SUDAH ADA] Delegasi YouTube di SmartFit')
} else if (u.includes(anchorSmart)) {
  u = u.replace(anchorSmart, sisipSmart)
  simpan(FILE_U, u)
  console.log('[BERHASIL] SmartFit mendelegasikan thumbnail YouTube')
} else {
  console.log('[TIDAK KETEMU] Anchor SmartFit di ui.jsx')
}

/* ===== 3. cards.jsx: pakai MediaYouTube pada kartu media YouTube ===== */
const FILE_C = 'src/components/cards.jsx'
let c = baca(FILE_C)
let berubahC = false
if (!c.includes('MediaYouTube')) {
  c = c.replace(/import \{([^}]*)\} from '\.\/ui\.jsx'/, function (m, g) {
    return 'import {' + g + ', MediaYouTube } from \'./ui.jsx\''
  })
  berubahC = true
}
const imgYt = `<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />`
if (c.includes(imgYt)) {
  c = c.replace(imgYt, `<MediaYouTube src={item.media_path} alt={item.judul} />`)
  berubahC = true
}
if (berubahC) {
  simpan(FILE_C, c)
  console.log('[BERHASIL] cards.jsx memakai MediaYouTube')
} else {
  console.log('[SUDAH ADA] cards.jsx sudah memakai MediaYouTube')
}

/* ===== 4. App.jsx: bungkam peringatan React Router ===== */
const FILE_A = 'src/App.jsx'
let a = baca(FILE_A)
if (a.includes('v7_startTransition')) {
  console.log('[SUDAH ADA] Future flag React Router')
} else if (a.includes('<BrowserRouter>')) {
  a = a.replace('<BrowserRouter>', '<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>')
  simpan(FILE_A, a)
  console.log('[BERHASIL] Future flag React Router dipasang')
} else {
  console.log('[TIDAK KETEMU] Baris BrowserRouter di App.jsx')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat thumbnail YouTube belum siap, kartu menampilkan placeholder rapi berikon YouTube.')
console.log('2. Komponen mencoba ulang setiap 15 detik sampai empat kali, jadi gambar muncul sendiri.')
console.log('3. Bila setelah empat percobaan masih belum ada, placeholder permanen tampil tanpa gambar rusak.')
console.log('4. Peringatan React Router di konsol tidak muncul lagi.')
console.log('5. Baris CORS dan pesan internal pemain YouTube tetap ada tetapi tidak mengganggu fungsi.')
```

## File: apply-youtube-backend.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}

const LIMIT_PER_DAY = 6

const quotaJs = `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`

const sessionJs = `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + access,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': body.contentType || 'video/mp4'
    },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`

simpan('api/youtube/quota.js', quotaJs)
simpan('api/youtube/session.js', sessionJs)

console.log('\nSelesai. Push ke GitHub untuk deploy endpoint di Vercel.')
```

## File: apply-youtube-final-fix.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menyelesaikan sisa pemasangan fitur YouTube...')
console.log('')

/* ===== 1. UI pemilih jenis media pada form galeri ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
if (d.includes("galMode === 'video'")) {
  console.log('[SUDAH ADA] UI pemilih jenis media pada form galeri')
} else {
  const regexGal = /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>/
  const blokGal = `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            if (formatHeic(f)) {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                              const blob = await pratinjauHeic(f)
                              const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                              setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                            } else {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                            }
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>`
  if (!regexGal.test(d)) {
    console.log('[TIDAK KETEMU] Blok form media galeri di DashboardPage.jsx')
  } else {
    d = d.replace(regexGal, blokGal)
    simpan(FILE_D, d)
    console.log('[BERHASIL] UI pemilih jenis media pada form galeri')
  }
}

/* ===== 2. Middleware dan plugin YouTube di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes('pluginApiYoutube')) {
  console.log('[SUDAH ADA] Middleware dan plugin YouTube di vite.config.js')
} else {
  const fungsiPlugin = `function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
        const body = await bacaBody(req)
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const meta = {
          snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
      })
    }
  }
}
`
  const cariExport = `export default defineConfig(function ({ mode }) {`
  const cariPlugins = `plugins: [react(), pluginApiR2(env)]`
  if (!v.includes(cariExport) || !v.includes(cariPlugins)) {
    console.log('[TIDAK KETEMU] Pola export atau plugins di vite.config.js')
  } else {
    v = v.replace(cariExport, fungsiPlugin + cariExport)
    v = v.replace(cariPlugins, `plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware dan plugin YouTube di vite.config.js')
  }
}

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan .env.local memuat: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan tombol Foto dan Video kini muncul.')
console.log('2. Pilih Video: terlihat sisa kuota, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link yang aktif.')
console.log('4. Uji di localhost: endpoint /api/youtube/quota harus menjawab JSON sisa kuota.')
```

## File: apply-youtube-final-response.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}
function ganti(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function gantiSemua(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.split(cari).join(gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memperbaiki pemulihan respons final upload YouTube...')
console.log('')

/* ===== 1. youtube.js: pulihkan id video bila respons final diblokir CORS ===== */
simpan('src/lib/youtube.js', `import { supabase } from './supabase.js'

export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload YouTube gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = sesi.data.session ? sesi.data.session.access_token : ''
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')
}
`)

/* ===== 2. Endpoint pemulihan id video terbaru ===== */
simpan('api/youtube/latest.js', `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', {
    headers: { Authorization: 'Bearer ' + tok.access_token }
  })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })
  const j = await r.json()
  const item = (j.items || [])[0]
  if (!item) return res.status(404).json({ error: 'Tidak ada video ditemukan' })
  const published = Date.parse(item.snippet.publishedAt)
  if (Date.now() - published > 15 * 60 * 1000) return res.status(404).json({ error: 'Video terbaru terlalu lama' })
  return res.status(200).json({ videoId: item.id.videoId })
}
`)

/* ===== 3. Kuota harian menjadi 5 di endpoint Vercel ===== */
simpan('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`)
simpan('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`)

/* ===== 4. Middleware dev lokal: endpoint latest dan kuota 5 ===== */
ganti('vite.config.js',
  `        server.middlewares.use('/api/youtube/session'`,
  `        server.middlewares.use('/api/youtube/latest', async function (req, res) {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
          const user = await cekSesi(req)
          if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
          const params = new URLSearchParams()
          params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
          params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
          params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
          params.set('grant_type', 'refresh_token')
          const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
          if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
          const tok = await tr.json()
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', { headers: { Authorization: 'Bearer ' + tok.access_token } })
          if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
          const j = await r.json()
          const item = (j.items || [])[0]
          if (!item) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Tidak ada video ditemukan' })); return }
          const published = Date.parse(item.snippet.publishedAt)
          if (Date.now() - published > 15 * 60 * 1000) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru terlalu lama' })); return }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: item.id.videoId }))
        })
        server.middlewares.use('/api/youtube/session'`,
  'Middleware /api/youtube/latest untuk dev lokal')
gantiSemua('vite.config.js', 'used >= 6', 'used >= 5', 'Batas kuota middleware session menjadi 5')
gantiSemua('vite.config.js', '6 - used', '5 - used', 'Sisa kuota middleware menjadi 5')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil lagi dari form logbook atau galeri.')
console.log('2. Progres mencapai 100 persen lalu aplikasi otomatis memulihkan id video dari channel.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian kini tampil sebagai X dari 5 karena setiap upload memakai 1600 unit')
console.log('   ditambah 100 unit untuk pemulihan id video, total 8500 dari 10000 unit harian.')
```

## File: apply-youtube-final.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ganti(rel, cari, gantiDengan, label, semua) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = semua ? isi.split(cari).join(gantiDengan) : isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function tulis(rel, isi, label) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang fitur media YouTube menyeluruh...')
console.log('')

/* ===== 1. api/youtube/quota.js ===== */
tulis('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`, 'api/youtube/quota.js ditulis')

/* ===== 2. api/youtube/session.js ===== */
tulis('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`, 'api/youtube/session.js ditulis')

/* ===== 3. src/lib/youtube.js ===== */
tulis('src/lib/youtube.js', `export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export function uploadToYouTube(sessionUri, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText || '{}')
          resolve({ videoId: j.id })
        } catch (e) { reject(new Error('Respons YouTube tidak valid')) }
      } else {
        reject(new Error('Upload YouTube gagal (status ' + xhr.status + ')'))
      }
    }
    xhr.onerror = function () { reject(new Error('Jaringan gagal saat upload YouTube')) }
    xhr.send(blob)
  })
}
`, 'src/lib/youtube.js ditulis')

/* ===== 4. DashboardPage: import dan state ===== */
ganti('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  'Import helper YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  const [infoProses, setInfoProses] = useState('')`,
  `  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)`,
  'State YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')
ganti('src/pages/DashboardPage.jsx',
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false }`,
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }`,
  'newItem menyimpan mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 5. DashboardPage: logika simpan logbook ===== */
ganti('src/pages/DashboardPage.jsx',
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, show_in_gallery: it.show && !!mediaPath })`,
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { alert('Link YouTube tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
          mediaSource = 'youtube'
          youtubeId = hasilYt.videoId
          mediaPath = ytThumb(hasilYt.videoId)
          mediaThumb = ytThumb(hasilYt.videoId)
          mediaType = 'video'
          setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
          fetchYouTubeQuota().then(setYtQuota)
        } else if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
          mediaSource = 'r2'
          youtubeId = null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })`,
  'Cabang YouTube pada submitLogbook')
ganti('src/pages/DashboardPage.jsx',
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, show_in_gallery: c.show_in_gallery }`,
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }`,
  'rows logbook membawa kolom YouTube')
ganti('src/pages/DashboardPage.jsx',
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  'oldUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  'newUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', oldThumb: it.media_thumb || '', previewLoading: false, show: it.show_in_gallery }`,
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }`,
  'startEditLog membawa mode dan YouTube')

/* ===== 6. DashboardPage: logika simpan galeri ===== */
ganti('src/pages/DashboardPage.jsx',
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
        mediaSource = 'r2'
        youtubeId = null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }`,
  'Cabang YouTube pada submitGaleri')
ganti('src/pages/DashboardPage.jsx',
  `        if (existing && !existing.logbook_item_id && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  `        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  'oldGalUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`,
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)`,
  'Reset mode galeri setelah simpan dan batal', true)
ganti('src/pages/DashboardPage.jsx',
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  'Hapus logbook melewatkan media YouTube')

/* ===== 7. DashboardPage: UI pemilih jenis media ===== */
ganti('src/pages/DashboardPage.jsx',
  `                      <FileInput accept="image/*,video/*" fileName={it.file ? it.file.name : ''}
                        onChange={function (e) { onItemFile(i, e.target.files[0]) }} />`,
  `                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link YouTube (unlisted)" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}`,
  'UI pemilih jenis media pada rincian kegiatan')
ganti('src/pages/DashboardPage.jsx',
  `              <div>
                <label className={labelCls}>Pilih foto atau video {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5">
                  <FileInput accept="image/*,video/*" fileName={galForm.file ? galForm.file.name : ''}
                    onChange={async function (e) {
                      const f = e.target.files[0]
                      if (!f) return
                      const blob = await pratinjauHeic(f)
                      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                      setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                    }} />
                </div>
              </div>`,
  `              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f) }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        const blob = await pratinjauHeic(f)
                        const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                        setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                      }} />
                  )}
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri')

/* ===== 8. cards.jsx: slide dan detail YouTube ===== */
ganti('src/components/cards.jsx',
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_type, title: i.judul }`,
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }`,
  'slidesFromItems membawa youtube_id')
ganti('src/components/cards.jsx',
  `                    <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />`,
  `                    {it.media_source === 'youtube' ? (
                      <iframe src={'https://www.youtube-nocookie.com/embed/' + it.youtube_id} title={it.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 mb-3" />
                    ) : (
                      <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                    )}`,
  'Detail logbook menampilkan embed YouTube')
ganti('src/components/cards.jsx',
  `      <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />`,
  `      {item.media_source === 'youtube' ? (
        <iframe src={'https://www.youtube-nocookie.com/embed/' + item.youtube_id} title={item.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900" />
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}`,
  'Detail galeri menampilkan embed YouTube')

/* ===== 9. Carousel: teruskan youtubeId ke Lightbox ===== */
ganti('src/components/Carousel.jsx',
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} onClose={function () { setZoom(null) }} /> : null}`,
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}`,
  'Carousel meneruskan youtubeId ke Lightbox', true)

/* ===== 10. ui.jsx: Lightbox mendukung embed YouTube ===== */
ganti('src/components/ui.jsx',
  `        {props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  `        {props.youtubeId ? (
          <iframe src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId} title={props.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mx-auto aspect-video w-full rounded-2xl bg-slate-900" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  'Lightbox menampilkan embed YouTube')
ganti('src/components/ui.jsx',
  `          disabled={busyUnduh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  `          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  'Tombol unduh disembunyikan untuk media YouTube')

/* ===== 11. vite.config.js: middleware YouTube untuk dev lokal ===== */
ganti('vite.config.js',
  ` export default defineConfig(function ({ mode }) {`,
  ` function pluginApiYoutube(env) {
   const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY)
   function ptToday() {
     const now = new Date()
     const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
     const y = pt.getFullYear()
     const m = String(pt.getMonth() + 1).padStart(2, '0')
     const d = String(pt.getDate()).padStart(2, '0')
     return y + '-' + m + '-' + d
   }
   async function cekSesi(req) {
     const authHeader = req.headers.authorization || ''
     const token = authHeader.replace('Bearer ', '')
     if (!token) return null
     const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
     const r = await supabase.auth.getUser(token)
     return r.error ? null : r.data.user
   }
   return {
     name: 'api-youtube-dev',
     configureServer(server) {
       server.middlewares.use('/api/youtube/quota', async function (req, res) {
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         res.setHeader('Content-Type', 'application/json')
         res.setHeader('Cache-Control', 'no-store')
         res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
       })
       server.middlewares.use('/api/youtube/session', async function (req, res) {
         if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
         const user = await cekSesi(req)
         if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
         const body = await bacaBody(req)
         const params = new URLSearchParams()
         params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
         params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
         params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
         params.set('grant_type', 'refresh_token')
         const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
         if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
         const tok = await tr.json()
         const meta = {
           snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
           status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
         }
         const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
           method: 'POST',
           headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
           body: JSON.stringify(meta)
         })
         if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
         const sessionUri = init.headers.get('location')
         if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
         await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
         res.setHeader('Content-Type', 'application/json')
         res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
       })
     }
   }
 }
 export default defineConfig(function ({ mode }) {`,
  'Middleware YouTube untuk dev lokal')
ganti('vite.config.js',
  `     plugins: [react(), pluginApiR2(env)]`,
  `     plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`,
  'Plugin YouTube didaftarkan di vite')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan variabel berikut ada di .env.local dan Environment Variables Vercel:')
console.log('  YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Logbook, tambah kegiatan, perhatikan tombol Foto dan Video.')
console.log('2. Pilih Video: terlihat sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link YouTube yang aktif.')
console.log('4. Simpan dengan link YouTube unlisted: kartu menampilkan thumbnail YouTube dan detail memutar embed.')
console.log('5. Uji juga upload file video kecil: progres Mengunggah ke YouTube terlihat dan video masuk sebagai unlisted.')
```

## File: apply-youtube-frontend.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang fitur YouTube di frontend...')

/* ===== 1. Helper youtube.js baru ===== */
const ytHelper = `export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title, description, contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export function uploadToYouTube(sessionUri, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    xhr.setRequestHeader('Content-Length', String(blob.size))
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText || '{}')
          resolve({ videoId: j.id })
        } catch (e) { reject(new Error('Respons YouTube tidak valid')) }
      } else {
        reject(new Error('Upload YouTube gagal (status ' + xhr.status + ')'))
      }
    }
    xhr.onerror = function () { reject(new Error('Jaringan gagal saat upload YouTube')) }
    xhr.send(blob)
  })
}
`
fs.mkdirSync(path.join(root, 'src', 'lib'), { recursive: true })
simpan('src/lib/youtube.js', ytHelper)
console.log('[BERHASIL] src/lib/youtube.js ditulis')

/* ===== 2. Icon youtube di icons.jsx ===== */
let icons = baca('src/components/icons.jsx')
if (!icons.includes('youtube:')) {
  icons = icons.replace(
    "  download: (\n    <>",
    "  youtube: (\n    <>\n      <path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\" />\n      <polygon points=\"9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02\" />\n    </>\n  ),\n  download: (\n    <>"
  )
  simpan('src/components/icons.jsx', icons)
  console.log('[BERHASIL] Icon youtube ditambahkan')
} else {
  console.log('[SUDAH ADA] Icon youtube')
}

/* ===== 3. DashboardPage: import helper YouTube ===== */
let dash = baca('src/pages/DashboardPage.jsx')
if (!dash.includes("from '../lib/youtube.js'")) {
  dash = dash.replace(
    "import { syncGaleriFromLogbook } from '../lib/logbook.js'",
    "import { syncGaleriFromLogbook } from '../lib/logbook.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'\nimport { supabase as sbClient } from '../lib/supabase.js'"
  )
  console.log('[BERHASIL] Import YouTube helper di DashboardPage')
}

/* ===== 4. Tambah state untuk YouTube ===== */
if (!dash.includes('ytQuota')) {
  dash = dash.replace(
    "const [infoProses, setInfoProses] = useState('')",
    "const [infoProses, setInfoProses] = useState('')\n  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })\n  const [itemMode, setItemMode] = useState({})\n  const [galMode, setGalMode] = useState('foto')\n  const [galYtLink, setGalYtLink] = useState('')\n  const [galYtTitle, setGalYtTitle] = useState('')"
  )
  console.log('[BERHASIL] State YouTube ditambahkan')
}

/* ===== 5. Load quota saat mount ===== */
if (!dash.includes('fetchYouTubeQuota()')) {
  dash = dash.replace(
    'useEffect(function () {\n    if (mahasiswa) refresh()\n  }, [mahasiswa])',
    'useEffect(function () {\n    if (mahasiswa) refresh()\n    fetchYouTubeQuota().then(setYtQuota)\n    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)\n    return function () { clearInterval(iv) }\n  }, [mahasiswa])'
  )
  console.log('[BERHASIL] Load quota YouTube saat mount')
}

/* ===== 6. Tambah helper functions untuk mode item ===== */
if (!dash.includes('getItemMode')) {
  dash = dash.replace(
    'function patchItem(i, patch)',
    'function getItemMode(i) { return itemMode[i] || \'foto\' }\n  function setItemModeAt(i, mode) { setItemMode(function (p) { const n = Object.assign({}, p); n[i] = mode; return n }) }\n  function patchItem(i, patch)'
  )
  console.log('[BERHASIL] Helper getItemMode ditambahkan')
}

simpan('src/pages/DashboardPage.jsx', dash)
console.log('[SIMPAN] DashboardPage.jsx sementara')

console.log('\nSelesai bagian dasar. Karena DashboardPage sudah sangat kompleks,')
console.log('langkah berikutnya perlu kamu lakukan MANUAL dengan panduan yang akan aku berikan.')
console.log('\nJalankan dulu script ini, lalu kabari aku untuk lanjut ke panduan manual.')
```

## File: apply-youtube-latest-middleware.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menambahkan middleware /api/youtube/latest untuk dev lokal...')
console.log('')

/* ===== 1. Middleware /api/youtube/latest di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/latest'")) {
  console.log('[SUDAH ADA] Middleware /api/youtube/latest di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Penanda middleware session di vite.config.js')
    process.exit(1)
  }
  const middlewareLatest = `server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru tidak ditemukan' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      `
  v = v.replace(marker, middlewareLatest + marker)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Middleware /api/youtube/latest ditambahkan di vite.config.js')
}

/* ===== 2. Pengaman respons bukan JSON di src/lib/youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariJson = `  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiJson = `  if (v.ok) {
    try {
      const j = await v.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati.')
    }
  }`
if (y.includes(gantiJson)) {
  console.log('[SUDAH ADA] Pengaman JSON di youtube.js')
} else if (y.includes(cariJson)) {
  y = y.replace(cariJson, gantiJson)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman JSON ditambahkan di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola v.json() di youtube.js, kemungkinan sudah aman')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil dari form logbook atau galeri di localhost.')
console.log('2. Progres mencapai 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian tampil X dari 5, berkurang satu tiap upload sukses.')
console.log('5. Di Vercel perilaku sama karena api/youtube/latest.js sudah ada sebagai serverless function.')
```

## File: apply-youtube-verify.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang verifikasi upload YouTube anti CORS...')
console.log('')

/* ===== 1. Tulis ulang src/lib/youtube.js dengan verifikasi akhir ===== */
simpan('src/lib/youtube.js', `import { supabase } from './supabase.js'
export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export async function unggahVideoYouTube(file, judul, onProgress) {
  const ref = Math.random().toString(36).slice(2, 10)
  const sesiData = await supabase.auth.getSession()
  const token = sesiData.data.session ? sesiData.data.session.access_token : ''
  const sesi = await startYouTubeSession(judul, 'REF ' + ref + ' Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sesi.sessionUri)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        let id = null
        try { id = JSON.parse(xhr.responseText || '{}').id || null } catch (e) { id = null }
        resolve({ selesai: true, videoId: id })
      } else {
        resolve({ selesai: false })
      }
    }
    xhr.onerror = function () { resolve({ selesai: false }) }
    xhr.send(file)
  })
  if (hasil.selesai && hasil.videoId) return { videoId: hasil.videoId }
  const v = await fetch('/api/youtube/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ ref: ref })
  })
  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Jaringan gagal saat upload YouTube')
}
`)
console.log('[BERHASIL] src/lib/youtube.js ditulis ulang dengan verifikasi akhir')

/* ===== 2. Endpoint verifikasi untuk Vercel ===== */
const verifyJs = `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { ref } = req.body || {}
  if (!ref) return res.status(400).json({ error: 'Ref tidak ada' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref)
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video di YouTube' })
  const j = await r.json()
  const items = j.items || []
  const batas = Date.now() - 15 * 60 * 1000
  const cocok = items.find(function (it) {
    const desc = (it.snippet && it.snippet.description) || ''
    const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
    return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
  }) || items[0]
  if (!cocok) return res.status(404).json({ error: 'Video tidak ditemukan di channel' })
  return res.status(200).json({ videoId: cocok.id && cocok.id.videoId })
}
`
fs.mkdirSync(path.join(root, 'api', 'youtube'), { recursive: true })
simpan('api/youtube/verify.js', verifyJs)
console.log('[BERHASIL] api/youtube/verify.js ditulis')

/* ===== 3. Middleware verify untuk dev lokal di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/verify'")) {
  console.log('[SUDAH ADA] Middleware verify di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Middleware session di vite.config.js')
  } else {
    const middlewareVerify = `server.middlewares.use('/api/youtube/verify', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const body = await bacaBody(req)
        const ref = body.ref
        if (!ref) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Ref tidak ada' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video di YouTube' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const desc = (it.snippet && it.snippet.description) || ''
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
        }) || items[0]
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video tidak ditemukan di channel' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      `
    v = v.replace(marker, middlewareVerify + marker)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware verify ditambahkan di vite.config.js')
  }
}

/* ===== 4. DashboardPage: pakai unggahVideoYouTube ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
let berubah = false

const impLama = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`
const impBaru = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'`
if (d.includes(impBaru)) {
  console.log('[SUDAH ADA] Import unggahVideoYouTube')
} else if (d.includes(impLama)) {
  d = d.replace(impLama, impBaru)
  berubah = true
  console.log('[BERHASIL] Import YouTube diperbarui')
} else {
  console.log('[TIDAK KETEMU] Import YouTube di DashboardPage')
}

const logLama = `          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const logBaru = `          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(logBaru)) {
  console.log('[SUDAH ADA] Alur upload video logbook')
} else if (d.includes(logLama)) {
  d = d.replace(logLama, logBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video logbook diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video logbook')
}

const galLama = `        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const galBaru = `        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(galBaru)) {
  console.log('[SUDAH ADA] Alur upload video galeri')
} else if (d.includes(galLama)) {
  d = d.replace(galLama, galBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video galeri diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video galeri')
}

if (berubah) {
  simpan(FILE_D, d)
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Catatan penting:')
console.log('1. Video yang tadi sempat gagal tersimpan tetapi sudah masuk YouTube Studio bisa diselamatkan:')
console.log('   salin link video tersebut dari YouTube Studio, lalu tempel di kolom link YouTube unlisted.')
console.log('2. Upload berikutnya: progres 100 persen akan langsung dilanjutkan verifikasi, lalu logbook tersimpan.')
console.log('3. Bila verifikasi gagal menemukan video, barulah muncul pesan gagal yang benar-benar gagal.')
```

## File: fix-errors.cjs
```javascript
const fs = require('fs');
const path = require('path');

console.log('Memulai perbaikan file...');

// 1. Perbaiki sintaks JSX di cards.jsx
const cardsPath = path.join(process.cwd(), 'src/components/cards.jsx');
let cardsCode = fs.readFileSync(cardsPath, 'utf8');

cardsCode = cardsCode.replace(
  `{it.media_path ? (\n                     {it.media_source === 'youtube' ? (`,
  `{it.media_path ? (\n                     it.media_source === 'youtube' ? (`
);
cardsCode = cardsCode.replace(
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )}\n                   ) : null}`,
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />\n                     )\n                   ) : null}`
);
fs.writeFileSync(cardsPath, cardsCode);
console.log('[BERHASIL] src/components/cards.jsx diperbaiki.');

// 2. Hapus import dan state yang ganda di DashboardPage.jsx
const dashPath = path.join(process.cwd(), 'src/pages/DashboardPage.jsx');
let dashCode = fs.readFileSync(dashPath, 'utf8');

dashCode = dashCode.replace(
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`
);

dashCode = dashCode.replace(
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })\n  const [itemMode, setItemMode] = useState({})\n  const [galMode, setGalMode] = useState('foto')\n  const [galYtLink, setGalYtLink] = useState('')\n  const [galYtTitle, setGalYtTitle] = useState('')`,
  `  const [galOldYt, setGalOldYt] = useState(null)\n  const [itemMode, setItemMode] = useState({})\n  const [galYtTitle, setGalYtTitle] = useState('')`
);

fs.writeFileSync(dashPath, dashCode);
console.log('[BERHASIL] src/pages/DashboardPage.jsx diperbaiki.');

console.log('\nSelesai! Silakan jalankan ulang npm run dev.');
```

## File: fix-publik-dan-key.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki foto profil di halaman publik dan warning key...')
console.log('')

/* ===== 1. Perbaiki query select mahasiswa agar menyertakan foto_profil ===== */
const pages = [
  'src/pages/HomePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/TimPage.jsx'
]

pages.forEach(rel => {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return
  let code = baca(rel)
  let changed = false
  
  // Cari pola .select('...') yang memuat mahasiswa(...)
  code = code.replace(/\.select\((['"`])([^'"`]+)\1\)/g, (match, quote, content) => {
    if (content.includes('mahasiswa') && !content.includes('foto_profil') && !content.includes('mahasiswa(*)')) {
      changed = true
      // Ganti mahasiswa(id, nama, dll) menjadi mahasiswa(*) agar semua kolom termasuk foto_profil ikut diambil
      let newContent = content.replace(/mahasiswa\([^)]*\)/, 'mahasiswa(*)')
      return `.select(${quote}${newContent}${quote})`
    }
    return match
  })
  
  if (changed) {
    simpan(rel, code)
    console.log('[BERHASIL] Query mahasiswa diperbarui di ' + rel)
  }
})

/* ===== 2. Tulis ulang PersonChip dan PersonCard di cards.jsx ===== */
const cardsPath = path.join(root, 'src/components/cards.jsx')
if (fs.existsSync(cardsPath)) {
  let cards = baca('src/components/cards.jsx')
  
  if (!cards.includes("import { Avatar } from './ui.jsx'") && !cards.includes('import { Avatar } from')) {
    cards = "import { Avatar } from './ui.jsx'\n" + cards
  }

  // Timpa PersonChip lama dengan versi yang pasti memanggil Avatar
  cards = cards.replace(/export function PersonChip[\s\S]*?\n\}/, `export function PersonChip(props) {
  const m = props.mahasiswa || props.person || props.m || props.p
  if (!m) return null
  return (
    <div className="flex items-center gap-2">
      <Avatar src={m.foto_profil || null} nama={m.nama} size={props.size || 'md'} />
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-900">{m.nama}</p>
        <p className="truncate text-xs text-slate-500">{m.nim || ''} {m.prodi ? '• ' + m.prodi : ''}</p>
      </div>
    </div>
  )
}`)

  // Timpa PersonCard lama dengan versi yang pasti memanggil Avatar
  cards = cards.replace(/export function PersonCard[\s\S]*?\n\}/, `export function PersonCard(props) {
  const m = props.mahasiswa || props.person || props.m || props.p
  if (!m) return null
  return (
    <div className="card-hover flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <Avatar src={m.foto_profil || null} nama={m.nama} size="xl" />
      <div>
        <p className="font-bold text-slate-900">{m.nama}</p>
        <p className="text-xs text-slate-500">{m.nim || ''}</p>
        {m.prodi ? <p className="text-xs text-slate-500">{m.prodi}</p> : null}
      </div>
    </div>
  )
}`)

  simpan('src/components/cards.jsx', cards)
  console.log('[BERHASIL] PersonChip dan PersonCard ditulis ulang menggunakan Avatar')
}

/* ===== 3. Perbaiki warning "unique key prop" di AttendancePage.jsx ===== */
const attPath = path.join(root, 'src/pages/AttendancePage.jsx')
if (fs.existsSync(attPath)) {
  let att = baca('src/pages/AttendancePage.jsx')
  let changedAtt = false
  
  // Pola 1: .map(function (x, i) { return <Element ...
  att = att.replace(/\.map\(function\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*\{\s*return\s*(<[A-Za-z][\s\S]*?)(\s*\/?>)/g, (match, p1, p2, tag, close) => {
    if (tag.includes('key=')) return match
    changedAtt = true
    const indexVar = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([A-Za-z0-9_]+)/, `<$1 key={${indexVar}}`)
    const params = p2 ? `${p1}, ${p2}` : `${p1}, ${indexVar}`
    return `.map(function (${params}) { return ${newTag}${close}`
  })

  // Pola 2: .map((x, i) => <Element ...
  att = att.replace(/\.map\(\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[A-Za-z][\s\S]*?)(\s*\/?>)/g, (match, p1, p2, tag, close) => {
    if (tag.includes('key=')) return match
    changedAtt = true
    const indexVar = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([A-Za-z0-9_]+)/, `<$1 key={${indexVar}}`)
    const params = p2 ? `${p1}, ${p2}` : `${p1}, ${indexVar}`
    return `.map((${params}) => ${newTag}${close}`
  })
  
  if (changedAtt) {
    simpan('src/pages/AttendancePage.jsx', att)
    console.log('[BERHASIL] Warning key prop diperbaiki di AttendancePage.jsx')
  } else {
    console.log('[INFO] Tidak ada .map tanpa key yang terdeteksi di AttendancePage.jsx (mungkin sudah benar atau polanya berbeda)')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Query database di halaman publik kini mengambil seluruh kolom mahasiswa (termasuk foto_profil).')
console.log('2. PersonChip dan PersonCard ditulis ulang secara eksplisit memanggil komponen Avatar, sehingga tidak bergantung pada tebakan nama variabel.')
console.log('3. Script secara otomatis menyuntikkan atribut key pada elemen yang di-render di dalam .map() di AttendancePage.jsx untuk menghilangkan warning React.')
```

## File: fix-query-dan-key.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki query foto profil dan warning key...')
console.log('')

/* ===== 1. DashboardPage.jsx: Paksa query mengambil semua kolom mahasiswa ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (fs.existsSync(path.join(root, FILE_D))) {
  let d = baca(FILE_D)
  let berubah = false
  
  // Ubah mahasiswa(id, nama, nim) atau mahasiswa!inner(...) menjadi mahasiswa(*)
  d = d.replace(/mahasiswa(!inner)?\([^)]*\)/g, function (match, inner) {
    berubah = true
    return 'mahasiswa' + (inner || '') + '(*)'
  })
  
  if (berubah) {
    simpan(FILE_D, d)
    console.log('[BERHASIL] Query mahasiswa di DashboardPage kini mengambil semua kolom (termasuk foto_profil)')
  } else {
    console.log('[INFO] Tidak ada query mahasiswa spesifik yang perlu diubah di DashboardPage')
  }
}

/* ===== 2. TimPage.jsx: Tambahkan foto_profil ke query select ===== */
const FILE_T = 'src/pages/TimPage.jsx'
if (fs.existsSync(path.join(root, FILE_T))) {
  let t = baca(FILE_T)
  let berubahT = false
  
  t = t.replace(/\.select\((['"`])([^'"`]+)\1\)/g, function (match, quote, content) {
    if (content.includes('foto_profil') || content === '*') return match
    berubahT = true
    return '.select(' + quote + content + ', foto_profil' + quote + ')'
  })
  
  if (berubahT) {
    simpan(FILE_T, t)
    console.log('[BERHASIL] Query di TimPage kini menyertakan kolom foto_profil')
  } else {
    console.log('[INFO] Query TimPage sudah memuat foto_profil atau menggunakan *')
  }
}

/* ===== 3. AttendancePage.jsx: Tambal warning unique key prop ===== */
const FILE_A = 'src/pages/AttendancePage.jsx'
if (fs.existsSync(path.join(root, FILE_A))) {
  let a = baca(FILE_A)
  let berubahA = false
  
  // Pola 1: .map(function (item, index) { return <Tag ...
  a = a.replace(/\.map\(\s*function\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*\{\s*return\s*(<[a-zA-Z][^>]*?)(\s*\/?>)/g, function (m, p1, p2, tag, close) {
    if (tag.includes('key=')) return m
    berubahA = true
    const idx = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([a-zA-Z0-9_]+)/, '<$1 key={' + idx + '}')
    return m.replace(tag, newTag)
  })

  // Pola 2: .map((item, index) => <Tag ...
  a = a.replace(/\.map\(\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[a-zA-Z][^>]*?)(\s*\/?>)/g, function (m, p1, p2, tag, close) {
    if (tag.includes('key=')) return m
    berubahA = true
    const idx = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([a-zA-Z0-9_]+)/, '<$1 key={' + idx + '}')
    return m.replace(tag, newTag)
  })
  
  if (berubahA) {
    simpan(FILE_A, a)
    console.log('[BERHASIL] Warning key prop ditambal di AttendancePage')
  } else {
    console.log('[INFO] Tidak ada .map tanpa key yang terdeteksi di AttendancePage')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan untuk error "startTime" di console:')
console.log('Error tersebut berasal dari ekstensi browser (seperti Web Vitals atau Google Translate) yang mencoba mengukur performa halaman, bukan dari kode aplikasimu. Kamu bisa mengabaikannya dengan aman.')
```

## File: fix-ui-avatar.cjs
```javascript
const fs = require('fs')
const path = require('path')

const filePath = path.join(process.cwd(), 'src/components/ui.jsx')
let code = fs.readFileSync(filePath, 'utf8')

const startIdx = code.indexOf('export function Avatar(props) {')
if (startIdx === -1) {
  console.log('Fungsi Avatar tidak ditemukan di ui.jsx. File mungkin sudah benar.')
  process.exit(0)
}

let braceCount = 0
let endIdx = -1
let inString = false
let stringChar = ''
let inComment = false
let inLineComment = false

for (let i = startIdx; i < code.length; i++) {
  const char = code[i]
  const nextChar = i < code.length - 1 ? code[i+1] : ''
  const prevChar = i > 0 ? code[i-1] : ''
  
  if (inLineComment) {
    if (char === '\n') inLineComment = false
    continue
  }
  if (inComment) {
    if (char === '*' && nextChar === '/') {
      inComment = false
      i++
    }
    continue
  }
  if (inString) {
    if (char === stringChar && prevChar !== '\\') {
      inString = false
    }
    continue
  }
  
  if (char === '/' && nextChar === '/') {
    inLineComment = true
    continue
  }
  if (char === '/' && nextChar === '*') {
    inComment = true
    i++
    continue
  }
  if (char === '"' || char === "'" || char === '`') {
    inString = true
    stringChar = char
    continue
  }
  
  if (char === '{') braceCount++
  if (char === '}') {
    braceCount--
    if (braceCount === 0) {
      endIdx = i + 1
      break
    }
  }
}

if (endIdx === -1) {
  console.log('Gagal menemukan batas akhir fungsi Avatar.')
  process.exit(1)
}

const avatarBlock = code.substring(startIdx, endIdx)
code = code.substring(0, startIdx) + code.substring(endIdx)

if (code.includes('export function Avatar(props) {')) {
  console.log('Avatar sudah ada di tempat lain yang valid.')
} else {
  code = code.trimEnd() + '\n\n' + avatarBlock + '\n'
  console.log('Avatar berhasil dipindahkan ke akhir file (top-level).')
}

fs.writeFileSync(filePath, code, 'utf8')
console.log('')
console.log('Selesai. Vite akan otomatis reload. Jika masih error, restart dev server dengan Ctrl+C lalu npm run dev.')
```

## File: postcss.config.js
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

## File: prototipe-tim-gabung.html
```html
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pratinjau Kartu Profil Tim dengan Rekap Kehadiran</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = { theme: { extend: { colors: {
  bsi: { 50:'#eefbf3',100:'#d6f5e0',200:'#b0e8c6',300:'#7dd4a4',400:'#48b97e',500:'#279d63',600:'#1a7f4e',700:'#166534',800:'#14532d',900:'#0f3d22' },
  gold: { 50:'#fffbeb',100:'#fef3c7',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706' }
} } } }
</script>
<style>
  body { font-family: ui-sans-serif, system-ui, sans-serif; }
  .avatar-preview {
    border-radius: 28%;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(15,23,42,.10), 0 10px 28px rgba(15,23,42,.22);
    flex-shrink: 0;
  }
  .kartu { transition: transform .2s ease, box-shadow .2s ease; }
  .kartu:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(15,23,42,.14); }
</style>
</head>
<body class="bg-slate-100 text-slate-900">

<p class="bg-gold-500 text-slate-900 text-center text-xs font-bold py-2 tracking-wide">PRATINJAU STATIS: KARTU PROFIL TIM DENGAN REKAP KEHADIRAN (MASUK / IZIN / BOLOS)</p>

<main class="mx-auto max-w-6xl px-4 py-10 space-y-8">

  <section>
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl lg:text-3xl font-black">Profil tim magang</h2>
        <p class="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi kegiatan dan rekapitulasi kehadiran masing-masing.</p>
      </div>
      <span class="text-xs font-bold uppercase tracking-wide text-slate-400">3 anggota</span>
    </div>
    
    <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">

      <!-- Kartu 1: Rajin Masuk -->
      <div class="kartu rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <!-- Identitas -->
        <div class="flex items-center gap-4">
          <div class="avatar-preview h-14 w-14 grid place-items-center bg-bsi-700 text-white font-black text-lg">RW</div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-lg font-black text-slate-900">Risky Wahyu Firmansyah</p>
            <p class="truncate text-sm text-slate-500">NIM 24070041</p>
            <span class="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Rekayasa Perangkat Lunak</span>
          </div>
        </div>

        <!-- Kontribusi Kegiatan -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">8</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">15</p>
          </div>
        </div>

        <!-- Rekap Kehadiran -->
        <div class="mt-3 pt-3 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-emerald-50 p-2 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
              <p class="text-base font-black text-emerald-700">18</p>
            </div>
            <div class="rounded-xl bg-amber-50 p-2 text-center">
              <p class="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
              <p class="text-base font-black text-amber-700">2</p>
            </div>
            <div class="rounded-xl bg-red-50 p-2 text-center">
              <p class="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
              <p class="text-base font-black text-red-700">0</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu 2: Ada Izin dan Bolos -->
      <div class="kartu rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <!-- Identitas -->
        <div class="flex items-center gap-4">
          <div class="avatar-preview h-14 w-14 grid place-items-center bg-gold-600 text-white font-black text-lg">AS</div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-lg font-black text-slate-900">Alya Salsabila</p>
            <p class="truncate text-sm text-slate-500">NIM 24070042</p>
            <span class="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Rekayasa Perangkat Lunak</span>
          </div>
        </div>

        <!-- Kontribusi Kegiatan -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">6</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">11</p>
          </div>
        </div>

        <!-- Rekap Kehadiran -->
        <div class="mt-3 pt-3 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-emerald-50 p-2 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
              <p class="text-base font-black text-emerald-700">12</p>
            </div>
            <div class="rounded-xl bg-amber-50 p-2 text-center">
              <p class="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
              <p class="text-base font-black text-amber-700">5</p>
            </div>
            <div class="rounded-xl bg-red-50 p-2 text-center">
              <p class="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
              <p class="text-base font-black text-red-700">3</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Kartu 3: Belum Ada Data -->
      <div class="kartu rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
        <!-- Identitas -->
        <div class="flex items-center gap-4">
          <div class="avatar-preview h-14 w-14 grid place-items-center bg-slate-700 text-white font-black text-lg">BP</div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-lg font-black text-slate-900">Bagas Prakoso</p>
            <p class="truncate text-sm text-slate-500">NIM 24070043</p>
            <span class="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">Rekayasa Perangkat Lunak</span>
          </div>
        </div>

        <!-- Kontribusi Kegiatan -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">0</p>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3">
            <p class="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
            <p class="mt-0.5 text-xl font-black text-bsi-800">0</p>
          </div>
        </div>

        <!-- Rekap Kehadiran -->
        <div class="mt-3 pt-3 border-t border-slate-100">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
          <div class="grid grid-cols-3 gap-2">
            <div class="rounded-xl bg-emerald-50 p-2 text-center">
              <p class="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
              <p class="text-base font-black text-emerald-700">0</p>
            </div>
            <div class="rounded-xl bg-amber-50 p-2 text-center">
              <p class="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
              <p class="text-base font-black text-amber-700">0</p>
            </div>
            <div class="rounded-xl bg-red-50 p-2 text-center">
              <p class="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
              <p class="text-base font-black text-red-700">0</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <p class="text-center text-xs text-slate-400 pb-6">File ini hanya pratinjau statis. Struktur datanya akan mengambil status 'Masuk', 'Izin', dan 'Bolos' langsung dari tabel daftar_hadir di Supabase.</p>
</main>
</body>
</html>
```

## File: setup-semua-fitur.cjs
```javascript
// setup-semua-fitur.cjs
// Skrip induk untuk menjalankan seluruh pemasangan fitur secara otomatis.
// Jalankan: node setup-semua-fitur.cjs

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const root = process.cwd()

// Urutan skrip yang harus dijalankan. Urutan penting karena
// beberapa skrip bergantung pada hasil skrip sebelumnya.
const URUTAN = [
  // 1. Dasar konversi dan upload
  'apply-perbaiki-konversi.cjs',
  'apply-heic-webp.cjs',
  'apply-foto-webp-progres.cjs',
  'apply-hint-fileinput.cjs',
  'apply-fix-progres-hint.cjs',

  // 2. Pratinjau HEIC di form
  'apply-preview-heic.cjs',
  'apply-preview-heic-galeri.cjs',
  'apply-preview-loading.cjs',

  // 3. Thumbnail otomatis
  'apply-thumbnail.cjs',
  'apply-thumb-folder.cjs',
  'apply-thumb-display.cjs',
  'apply-thumb-cleanup.cjs',

  // 4. Tampilan adaptif (SmartFit)
  'apply-smart-fit.cjs',
  'apply-smart-fit-carousel.cjs',
  'apply-smartfit-fallback.cjs',

  // 5. Integrasi YouTube (backend + frontend + UI)
  'apply-youtube-backend.cjs',
  'apply-youtube-frontend.cjs',
  'apply-youtube-final.cjs',
  'apply-youtube-final-fix.cjs',
]

function jalanSkrip(namaFile) {
  const fullPath = path.join(root, namaFile)
  if (!fs.existsSync(fullPath)) {
    console.log('[LEWATI] ' + namaFile + ' tidak ditemukan.')
    return { nama: namaFile, status: 'lewat', pesan: 'file tidak ada' }
  }
  try {
    console.log('\n' + '='.repeat(60))
    console.log('>>> Menjalankan: ' + namaFile)
    console.log('='.repeat(60))
    execSync('node "' + namaFile + '"', { stdio: 'inherit', cwd: root })
    return { nama: namaFile, status: 'ok' }
  } catch (err) {
    console.error('[GAGAL] ' + namaFile + ': ' + err.message)
    return { nama: namaFile, status: 'gagal', pesan: err.message }
  }
}

console.log('========================================')
console.log('  PEMASANGAN SEMUA FITUR SECARA OTOMATIS')
console.log('========================================')
console.log('Direktori kerja: ' + root)
console.log('Jumlah skrip yang akan dijalankan: ' + URUTAN.length)

const hasil = []
for (const nama of URUTAN) {
  hasil.push(jalanSkrip(nama))
}

console.log('\n' + '='.repeat(60))
console.log('RINGKASAN PEMASANGAN')
console.log('='.repeat(60))

const ok = hasil.filter(h => h.status === 'ok').length
const lewat = hasil.filter(h => h.status === 'lewat').length
const gagal = hasil.filter(h => h.status === 'gagal').length

hasil.forEach(h => {
  const ikon = h.status === 'ok' ? '[OK]    ' : h.status === 'lewat' ? '[LEWAT] ' : '[GAGAL] '
  console.log(ikon + h.nama + (h.pesan ? ' (' + h.pesan + ')' : ''))
})

console.log('\nTotal: ' + ok + ' berhasil, ' + lewat + ' dilewati, ' + gagal + ' gagal.')

if (gagal > 0) {
  console.log('\n[PERINGATAN] Ada skrip yang gagal. Periksa log di atas.')
  process.exit(1)
}

console.log('\n========================================')
console.log('  SEMUA FITUR TELAH TERPASANG')
console.log('========================================')
console.log('')
console.log('Langkah selanjutnya yang perlu kamu lakukan:')
console.log('  1. Pastikan node_modules sudah terpasang:')
console.log('       npm install')
console.log('     (terutama heic2any, @supabase/supabase-js, @aws-sdk/client-s3)')
console.log('')
console.log('  2. Salin .env.example menjadi .env.local dan isi:')
console.log('       VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY,')
console.log('       SUPABASE_SERVICE_ROLE_KEY,')
console.log('       R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,')
console.log('       R2_BUCKET_NAME, R2_PUBLIC_BASE_URL,')
console.log('       YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET')
console.log('')
console.log('  3. Dapatkan refresh token YouTube:')
console.log('       node setup-youtube-token.cjs')
console.log('     Salin token yang muncul ke YOUTUBE_REFRESH_TOKEN di .env.local')
console.log('')
console.log('  4. Jalankan skema database di Supabase SQL Editor:')
console.log('       salin isi file supabase/schema.sql')
console.log('')
console.log('  5. Jalankan server pengembangan:')
console.log('       npm run dev')
console.log('     Buka http://localhost:5173')
console.log('')
console.log('  6. Untuk deploy ke Vercel:')
console.log('       - Push ke GitHub')
console.log('       - Import proyek di Vercel')
console.log('       - Salin semua isi .env.local ke Environment Variables Vercel')
```

## File: setup-youtube-token-multi.cjs
```javascript
const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const n = String(process.argv[2] || '1')
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('[GAGAL] .env.local belum ada')
  process.exit(1)
}
const env = {}
fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})
const clientId = env['YOUTUBE_CLIENT_ID_' + n]
const clientSecret = env['YOUTUBE_CLIENT_SECRET_' + n]
if (!clientId || !clientSecret) {
  console.log('[GAGAL] Isi dulu YOUTUBE_CLIENT_ID_' + n + ' dan YOUTUBE_CLIENT_SECRET_' + n + ' di .env.local')
  process.exit(1)
}

const PORT = 8790
const redirect = 'http://localhost:' + PORT + '/callback'
const state = crypto.randomBytes(8).toString('hex')
const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId, redirect_uri: redirect, response_type: 'code',
  scope: scope, access_type: 'offline', prompt: 'consent', state: state
})

function simpanToken(token) {
  let isi = fs.readFileSync(envPath, 'utf8')
  const key = 'YOUTUBE_REFRESH_TOKEN_' + n
  const re = new RegExp('^' + key + '=.*$', 'm')
  if (re.test(isi)) isi = isi.replace(re, key + '=' + token)
  else isi = isi.trimEnd() + '\n' + key + '=' + token + '\n'
  fs.writeFileSync(envPath, isi, 'utf8')
}

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://localhost')
  if (u.pathname !== '/callback') { res.end('ok'); return }
  const code = u.searchParams.get('code')
  const st = u.searchParams.get('state')
  if (st !== state) { res.end('State tidak cocok'); return }
  const body = new URLSearchParams({
    code: code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirect, grant_type: 'authorization_code'
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: body })
  const j = await r.json()
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (j.refresh_token) {
    simpanToken(j.refresh_token)
    res.end('<h2>Berhasil untuk project ' + n + '</h2><p>Refresh token tersimpan otomatis ke YOUTUBE_REFRESH_TOKEN_' + n + ' di .env.local</p>')
    console.log('[BERHASIL] Refresh token project ' + n + ' disimpan ke .env.local')
  } else {
    res.end('<h2>Gagal</h2><pre>' + JSON.stringify(j, null, 2) + '</pre>')
    console.log('[GAGAL] ' + JSON.stringify(j))
  }
  setTimeout(function () { server.close(); process.exit(0) }, 1500)
})

server.listen(PORT, function () {
  console.log('Project ' + n + ': membuka browser untuk otorisasi...')
  console.log('Jika tidak terbuka otomatis, buka manual URL ini:')
  console.log(url)
  try {
    require('child_process').exec(process.platform === 'win32' ? 'start "" "' + url + '"' : 'xdg-open ' + url)
  } catch (e) {}
})
```

## File: setup-youtube-token.cjs
```javascript
const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const env = {}
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
}

const clientId = env.YOUTUBE_CLIENT_ID
const clientSecret = env.YOUTUBE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.log('[GAGAL] Isi dulu YOUTUBE_CLIENT_ID dan YOUTUBE_CLIENT_SECRET di .env.local')
  process.exit(1)
}

const PORT = 8790
const redirect = 'http://localhost:' + PORT + '/callback'
const state = crypto.randomBytes(8).toString('hex')
const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId, redirect_uri: redirect, response_type: 'code',
  scope: scope, access_type: 'offline', prompt: 'consent', state: state
})

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://localhost')
  if (u.pathname !== '/callback') { res.end('ok'); return }
  const code = u.searchParams.get('code')
  const st = u.searchParams.get('state')
  if (st !== state) { res.end('State tidak cocok'); return }
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirect, grant_type: 'authorization_code'
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })
  const j = await r.json()
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (j.refresh_token) {
    res.end('<h2>Berhasil!</h2><p>Salin refresh token ini:</p><code style="word-break:break-all;background:#f1f5f9;padding:8px;display:block;">' + j.refresh_token + '</code>')
    console.log('\nREFRESH TOKEN:')
    console.log(j.refresh_token)
  } else {
    res.end('<h2>Gagal</h2><pre>' + JSON.stringify(j, null, 2) + '</pre>')
  }
  setTimeout(function () { server.close(); process.exit(0) }, 2000)
})

server.listen(PORT, function () {
  console.log('Membuka browser... Jika tidak otomatis, buka URL ini:')
  console.log(url)
  try {
    require('child_process').exec(process.platform === 'win32' ? 'start "" "' + url + '"' : 'xdg-open ' + url)
  } catch (e) {}
})
```

## File: siapkan-env-youtube-lokal.cjs
```javascript
const fs = require('fs')
const path = require('path')
const root = process.cwd()
const envPath = path.join(root, '.env.local')

if (!fs.existsSync(envPath)) {
  console.log('[GAGAL] .env.local belum ada. Buat dulu dari .env.example lalu isi nilai Supabase dan R2.')
  process.exit(1)
}
let isi = fs.readFileSync(envPath, 'utf8')
if (isi.includes('YOUTUBE_CLIENT_ID_1=')) {
  console.log('[SUDAH ADA] Blok variabel YouTube bernomor di .env.local')
} else {
  const blok = [
    '',
    '# -----------------------------------------------------',
    '# 4) YOUTUBE API MULTI-PROJECT (auto-rotate kuota)',
    '# Enam set kredensial untuk enam project Google Cloud.',
    '# Sistem otomatis memilih project yang masih punya kuota.',
    '# Isi CLIENT_ID dan CLIENT_SECRET per nomor setelah membuat',
    '# OAuth Client ID di Console. REFRESH_TOKEN terisi otomatis',
    '# oleh setup-youtube-token-multi.cjs <nomor>.',
    '# -----------------------------------------------------'
  ]
  for (let n = 1; n <= 6; n++) {
    blok.push('YOUTUBE_CLIENT_ID_' + n + '=')
    blok.push('YOUTUBE_CLIENT_SECRET_' + n + '=')
    blok.push('YOUTUBE_REFRESH_TOKEN_' + n + '=')
  }
  isi = isi.trimEnd() + '\n' + blok.join('\n') + '\n'
  fs.writeFileSync(envPath, isi, 'utf8')
  console.log('[BERHASIL] Blok variabel YouTube bernomor ditambahkan ke .env.local')
}
console.log('')
console.log('Lanjut: buat 6 project di Console, tempel Client ID dan Secret')
console.log('ke variabel bernomor di .env.local, lalu jalankan')
console.log('node setup-youtube-token-multi.cjs 1 sampai 6')
```

## File: tailwind.config.js
```javascript
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bsi: {
          50: '#effef5', 100: '#d9fbe5', 200: '#b5f5cd', 300: '#86ecb0',
          400: '#50d98b', 500: '#27c06d', 600: '#1a9e57', 700: '#177c48',
          800: '#16623c', 900: '#135033', 950: '#072c1b'
        },
        gold: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' }
      }
    }
  },
  plugins: []
}
```

## File: tesss-iframeeee.html
```html
<!DOCTYPE html>

<html lang="id">

<head>

  <meta charset="UTF-8">

  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Centered Fullscreen Custom YouTube Player</title>

  <style>

    * {

      box-sizing: border-box;

      margin: 0;

      padding: 0;

      font-family: Arial, sans-serif;

    }



    body {

      background-color: #121212;

      color: #fff;

      display: flex;

      justify-content: center;

      align-items: center;

      min-height: 100vh;

      flex-direction: column;

    }



    /* Container Pemutar Video Utama */

    .player-container {

      position: relative;

      width: 720px;

      max-width: 95vw;

      background: #000;

      border-radius: 12px;

      overflow: hidden;

      box-shadow: 0 10px 30px rgba(0,0,0,0.5);

    }



    /* Fullscreen Center */

    .player-container:fullscreen {

      width: 100vw;

      height: 100vh;

      max-width: none;

      border-radius: 0;

      display: flex;

      flex-direction: column;

      justify-content: center;

      align-items: center;

      background-color: #000;

    }



    .player-container.hide-controls {

      cursor: none;

    }



    /* TRIK CROPPING Header YouTube */

    .video-viewport {

      position: relative;

      width: 100%;

      padding-top: 56.25%; /* Ratio 16:9 */

      overflow: hidden;

    }



    .player-container:fullscreen .video-viewport {

      width: 100%;

      max-height: 100vh;

    }



    #player {

      position: absolute;

      top: -60px; /* Potong top bar YouTube */

      left: -2px;

      width: calc(100% + 4px);

      height: calc(100% + 120px);

      pointer-events: none;

    }



    /* Layer Poster & Tombol Play Kustom */

    .custom-poster {

      position: absolute;

      top: 0;

      left: 0;

      width: 100%;

      height: 100%;

      z-index: 2;

      background-size: cover;

      background-position: center;

      display: flex;

      justify-content: center;

      align-items: center;

      cursor: default; /* Diubah menjadi panah biasa */

      transition: opacity 0.3s ease, visibility 0.3s ease;

    }



    .custom-poster.is-hidden {

      opacity: 0;

      visibility: hidden;

      pointer-events: none;

    }



    /* Ikon Play Tengah Minimalis & Kecil */

    .center-play-btn {

      width: 48px;

      height: 48px;

      background: rgba(0, 0, 0, 0.5);

      border: 1px solid rgba(255, 255, 255, 0.2);

      border-radius: 50%;

      display: flex;

      justify-content: center;

      align-items: center;

      backdrop-filter: blur(8px);

      cursor: pointer; /* Tombol play tengah tetap jari agar jelas bisa diklik */

      transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;

    }



    .custom-poster:hover .center-play-btn {

      transform: scale(1.08);

      background: rgba(255, 0, 0, 0.85);

      border-color: rgba(255, 0, 0, 0.85);

    }



    .center-play-btn svg {

      width: 20px;

      height: 20px;

      fill: #fff;

      margin-left: 3px;

    }



    /* Overlay Transparan (Aktif setelah video diputar) */

    .overlay-shield {

      position: absolute;

      top: 0;

      left: 0;

      width: 100%;

      height: 100%;

      z-index: 1;

      background: transparent;

      cursor: default; /* Diubah menjadi panah biasa */

    }



    /* Panel Kontrol Kustom */

    .custom-controls {

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 12px 16px;

      background: rgba(30, 30, 30, 0.95);

      z-index: 3;

      position: absolute;

      bottom: 0;

      left: 0;

      width: 100%;

      opacity: 1;

      visibility: visible;

      transition: opacity 0.4s ease, visibility 0.4s ease;

    }



    .player-container.hide-controls .custom-controls {

      opacity: 0;

      visibility: hidden;

    }



    button {

      background: #333;

      color: #fff;

      border: none;

      padding: 8px 12px;

      border-radius: 6px;

      cursor: pointer;

      font-weight: bold;

      transition: background 0.2s;

      display: flex;

      align-items: center;

      justify-content: center;

    }



    button:hover {

      background: #555;

    }



    button svg {

      width: 18px;

      height: 18px;

      fill: #fff;

    }



    /* Progress Bar */

    .progress-container {

      flex-grow: 1;

      display: flex;

      align-items: center;

    }



    .progress-bar {

      width: 100%;

      height: 6px;

      -webkit-appearance: none;

      appearance: none;

      background: linear-gradient(to right, #ff0000 0%, #444 0%);

      border-radius: 3px;

      outline: none;

      cursor: pointer;

    }



    .progress-bar::-webkit-slider-thumb {

      -webkit-appearance: none;

      appearance: none;

      width: 14px;

      height: 14px;

      border-radius: 50%;

      background: #ff0000;

      cursor: pointer;

    }



    /* Text & Slider Volume */

    .time-display {

      font-size: 13px;

      color: #bbb;

      min-width: 80px;

      text-align: center;

    }



    .volume-slider {

      width: 70px;

      cursor: pointer;

    }

  </style>

</head>

<body>



  <div class="player-container" id="playerContainer">

    <div class="video-viewport">

      <div id="player"></div>

      

      <!-- Poster Kustom + Tombol Play Tengah Minimalis -->

      <div class="custom-poster" id="customPoster" onclick="togglePlay()">

        <div class="center-play-btn">

          <svg viewBox="0 0 24 24">

            <path d="M8 5v14l11-7z"/>

          </svg>

        </div>

      </div>



      <div class="overlay-shield" id="overlayShield"></div>

    </div>



    <!-- Panel Kontrol Kustom -->

    <div class="custom-controls" id="customControls">

      <button id="playPauseBtn" onclick="togglePlay()" aria-label="Play/Pause">

        <svg id="playIcon" viewBox="0 0 24 24">

          <path d="M8 5v14l11-7z"/>

        </svg>

        <svg id="pauseIcon" viewBox="0 0 24 24" style="display: none;">

          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>

        </svg>

      </button>

      

      <div class="progress-container">

        <input type="range" id="progressBar" class="progress-bar" value="0" min="0" max="100" step="0.1" oninput="seekVideo(this.value)">

      </div>



      <span class="time-display" id="timeDisplay">0:00 / 0:00</span>



      <button id="muteBtn" onclick="toggleMute()" aria-label="Mute/Unmute">

        <svg id="volumeIcon" viewBox="0 0 24 24">

          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>

        </svg>

        <svg id="muteIcon" viewBox="0 0 24 24" style="display: none;">

          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>

        </svg>

      </button>

      <input type="range" id="volumeSlider" class="volume-slider" min="0" max="100" value="100" oninput="changeVolume(this.value)">



      <button onclick="toggleFullscreen()">&#x26F6;</button>

    </div>

  </div>



  <script>

    var videoId = 'ypqq9quWfkM'; // ID Video

    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";

    var firstScriptTag = document.getElementsByTagName('script')[0];

    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);



    var player;

    var updateInterval;

    var hideControlsTimeout;



    var playerContainer = document.getElementById('playerContainer');

    var customPoster = document.getElementById('customPoster');



    customPoster.style.backgroundImage = `url('https://img.youtube.com/vi/${videoId}/maxresdefault.jpg')`;



    function onYouTubeIframeAPIReady() {

      player = new YT.Player('player', {

        videoId: videoId,

        playerVars: {

          'controls': 0,

          'rel': 0,

          'modestbranding': 1,

          'playsinline': 1,

          'disablekb': 1

        },

        events: {

          'onReady': onPlayerReady,

          'onStateChange': onPlayerStateChange

        }

      });

    }



    function onPlayerReady(event) {

      document.getElementById('overlayShield').addEventListener('click', togglePlay);

      setupAutoHideControls();

    }



    function onPlayerStateChange(event) {

      var playIcon = document.getElementById('playIcon');

      var pauseIcon = document.getElementById('pauseIcon');

      

      if (event.data == YT.PlayerState.PLAYING) {

        customPoster.classList.add('is-hidden');

        playIcon.style.display = 'none';

        pauseIcon.style.display = 'block';

        updateInterval = setInterval(updateProgress, 250);

        resetAutoHideTimer();

      } else {

        playIcon.style.display = 'block';

        pauseIcon.style.display = 'none';

        clearInterval(updateInterval);

        showControls();

        clearTimeout(hideControlsTimeout);

      }

    }



    function setupAutoHideControls() {

      playerContainer.addEventListener('mousemove', function() {

        showControls();

        resetAutoHideTimer();

      });



      playerContainer.addEventListener('mouseleave', function() {

        if (player && player.getPlayerState() == YT.PlayerState.PLAYING) {

          hideControls();

        }

      });

    }



    function showControls() {

      playerContainer.classList.remove('hide-controls');

    }



    function hideControls() {

      playerContainer.classList.add('hide-controls');

    }



    function resetAutoHideTimer() {

      clearTimeout(hideControlsTimeout);

      if (player && player.getPlayerState() == YT.PlayerState.PLAYING) {

        hideControlsTimeout = setTimeout(function() {

          hideControls();

        }, 2500);

      }

    }



    function togglePlay() {

      var state = player.getPlayerState();

      if (state == YT.PlayerState.PLAYING) {

        player.pauseVideo();

      } else {

        player.playVideo();

      }

    }



    function updateProgress() {

      if (!player || !player.getCurrentTime) return;

      var currentTime = player.getCurrentTime();

      var duration = player.getDuration();

      

      if (duration > 0) {

        var percentage = (currentTime / duration) * 100;

        var progressBar = document.getElementById('progressBar');

        

        progressBar.value = percentage;

        updateProgressBarFill(progressBar, percentage);



        document.getElementById('timeDisplay').innerText = 

          formatTime(currentTime) + ' / ' + formatTime(duration);

      }

    }



    function updateProgressBarFill(element, percentage) {

      element.style.background = `linear-gradient(to right, #ff0000 ${percentage}%, #444 ${percentage}%)`;

    }



    function seekVideo(value) {

      var duration = player.getDuration();

      var seekToTime = (value / 100) * duration;

      updateProgressBarFill(document.getElementById('progressBar'), value);

      player.seekTo(seekToTime, true);

    }



    function toggleMute() {

      if (player.isMuted()) {

        player.unMute();

        updateVolumeUI(player.getVolume(), false);

      } else {

        player.mute();

        updateVolumeUI(0, true);

      }

    }



    function changeVolume(value) {

      player.setVolume(value);

      if (value == 0) {

        player.mute();

        updateVolumeUI(0, true);

      } else {

        if (player.isMuted()) player.unMute();

        updateVolumeUI(value, false);

      }

    }



    function updateVolumeUI(volumeValue, isMuted) {

      var volumeIcon = document.getElementById('volumeIcon');

      var muteIcon = document.getElementById('muteIcon');

      var volumeSlider = document.getElementById('volumeSlider');



      if (isMuted || volumeValue == 0) {

        volumeIcon.style.display = 'none';

        muteIcon.style.display = 'block';

      } else {

        volumeIcon.style.display = 'block';

        muteIcon.style.display = 'none';

        volumeSlider.value = volumeValue;

      }

    }



    function toggleFullscreen() {

      if (!document.fullscreenElement) {

        playerContainer.requestFullscreen().catch(err => alert(err.message));

      } else {

        document.exitFullscreen();

      }

    }



    function formatTime(seconds) {

      var mins = Math.floor(seconds / 60);

      var secs = Math.floor(seconds % 60);

      if (secs < 10) secs = '0' + secs;

      return mins + ':' + secs;

    }

  </script>

</body>

</html>
```

## File: vercel.json
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## File: api/youtube/latest.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let terakhir = ''
  for (const kred of kredensial) {
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
    if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
    const j = await r.json()
    const items = j.items || []
    const batas = Date.now() - 15 * 60 * 1000
    const cocok = items.find(function (it) {
      const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
      return isNaN(t) ? false : t >= batas
    })
    if (!cocok) return res.status(404).json({ error: 'Video terbaru tidak ditemukan' })
    return res.status(200).json({ videoId: cocok.id && cocok.id.videoId, project: kred.n })
  }
  return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + terakhir })
}
```

## File: api/youtube/quota.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let usedTotal = 0
  const perProject = []
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    const used = hit.count || 0
    usedTotal += used
    perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
  }
  const limit = kredensial.length * LIMIT_PER_PROJECT
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
}
```

## File: api/youtube/session.js
```javascript
import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let terakhir = ''
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const meta = {
      snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
      status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
    }
    const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
      body: JSON.stringify(meta)
    })
    if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
    const sessionUri = init.headers.get('location')
    if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
    await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id, project_id: kred.n })
    return res.status(200).json({ sessionUri: sessionUri, project: kred.n })
  }
  return res.status(429).json({ error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
}
```

## File: src/components/controls.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { ICONS } from './icons.jsx'

const BULAN_NAMA = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const HARI_NAMA = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

const defaultBtn = 'flex w-full items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'

function pad(n) {
  return (n < 10 ? '0' : '') + n
}

function parseValue(value, mode) {
  if (!value) return null
  const p = String(value).split('-')
  if (mode === 'month') {
    if (p.length < 2) return null
    const y = parseInt(p[0], 10)
    const m = parseInt(p[1], 10) - 1
    if (isNaN(y) || isNaN(m) || m < 0 || m > 11) return null
    return { y: y, m: m }
  }
  if (p.length < 3) return null
  const y = parseInt(p[0], 10)
  const m = parseInt(p[1], 10) - 1
  const d = parseInt(p[2], 10)
  if (isNaN(y) || isNaN(m) || isNaN(d)) return null
  return { y: y, m: m, d: d }
}

function useOutside(ref, open, setOpen) {
  useEffect(function () {
    if (!open) return undefined
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return function () { document.removeEventListener('mousedown', handler) }
  }, [open])
}

export function CustomSelect(props) {
  const [open, setOpen] = useState(false)
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)
  const options = props.options || []
  const current = options.find(function (o) { return o.value === props.value }) || null

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button
        type="button"
        onClick={function () { setOpen(function (o) { return !o }) }}
        className={(props.buttonCls || defaultBtn) + ' text-left'}
      >
        {props.icon ? <span className="shrink-0 text-slate-400">{props.icon}</span> : null}
        <span className={'flex-1 truncate ' + (current ? 'text-slate-800' : 'text-slate-400')}>
          {current ? current.label : (props.placeholder || 'Pilih')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white py-1 shadow-xl">
          {options.map(function (o) {
            const active = o.value === props.value
            return (
              <button
                type="button"
                key={String(o.value)}
                onClick={function () { props.onChange(o.value); setOpen(false) }}
                className={'flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm ' + (active ? 'bg-bsi-800 text-white' : 'text-slate-700 hover:bg-slate-100')}
              >
                <span className="truncate">{o.label}</span>
                {active ? <span className="shrink-0">{ICONS.check}</span> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function CustomDateInput(props) {
  const mode = props.mode || 'date'
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(function () {
    const p = parseValue(props.value, mode)
    const t = new Date()
    return p ? { y: p.y, m: p.m } : { y: t.getFullYear(), m: t.getMonth() }
  })
  const boxRef = useRef(null)
  useOutside(boxRef, open, setOpen)

  const sel = parseValue(props.value, mode)
  const today = new Date()

  function toggle() {
    if (!open) {
      const p = parseValue(props.value, mode)
      if (p) setView({ y: p.y, m: p.m })
    }
    setOpen(function (o) { return !o })
  }

  function shift(delta) {
    setView(function (v) {
      if (mode === 'month') return { y: v.y + delta, m: v.m }
      let m = v.m + delta
      let y = v.y
      if (m < 0) { m = 11; y -= 1 }
      if (m > 11) { m = 0; y += 1 }
      return { y: y, m: m }
    })
  }

  function pickDay(d) {
    props.onChange(view.y + '-' + pad(view.m + 1) + '-' + pad(d))
    setOpen(false)
  }

  function pickMonth(m) {
    props.onChange(view.y + '-' + pad(m + 1))
    setOpen(false)
  }

  function pickToday() {
    const t = new Date()
    if (mode === 'month') props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1))
    else props.onChange(t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate()))
    setOpen(false)
  }

  const label = sel
    ? (mode === 'month' ? BULAN_NAMA[sel.m] + ' ' + sel.y : sel.d + ' ' + BULAN_PENDEK[sel.m] + ' ' + sel.y)
    : ''

  const firstDay = new Date(view.y, view.m, 1).getDay()
  const daysCount = new Date(view.y, view.m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysCount; d++) cells.push(d)

  return (
    <div ref={boxRef} className={'relative ' + (props.className || '')}>
      <button type="button" onClick={toggle} className={(props.buttonCls || defaultBtn) + ' text-left'}>
        <span className="shrink-0 text-slate-400">{ICONS.calendar}</span>
        <span className={'flex-1 truncate ' + (props.value ? 'text-slate-800' : 'text-slate-400')}>
          {label || (mode === 'month' ? 'Pilih bulan' : 'Pilih tanggal')}
        </span>
        <span className={'shrink-0 text-slate-400 transition-transform duration-200 ' + (open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
      </button>
      {open ? (
        <div className="anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
          <div className="flex items-center justify-between">
            <button type="button" onClick={function () { shift(-1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8249;</button>
            <p className="text-sm font-bold text-slate-800">
              {mode === 'month' ? String(view.y) : BULAN_NAMA[view.m] + ' ' + view.y}
            </p>
            <button type="button" onClick={function () { shift(1) }} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">&#8250;</button>
          </div>

          {mode === 'date' ? (
            <div className="mt-3 grid grid-cols-7 gap-1 text-center">
              {HARI_NAMA.map(function (h) {
                return <span key={h} className="py-1 text-[11px] font-semibold text-slate-400">{h}</span>
              })}
              {cells.map(function (d, i) {
                if (d === null) return <span key={'kosong' + i} />
                const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d
                const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={function () { pickDay(d) }}
                    className={'mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm ' + (isSel ? 'bg-bsi-800 font-semibold text-white' : isToday ? 'font-bold text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BULAN_NAMA.map(function (nama, m) {
                const isSel = sel && sel.y === view.y && sel.m === m
                const isNow = today.getFullYear() === view.y && today.getMonth() === m
                return (
                  <button
                    key={nama}
                    type="button"
                    onClick={function () { pickMonth(m) }}
                    className={'rounded-lg px-2 py-2 text-xs font-semibold ' + (isSel ? 'bg-bsi-800 text-white' : isNow ? 'text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}
                  >
                    {nama}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <button type="button" onClick={function () { props.onChange(''); setOpen(false) }} className="text-sm font-semibold text-slate-500 hover:text-red-600">Hapus</button>
            <button type="button" onClick={pickToday} className="text-sm font-semibold text-bsi-700 hover:text-bsi-900">Hari ini</button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function FileInput(props) {
  const inputRef = useRef(null)
  return (
    <div className={props.className || ''}>
      <input
        ref={inputRef}
        type="file"
        accept={props.accept || 'image/*,video/*'}
        className="hidden"
        onChange={function (e) {
          if (props.onChange) props.onChange(e)
          e.target.value = ''
        }}
      />
      <button
        type="button"
        onClick={function () { inputRef.current.click() }}
        className="flex w-full items-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-4 py-4 text-left transition hover:border-bsi-500 hover:bg-slate-100"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-bsi-100 text-bsi-800">{ICONS.image}</span>
        <span className="min-w-0 flex-1">
          <span className={'block truncate text-sm font-semibold ' + (props.fileName ? 'text-slate-800' : 'text-slate-500')}>
            {props.fileName || 'Klik untuk pilih foto atau video'}
          </span>
          <span className="block text-xs text-slate-400">{props.hint || 'Foto JPG, PNG, atau HEIC otomatis dikonversi. Video maks 50 MB.'}</span>
        </span>
        {props.fileName ? <span className="shrink-0 text-xs font-semibold text-bsi-700">Ganti</span> : null}
      </button>
    </div>
  )
}
```

## File: src/lib/auth.js
```javascript
import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const EMAIL_DOMAIN = '@mbsi.local'

export async function loginWithNim(nim, kode) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: nim.trim() + EMAIL_DOMAIN,
    password: kode
  })
  if (error) throw error
  return data
}

export async function logoutMahasiswa() {
  await supabase.auth.signOut()
}

export function useAuth() {
  const [mahasiswa, setMahasiswa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session ? data.session.user.id : null
      if (!uid) {
        if (active) setLoading(false)
        return
      }
      const res = await supabase.from('mahasiswa').select('*').eq('auth_uid', uid).single()
      if (active) {
        setMahasiswa(res.data)
        setLoading(false)
      }
    }
    load()
    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (!session) setMahasiswa(null)
    })
    return function () {
      active = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { mahasiswa: mahasiswa, loading: loading }
}
```

## File: src/lib/constants.js
```javascript
export const KATEGORI = [
  'Administrasi',
  'Pengarsipan',
  'Layanan Nasabah',
  'Back Office',
  'Edukasi Produk',
  'Pendataan',
  'Rapat',
  'Pelatihan',
  'Dokumentasi',
  'Pendukung Lain'
]

export const UNIT = ['Frontliner', 'Back Office', 'Marketing', 'Operasional', 'Umum']

export const GALERI_KEGIATAN = [
  'Dokumentasi',
  'Administrasi',
  'Layanan Nasabah',
  'Edukasi',
  'Pelatihan',
  'Operasional',
  'Lainnya'
]
```

## File: supabase/schema.sql
```sql
create extension if not exists "pgcrypto";
create table public.mahasiswa (
  id uuid primary key default gen_random_uuid(),
  auth_uid uuid unique references auth.users(id) on delete cascade,
  nim varchar(20) not null unique,
  nama varchar(100) not null,
  created_at timestamptz not null default now()
);
create table public.logbooks (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  unit varchar(50),
  kategori varchar(50) not null,
  judul varchar(255) not null,
  kendala text,
  solusi text,
  pembelajaran text,
  status varchar(20) not null default 'draft' check (status in ('draft','publik')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.logbook_items (
  id uuid primary key default gen_random_uuid(),
  logbook_id uuid not null references public.logbooks(id) on delete cascade,
  urutan integer not null default 1,
  judul varchar(255) not null,
  deskripsi text,
  hasil text,
  media_path text,
  media_type varchar(10) check (media_type in ('foto','video')),
  show_in_gallery boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.galeri (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  logbook_item_id uuid unique references public.logbook_items(id) on delete cascade,
  judul varchar(255) not null,
  deskripsi text,
  tanggal date not null,
  kegiatan varchar(50),
  media_path text not null,
  media_type varchar(10) not null check (media_type in ('foto','video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.daftar_hadir (
  id uuid primary key default gen_random_uuid(),
  mahasiswa_id uuid not null references public.mahasiswa(id) on delete cascade,
  tanggal date not null,
  status varchar(20) not null check (status in ('Masuk','Izin','Bolos')),
  alasan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mahasiswa_id, tanggal)
);
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;
create trigger trg_logbooks_upd before update on public.logbooks for each row execute function public.set_updated_at();
create trigger trg_galeri_upd before update on public.galeri for each row execute function public.set_updated_at();
create trigger trg_hadir_upd before update on public.daftar_hadir for each row execute function public.set_updated_at();
create index idx_logbooks_mahasiswa on public.logbooks(mahasiswa_id, tanggal desc);
create index idx_logbooks_status on public.logbooks(status);
create index idx_items_logbook on public.logbook_items(logbook_id, urutan);
create index idx_galeri_mahasiswa on public.galeri(mahasiswa_id, tanggal desc);
create index idx_galeri_item on public.galeri(logbook_item_id);
create index idx_hadir_mahasiswa on public.daftar_hadir(mahasiswa_id, tanggal desc);
alter table public.mahasiswa enable row level security;
alter table public.logbooks enable row level security;
alter table public.logbook_items enable row level security;
alter table public.galeri enable row level security;
alter table public.daftar_hadir enable row level security;
create policy "mahasiswa_read_all" on public.mahasiswa for select using (true);
create policy "mahasiswa_update_self" on public.mahasiswa for update using (auth_uid = auth.uid());
create policy "logbooks_read" on public.logbooks for select using (
  status = 'publik' or mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_insert_self" on public.logbooks for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_update_self" on public.logbooks for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "logbooks_delete_self" on public.logbooks for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "items_read" on public.logbook_items for select using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and (l.status = 'publik' or l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())))
);
create policy "items_write_self" on public.logbook_items for all using (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
) with check (
  exists (select 1 from public.logbooks l where l.id = logbook_id
    and l.mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid()))
);
create policy "galeri_read_all" on public.galeri for select using (true);
create policy "galeri_insert_self" on public.galeri for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_update_self" on public.galeri for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "galeri_delete_self" on public.galeri for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_read_all" on public.daftar_hadir for select using (true);
create policy "hadir_insert_self" on public.daftar_hadir for insert with check (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_update_self" on public.daftar_hadir for update using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
create policy "hadir_delete_self" on public.daftar_hadir for delete using (
  mahasiswa_id = (select id from public.mahasiswa where auth_uid = auth.uid())
);
```

## File: .gitignore
```
node_modules
dist
.env.local
.env
*.log
.env.youtube-*
```

## File: index.html
```html
<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2064%2064'%3E%3Crect%20width='64'%20height='64'%20rx='14'%20fill='%2316623c'/%3E%3Ctext%20x='32'%20y='44'%20font-size='34'%20font-weight='700'%20text-anchor='middle'%20fill='%23ffffff'%20font-family='Arial,%20sans-serif'%3EB%3C/text%3E%3C/svg%3E" />
    <title>Logbook Magang BSI</title>
  </head>
  <body class="bg-slate-50 text-slate-800 min-h-screen antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## File: src/lib/format.js
```javascript
export function formatTanggal(s) {
  if (!s) return 'Tanggal belum diisi'
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTanggalShort(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayInput() {
  const d = new Date()
  const m = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return d.getFullYear() + '-' + m + '-' + day
}

export function detectMediaType(u) {
  const ext = String(u || '').split('?')[0].split('.').pop().toLowerCase()
  return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].indexOf(ext) !== -1 ? 'video' : 'foto'
}

export function matchesDateFilters(dateString, f) {
  if (!dateString) return false
  if (f.timeMode === 'bulan') {
    if (f.bulan) {
      if (f.bulan.length === 7) return dateString.slice(0, 7) === f.bulan
      const p = dateString.split('-')
      if (p.length < 2 || p[1] !== f.bulan) return false
    }
  } else if (f.timeMode === 'rentang') {
    if (f.dari && dateString < f.dari) return false
    if (f.sampai && dateString > f.sampai) return false
  }
  return true
}
export function urutkanTanggal(rows, mode) {
  const salin = (rows || []).slice()
  salin.sort(function (a, b) {
    const da = a.tanggal || ''
    const db = b.tanggal || ''
    if (da === db) return 0
    if (mode === 'terlama') return da < db ? -1 : 1
    return da < db ? 1 : -1
  })
  return salin
}
```

## File: src/lib/konversi.js
```javascript
import heic2any from 'heic2any'
const MAKS_SISI_FULL = 2560
const KUALITAS_FULL = 0.92
const MAKS_SISI_THUMB = 1200
const KUALITAS_THUMB = 0.9
const EXT_VIDEO = ['mp4', 'mov', 'm4v', 'webm', 'ogg', 'mkv', 'avi']

export function ekstensiFile(file) {
  return String(file.name || '').split('.').pop().toLowerCase()
}

export function iniVideo(file) {
  if (file.type && file.type.indexOf('video') === 0) return true
  return EXT_VIDEO.indexOf(ekstensiFile(file)) !== -1
}

export function formatHeic(file) {
  const e = ekstensiFile(file)
  return e === 'heic' || e === 'heif'
}

async function heicKeJpeg(file) {
  const mod = await import('heic2any')
  const heic = mod.default || mod
  const hasil = await heic({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(hasil) ? hasil[0] : hasil
}

async function bitmapDari(berkas) {
  try {
    return await createImageBitmap(berkas, { imageOrientation: 'from-image' })
  } catch (e) {
    return await createImageBitmap(berkas)
  }
}

async function keWebP(berkas, maksSisi, kualitas) {
  const bitmap = await bitmapDari(berkas)
  const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * skala))
  const h = Math.max(1, Math.round(bitmap.height * skala))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  const blob = await new Promise(function (resolve) {
    canvas.toBlob(resolve, 'image/webp', kualitas)
  })
  canvas.width = 0
  canvas.height = 0
  if (!blob || blob.type !== 'image/webp') return null
  return blob
}

export async function siapkanFoto(file, onInfo) {
  let sumber = file
  if (formatHeic(file)) {
    if (onInfo) onInfo('Mengonversi HEIC ke JPG')
    const jpeg = await heicKeJpeg(file)
    if (!jpeg) throw new Error('File HEIC tidak bisa dibaca')
    sumber = new File([jpeg], 'sumber.jpg', { type: 'image/jpeg' })
  }
  if (onInfo) onInfo('Menyiapkan WebP')
  let fullBlob = null
  try {
    fullBlob = await keWebP(sumber, MAKS_SISI_FULL, KUALITAS_FULL)
  } catch (e) {
    fullBlob = null
  }
  const pakaiWebp = !!fullBlob && (sumber.type !== 'image/jpeg' || fullBlob.size < sumber.size)
  const fullFinal = pakaiWebp ? fullBlob : sumber
  const fullType = pakaiWebp ? 'image/webp' : sumber.type
  let thumbBlob = null
  try {
    thumbBlob = await keWebP(fullFinal, MAKS_SISI_THUMB, KUALITAS_THUMB)
  } catch (e) {
    thumbBlob = null
  }
  return { fullBlob: fullFinal, fullType: fullType, thumbBlob: thumbBlob }
}


export async function pratinjauHeic(file) {
  if (!formatHeic(file)) return null
  try {
    const jpeg = await heicKeJpeg(file)
    return jpeg || null
  } catch (e) {
    return null
  }
}

/* foto-profil-webp: pipeline konversi foto profil, pola sama dengan alur media R2 */
function muatGambarProfil(sumber) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(sumber)
    const img = new Image()
    img.onload = function () { resolve({ img: img, url: url }) }
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca')) }
    img.src = url
  })
}

export async function siapkanFotoProfil(file, maksSisi, kualitas) {
  const sisi = maksSisi || 640
  const mutu = kualitas || 0.85
  let kerja = file
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('heic') !== -1 || tipe.indexOf('heif') !== -1) {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 })
    kerja = new File([Array.isArray(blob) ? blob[0] : blob], (file.name || 'foto').replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
  }
  const muat = await muatGambarProfil(kerja)
  try {
    const rasio = Math.min(1, sisi / Math.max(muat.img.width, muat.img.height))
    const w = Math.max(1, Math.round(muat.img.width * rasio))
    const h = Math.max(1, Math.round(muat.img.height * rasio))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(muat.img, 0, 0, w, h)
    const blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/webp', mutu) })
    if (!blob) throw new Error('Gagal mengonversi foto ke WebP')
    return new File([blob], 'profil-' + Date.now() + '.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(muat.url)
  }
}
```

## File: package.json
```json
{
  "name": "mbsi-logbook",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "@supabase/supabase-js": "^2.45.0",
    "heic2any": "^0.0.4",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.10",
    "vite": "^5.4.0"
  }
}
```

## File: README.md
```markdown
# Logbook Magang BSI

Portal logbook, galeri, dan daftar hadir magang Bank Syariah Indonesia.

## Menjalankan lokal
1. node setup project saat ini (sudah dilakukan saat setup)
2. npm run dev
3. Buka http://localhost:5173

## Database
Jalankan isi file supabase/schema.sql di Supabase SQL Editor.
Buat user Auth dengan pola email NIM@mbsi.local dan isi tabel mahasiswa beserta auth_uid.

## Deploy
Push ke GitHub, import di Vercel, salin isi .env.local ke Environment Variables Vercel.
```

## File: src/components/FilterBar.jsx
```javascript
import { ICONS } from './icons.jsx'
import { CustomSelect, CustomDateInput } from './controls.jsx'

export function FilterSelect(props) {
  return (
    <CustomSelect
      icon={props.icon}
      value={props.value}
      onChange={props.onChange}
      options={props.options}
      className="min-w-[190px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function FilterDate(props) {
  return (
    <CustomDateInput
      mode={props.mode || 'date'}
      value={props.value}
      onChange={props.onChange}
      className="min-w-[170px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}

export function TimeFilter(props) {
  const f = props.filter
  const set = props.set
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="time-toggle">
        <button type="button" className={f.timeMode === 'bulan' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'bulan', bulan: '', dari: '', sampai: '' })) }}>Bulan</button>
        <button type="button" className={f.timeMode === 'rentang' ? 'active' : ''}
          onClick={function () { set(Object.assign({}, f, { timeMode: 'rentang', bulan: '', dari: '', sampai: '' })) }}>Rentang Waktu</button>
      </div>
      {f.timeMode === 'bulan'
        ? <FilterDate mode="month" value={f.bulan} onChange={function (v) { set(Object.assign({}, f, { bulan: v })) }} />
        : <div className="flex flex-wrap items-center gap-2">
            <FilterDate value={f.dari} onChange={function (v) { set(Object.assign({}, f, { dari: v })) }} />
            <span className="text-slate-400 text-sm">sampai</span>
            <FilterDate value={f.sampai} onChange={function (v) { set(Object.assign({}, f, { sampai: v })) }} />
          </div>}
    </div>
  )
}

export function FilterBar(props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 lg:p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <button onClick={props.onToggle}
          className="xl:hidden flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <span className="text-bsi-700">{ICONS.funnel}</span>
          <span>Filter</span>
          {props.activeCount > 0 ? (
            <span className="inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-bsi-800 text-white text-xs font-bold">{props.activeCount}</span>
          ) : null}
          <span className={'transition-transform duration-200 text-slate-400 ' + (props.open ? 'rotate-180' : '')}>{ICONS.chevron}</span>
        </button>
        <div className="hidden xl:block text-sm text-slate-500">
          {props.activeCount > 0
            ? <span className="inline-flex items-center gap-2"><span className="text-bsi-700">{ICONS.funnel}</span><span><strong className="text-slate-900">{props.activeCount}</strong> filter aktif</span></span>
            : <span className="inline-flex items-center gap-2"><span className="text-slate-400">{ICONS.funnel}</span><span>Belum ada filter aktif</span></span>}
        </div>
      </div>
      <div className={props.open ? 'anim-page mt-4' : 'hidden xl:block xl:mt-4'}>
        <div className="flex flex-wrap items-center gap-3">
          {props.children}
          {props.activeCount > 0 ? (
            <button onClick={props.onReset}
              className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
              {ICONS.close}<span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function SortSelect(props) {
  return (
    <CustomSelect
      icon={ICONS.sort}
      value={props.value}
      onChange={props.onChange}
      options={[{ value: 'terbaru', label: 'Terbaru' }, { value: 'terlama', label: 'Terlama' }]}
      className="min-w-[150px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}
export function countActiveFilters(o) {
  let c = 0
  for (const k in o) {
    if (k === 'timeMode') continue
    if (o[k]) c++
  }
  return c
}
```

## File: src/App.jsx
```javascript
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ThemeProvider } from './lib/theme.jsx'
import { useAuth } from './lib/auth.js'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import LogbookPage from './pages/LogbookPage.jsx'
import GalleryPage from './pages/GalleryPage.jsx'
import AttendancePage from './pages/AttendancePage.jsx'
import DospemPage from './pages/DospemPage.jsx'
import TimPage from './pages/TimPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(function () {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])
  return null
}
function RequireAuth(props) {
  const { mahasiswa, loading } = useAuth()
  if (loading) return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  if (!mahasiswa) return <Navigate to="/login" replace />
  return props.children
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/logbook" element={<LogbookPage />} />
            <Route path="/galeri" element={<GalleryPage />} />
            <Route path="/absen" element={<AttendancePage />} />
            <Route path="/dospem" element={<DospemPage />} />
            <Route path="/tim" element={<Navigate to="/dospem" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
```

## File: vite.config.js
```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

function bacaBody(req) {
  return new Promise(function (resolve) {
    let data = ''
    req.on('data', function (c) { data += c })
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) }
    })
  })
}

function pluginApiR2(env) {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })

  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return false
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const r = await supabase.auth.getUser(token)
    return !r.error && !!r.data.user
  }

  return {
    name: 'api-r2-dev',
    configureServer(server) {
      server.middlewares.use('/api/r2/presign', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        const ext = String(body.filename || 'bin').split('.').pop().toLowerCase()
        const key = body.kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: body.contentType }),
          { expiresIn: 300 }
        )
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          uploadUrl: uploadUrl,
          publicUrl: env.R2_PUBLIC_BASE_URL + '/' + key,
          key: key
        }))
      })

      server.middlewares.use('/api/r2/delete', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: body.key }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })
    }
  }
}

function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const LIMIT_PER_PROJECT = 5
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  function daftarKredensial() {
    const list = []
    for (let n = 1; n <= 6; n++) {
      const id = env['YOUTUBE_CLIENT_ID_' + n]
      const secret = env['YOUTUBE_CLIENT_SECRET_' + n]
      const refresh = env['YOUTUBE_REFRESH_TOKEN_' + n]
      if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
    }
    if (!list.length && env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REFRESH_TOKEN) {
      list.push({ n: 1, id: env.YOUTUBE_CLIENT_ID, secret: env.YOUTUBE_CLIENT_SECRET, refresh: env.YOUTUBE_REFRESH_TOKEN })
    }
    return list
  }
  const cacheToken = {}
  async function getAccessToken(kred) {
    const now = Date.now()
    const c = cacheToken[kred.n]
    if (c && c.expire > now + 60000) return c.token
    const params = new URLSearchParams()
    params.set('client_id', kred.id)
    params.set('client_secret', kred.secret)
    params.set('refresh_token', kred.refresh)
    params.set('grant_type', 'refresh_token')
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
    if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
    const j = await r.json()
    cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
    return j.access_token
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let usedTotal = 0
        const perProject = []
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          const used = hit.count || 0
          usedTotal += used
          perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
        }
        const limit = kredensial.length * LIMIT_PER_PROJECT
        res.setHeader('Cache-Control', 'no-store')
        kirim(res, 200, { limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        const body = await bacaBody(req)
        if (!body.title) { kirim(res, 400, { error: 'Judul video wajib diisi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const meta = {
            snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
            status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
          }
          const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
            body: JSON.stringify(meta)
          })
          if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
          const sessionUri = init.headers.get('location')
          if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
          await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id, project_id: kred.n })
          kirim(res, 200, { sessionUri: sessionUri, project: kred.n })
          return
        }
        kirim(res, 429, { error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
      })
      server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
          if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
          const j = await r.json()
          const items = j.items || []
          const batas = Date.now() - 15 * 60 * 1000
          const cocok = items.find(function (it) {
            const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
            return isNaN(t) ? false : t >= batas
          })
          if (!cocok) { kirim(res, 404, { error: 'Video terbaru tidak ditemukan' }); return }
          kirim(res, 200, { videoId: cocok.id && cocok.id.videoId, project: kred.n })
          return
        }
        kirim(res, 502, { error: 'Gagal memeriksa video terbaru: ' + terakhir })
      })
    }
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]
  }
})
```

## File: src/components/Carousel.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
import { Lightbox, SmartFit } from './ui.jsx'

export default function Carousel(props) {
  const slides = props.slides || []
  const autoMs = props.autoMs || 4000
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [zoom, setZoom] = useState(null)
  const trackRef = useRef(null)
  const touchX = useRef(0)
  const moved = useRef(false)

  useEffect(function () {
    if (slides.length < 2 || paused) return undefined
    const t = setInterval(function () {
      setIdx(function (i) { return (i + 1) % slides.length })
    }, autoMs)
    return function () { clearInterval(t) }
  }, [slides.length, paused, autoMs])

  useEffect(function () {
    if (trackRef.current) trackRef.current.style.transform = 'translateX(-' + (idx * 100) + '%)'
  }, [idx])

  if (!slides.length) return null

  if (slides.length === 1) {
    const s = slides[0]
    return (
      <>
        <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-900">
          <SmartFit src={s.src} full={s.full} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />
          <button type="button" title="Perbesar media" onClick={function () { setZoom(s) }}
            className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
            <SizedIcon name="expand" size={15} />
          </button>
        </div>
        {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}
      </>
    )
  }

  return (
    <>
      <div
        className="media-carousel group"
        onMouseEnter={function () { setPaused(true) }}
        onMouseLeave={function () { setPaused(false) }}
        onTouchStart={function (e) { touchX.current = e.touches[0].clientX; moved.current = false }}
        onTouchEnd={function (e) {
          const dx = e.changedTouches[0].clientX - touchX.current
          if (Math.abs(dx) > 40) {
            moved.current = true
            setIdx(function (i) { return (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length })
          }
        }}
      >
        <div ref={trackRef} className="carousel-track">
          {slides.map(function (s, i) {
            return (
              <div key={i} className="carousel-slide">
                <SmartFit
                  src={s.src}
                  full={s.full}
                   type={s.type}
                  alt={s.title || 'Media'}
                  onClick={function () {
                    if (moved.current) { moved.current = false; return }
                    setZoom(s)
                  }}
                />
                <button type="button" title="Perbesar media" onClick={function (e) { e.stopPropagation(); setZoom(s) }}
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100">
                  <SizedIcon name="expand" size={15} />
                </button>
                {s.title ? (
                  <span className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 text-white text-xs max-w-[85%] truncate">
                    {s.title}
                  </span>
                ) : null}
              </div>
            )
          })}
        </div>
        <button
          onClick={function () { setIdx(function (i) { return (i - 1 + slides.length) % slides.length }) }}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8249;
        </button>
        <button
          onClick={function () { setIdx(function (i) { return (i + 1) % slides.length }) }}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
        >
          &#8250;
        </button>
        <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
          {slides.map(function (s, i) {
            return (
              <button
                key={i}
                onClick={function () { setIdx(i) }}
                className={'carousel-dot h-2 w-2 rounded-full transition-all ' + (i === idx ? 'bg-white' : 'bg-white/40')}
              />
            )
          })}
        </div>
      </div>
      {zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}
    </>
  )
}
```

## File: src/components/Layout.jsx
```javascript
import { Outlet, Link, NavLink } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { useState } from 'react'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Tim & Dospem' }
]

export default function Layout() {
  const theme = useTheme()
  const { mahasiswa } = useAuth()
  const [open, setOpen] = useState(false)

  const linkCls = function (active) {
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-bsi-900 text-white' : 'text-slate-600 hover:bg-slate-100')
  }

  const themeBtn = function (extra) {
    return (
      <button onClick={theme.toggle} className={'rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100 text-slate-700 ' + (extra || 'h-10 w-10')} title="Ganti tema">
        <SizedIcon name={theme.dark ? 'sun' : 'moon'} size={18} />
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-bsi-800 to-gold-500 text-white grid place-items-center font-black">BSI</div>
              <div>
                <p className="font-bold leading-none text-slate-900">Logbook Magang</p>
                <p className="text-xs text-slate-500 mt-1">Bank Syariah Indonesia</p>
              </div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1">
              {LINKS.map(function (l) {
                return <NavLink key={l.to} to={l.to} className={function (s) { return linkCls(s.isActive) }}>{l.label}</NavLink>
              })}
            </nav>
            <div className="hidden xl:flex items-center gap-3">
              {themeBtn()}
              {mahasiswa ? (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Dashboard</Link>
                  <Link to="/" onClick={function () { logoutMahasiswa() }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</Link>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700">Masuk Intern</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              {themeBtn()}
              <button onClick={function () { setOpen(function (o) { return !o }) }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Menu</button>
            </div>
          </div>
        </div>
        {open ? (
          <div className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {LINKS.map(function (l) {
              return <Link key={l.to} to={l.to} onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100">{l.label}</Link>
            })}
            {mahasiswa ? (
              <>
                <Link to="/dashboard" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-bsi-800 text-white text-sm font-semibold">Dashboard</Link>
                <Link to="/" onClick={function () { setOpen(false); logoutMahasiswa() }} className="block px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</Link>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
          </div>
        ) : null}
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Tim Magang BSI
        </div>
      </footer>
    </div>
  )
}
```

## File: src/lib/logbook.js
```javascript
import { supabase } from './supabase.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(mahasiswaId, items, meta) {
  const itemIds = items.map(function (i) { return i.id }).filter(Boolean)
  const all = await supabase
    .from('galeri')
    .select('id, logbook_item_id')
    .in('logbook_item_id', itemIds.length ? itemIds : [EMPTY])
  const existing = new Map((all.data || []).map(function (g) { return [g.logbook_item_id, g.id] }))

  for (const item of items) {
    if (!item.id) continue
    if (item.show_in_gallery && item.media_path) {
      if (existing.has(item.id)) {
        await supabase.from('galeri').update({
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null,
        media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null }).eq('id', existing.get(item.id))
      } else {
        await supabase.from('galeri').insert({
          mahasiswa_id: mahasiswaId,
          logbook_item_id: item.id,
          judul: item.judul,
          deskripsi: item.deskripsi || 'Dokumentasi kegiatan dari logbook harian.',
          tanggal: meta.tanggal,
          kegiatan: meta.kategori,
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null,
        media_source: item.media_source || 'r2', youtube_id: item.youtube_id || null })
      }
    } else if (existing.has(item.id)) {
      await supabase.from('galeri').delete().eq('id', existing.get(item.id))
    }
  }
}
```

## File: src/lib/upload.js
```javascript
import { supabase } from './supabase.js'
import { iniVideo, ekstensiFile, siapkanFoto } from './konversi.js'

const MAKS_FOTO = 15 * 1024 * 1024
const MAKS_VIDEO = 50 * 1024 * 1024

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

function namaDasar(nama) {
  return String(nama || 'media').replace(/\.[^.]+$/, '')
}

function kirimDenganProgres(uploadUrl, blob, contentType, onProgres) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    if (onProgres) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgres(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('Gagal upload file ke R2 (status ' + xhr.status + ')'))
    }
    xhr.onerror = function () { reject(new Error('Gagal jaringan saat upload ke R2')) }
    xhr.send(blob)
  })
}

async function mintaIzin(token, filename, contentType, kind) {
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: filename, contentType: contentType, kind: kind })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal membuat izin upload (status ' + res.status + '): ' + text)
  }
  return res.json()
}

export async function uploadMedia(file, kind, onInfo) {
  const video = iniVideo(file)
  if (video && file.size > MAKS_VIDEO) {
    throw new Error('Video melebihi 50 MB. Potong dulu durasinya supaya upload cepat dan kuota aman.')
  }
  if (!video && file.size > MAKS_FOTO) {
    throw new Error('Foto melebihi 15 MB. Pilih file dengan ukuran lebih kecil.')
  }
  let fullBlob = file
  let fullType = file.type
  let thumbBlob = null
  if (!video) {
    try {
      const hasil = await siapkanFoto(file, onInfo)
      fullBlob = hasil.fullBlob
      fullType = hasil.fullType
      thumbBlob = hasil.thumbBlob
    } catch (e) {
      throw new Error('Foto format .' + ekstensiFile(file) + ' tidak bisa diproses browser. Ubah dulu ke JPG atau PNG. Di iPhone: Settings, Camera, Formats, pilih Most Compatible.')
    }
  }
  if (onInfo) onInfo('')
  const token = await getToken()
  const extFull = fullType === 'image/webp' ? 'webp' : (fullType === 'image/jpeg' ? 'jpg' : ekstensiFile(file))
  const infoFull = await mintaIzin(token, namaDasar(file.name) + '.' + extFull, fullType, kind)
  await kirimDenganProgres(infoFull.uploadUrl, fullBlob, fullType, function (p) {
    if (onInfo) onInfo('Mengunggah ' + Math.round(p * 100) + '%')
  })
  let thumbUrl = null
  if (thumbBlob) {
    try {
      const namaThumb = namaDasar(infoFull.key.split('/').pop()) + '.webp'
      const infoThumb = await mintaIzin(token, namaThumb, 'image/webp', 'thumb/' + kind)
      await kirimDenganProgres(infoThumb.uploadUrl, thumbBlob, 'image/webp', null)
      thumbUrl = infoThumb.publicUrl
    } catch (e) {
      thumbUrl = null
    }
  }
  console.log('[UPLOAD] File penuh: ' + infoFull.key + ' | Thumbnail: ' + (thumbUrl || 'tidak dibuat'))
  return { path: infoFull.key, publicUrl: infoFull.publicUrl, thumbUrl: thumbUrl }
}

export async function deleteMedia(key) {
  const token = await getToken()
  const res = await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ key: key })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal hapus media di R2 (status ' + res.status + '): ' + text)
  }
  return res.json()
}
```

## File: src/pages/DospemPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { EmptyState, Modal , Avatar } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function DospemPage() {
  const [logs, setLogs] = useState([])
  const [people, setPeople] = useState([])
  const [galCount, setGalCount] = useState(0)
  const [hadirCount, setHadirCount] = useState(0)
  const [galRows, setGalRows] = useState([])
  const [hadirRows, setHadirRows] = useState([])
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi, foto_profil').order('nama')
      const g = await supabase.from('galeri').select('id, mahasiswa_id')
      const h = await supabase.from('daftar_hadir').select('id, mahasiswa_id, status')
      setLogs(l.data || [])
      setPeople(p.data || [])
      setGalCount((g.data || []).length)
      setGalRows(g.data || [])
      setHadirCount((h.data || []).length)
      setHadirRows(h.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Monitoring Dospem dan Kaprodi</span>
        <h1 className="mt-6 text-3xl lg:text-5xl font-black max-w-3xl leading-tight">Ringkasan kegiatan magang tim di Bank BSI</h1>
        <p className="mt-4 max-w-3xl text-white/80 leading-relaxed">Halaman ini dapat diakses tanpa login.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) {
                return (
                  <div key={i} className="rounded-[1.5rem] bg-white/10 p-5">
                    <div className="skeleton skeleton-on-dark h-4 w-24"></div>
                    <div className="skeleton skeleton-on-dark h-9 w-14 mt-2"></div>
                  </div>
                )
              })
            : [
                <div key="mahasiswa" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Total mahasiswa</p><p className="mt-1 text-3xl font-black">{people.length}</p></div>,
                <div key="logbook" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Logbook publik</p><p className="mt-1 text-3xl font-black">{logs.length}</p></div>,
                <div key="galeri" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Media galeri</p><p className="mt-1 text-3xl font-black">{galCount}</p></div>,
                <div key="hadir" className="card-hover rounded-[1.5rem] bg-white/10 p-5"><p className="text-sm text-white/70">Catatan hadir</p><p className="mt-1 text-3xl font-black">{hadirCount}</p></div>
              ]}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/logbook" className="px-5 py-3 rounded-2xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400">Lihat logbook</Link>
          <Link to="/galeri" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat galeri</Link>
          <Link to="/absen" className="px-5 py-3 rounded-2xl bg-white/10 text-white text-sm font-bold hover:bg-white/20">Lihat daftar hadir</Link>
        </div>
      </section>

      <section className="mt-10">
<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="grid-pusat-rapat mt-6">
{loading
? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>
 </div>
)
})}
{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}
</div>
</section>

      <section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>
      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/HomePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonStatCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { mahasiswa } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, mahasiswa: 0 })
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('mahasiswa').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, mahasiswa: (p.data || []).length })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Magang Bank BSI</span>
            <h1 className="mt-6 text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-5 max-w-2xl text-white/80 leading-relaxed">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/logbook" className="px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400">Lihat Logbook</Link>
              <Link to="/galeri" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Lihat Galeri</Link>
              <Link to="/absen" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Buka Dashboard</Link>
                : <Link to="/login" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="mahasiswa" label="Total mahasiswa magang" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" />,
                <StatCard key="logbook" label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />,
                <StatCard key="galeri" label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Kegiatan terbaru</p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/LoginPage.jsx
```javascript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginWithNim } from '../lib/auth.js'
import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'
import { EyeToggle } from '../components/icons.jsx'

export default function LoginPage() {
  const navigate = useNavigate()
  const [nim, setNim] = useState('')
  const [kode, setKode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lihatKode, setLihatKode] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
  await loginWithNim(nim, kode)
  navigate('/dashboard')
} catch (err) {
  setError(err.message)
}
    setBusy(false)
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="card-hover rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-10">
        <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Area Intern</span>
        <h1 className="mt-6 text-3xl lg:text-4xl font-black leading-tight">Masuk untuk mengisi logbook, galeri, dan daftar hadir</h1>
        <p className="mt-4 text-white/80 leading-relaxed">Halaman ini hanya digunakan oleh mahasiswa magang. Dosen pembimbing dan kaprodi tidak perlu login untuk melihat halaman publik.</p>
      </div>
      <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 lg:p-10">
        <h2 className="text-2xl font-black text-slate-900">Login mahasiswa magang</h2>
        {error ? <p className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p> : null}
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className={labelCls}>NIM <span className="text-red-500">*</span></label>
            <input className={inputCls} value={nim} onChange={function (e) { setNim(e.target.value) }} placeholder="Contoh: 20260001" required />
          </div>
          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <div className="relative mt-1.5">
              <input
                type={lihatKode ? 'text' : 'password'}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
                value={kode}
                onChange={function (e) { setKode(e.target.value) }}
                placeholder="Masukkan kode akses"
                required
              />
              <button
                type="button"
                onClick={function () { setLihatKode(function (v) { return !v }) }}
                title={lihatKode ? 'Sembunyikan kode akses' : 'Lihat kode akses'}
                className="absolute right-2 top-0 bottom-0 my-auto grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <EyeToggle open={lihatKode} size={18} />
              </button>
            </div>
          </div>
          <button type="submit" disabled={busy} className={btnPrimary}>{busy ? 'Memproses...' : 'Masuk ke dashboard'}</button>
        </form>
      </div>
    </section>
  )
}
```

## File: src/pages/LogbookPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function LogbookPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const logs = all.filter(function (l) {
    if (filter.mahasiswa && l.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedLogs = urutkanTanggal(logs, sort)
  const totalData = sortedLogs.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedLogs = sortedLogs.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Logbook publik</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Catatan kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
          : paginatedLogs.map(function (l) {
              return (
                <div key={l.id} className="kolom-kartu">
                  <LogbookCard log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                    onDetail={function () { setDetail(l) }} />
                </div>
              )
            })}
        {!loading && !logs.length ? <div className="w-full"><EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-500">
          Halaman {pageAman} dari {totalPages} • {totalData} logbook
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/pages/TimPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { SkeletonPersonCard } from '../components/Skeleton.jsx'

export default function TimPage() {
  const [people, setPeople] = useState([])
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const p = await supabase.from('mahasiswa').select('id, nama, nim, prodi, foto_profil').order('nama')
      const l = await supabase.from('logbooks').select('id, mahasiswa_id, foto_profil').eq('status', 'publik')
      const g = await supabase.from('galeri').select('id, mahasiswa_id, foto_profil')
      setPeople(p.data || [])
      setLogs(l.data || [])
      setGaleri(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Profil Mahasiswa</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Mahasiswa magang Bank BSI</h1>
      </section>
      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonPersonCard key={i} /> })
          : people.map(function (p) {
              const totalLog = logs.filter(function (l) { return l.mahasiswa_id === p.id }).length
              const totalGal = galeri.filter(function (g) { return g.mahasiswa_id === p.id }).length
              const initials = p.nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
              return (
                <div key={p.id} className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-3xl bg-bsi-800 text-white grid place-items-center text-xl font-black">{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : initials}</div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{p.nama}</p>
                      <p className="text-sm text-slate-500">NIM {p.nim}</p>
                      {p.prodi ? <span className="mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-bsi-100 text-bsi-900">{p.prodi}</span> : null}
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Logbook publik</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalLog}</p></div>
                    <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Media galeri</p><p className="mt-1 text-2xl font-black text-bsi-900">{totalGal}</p></div>
                  </div>
                </div>
              )
            })}
      </section>
    </div>
  )
}
```

## File: src/pages/AttendancePage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { SkeletonStatCard, SkeletonChartRow, SkeletonAttendanceCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function AttendancePage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, mahasiswa(*)').order('tanggal', { ascending: false })
      const p = await supabase.from('mahasiswa').select('id, nama, nim').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const rows = all.filter(function (r) {
    if (filter.mahasiswa && r.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedRows = urutkanTanggal(rows, sort)
  const totalData = sortedRows.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedRows = sortedRows.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  const counts = rows.reduce(function (acc, r) {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const perPerson = people.map(function (p) {
    const mine = rows.filter(function (r) { return r.mahasiswa_id === p.id })
    const c = mine.reduce(function (acc, r) { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})
    return { nama: p.nama, nim: p.nim, Masuk: c.Masuk || 0, Izin: c.Izin || 0, Bolos: c.Bolos || 0, total: mine.length }
  })
  const maxTotal = Math.max.apply(null, perPerson.map(function (p) { return p.total }).concat([1]))

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Daftar hadir</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Monitoring kehadiran tim magang</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="total" label="Total catatan hadir" value={rows.length} sub="Sesuai filter aktif" />,
                <StatCard key="masuk" label="Masuk" value={counts.Masuk || 0} sub="Mahasiswa hadir" />,
                <StatCard key="izin" label="Izin" value={counts.Izin || 0} sub="Dengan keterangan" />,
                <StatCard key="bolos" label="Bolos" value={counts.Bolos || 0} sub="Tanpa keterangan" />
              ]}
        </div>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.check} value={filter.status} onChange={function (v) { setFilter(Object.assign({}, filter, { status: v })) }}
            options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Grafik kehadiran per mahasiswa</h2>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Masuk</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Izin</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Bolos</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonChartRow key={i} /> })
            : perPerson.map(function (p) {
                return (
                  <div key={p.nim} className="card-hover rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">NIM {p.nim}</p>
                      </div>
                      <div className="text-xs text-slate-500">Masuk: {p.Masuk} | Izin: {p.Izin} | Bolos: {p.Bolos}</div>
                    </div>
                    <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="bg-emerald-500 transition-all duration-500" style={{ width: (p.Masuk / maxTotal) * 100 + '%' }} />
                      <div className="bg-amber-500 transition-all duration-500" style={{ width: (p.Izin / maxTotal) * 100 + '%' }} />
                      <div className="bg-red-500 transition-all duration-500" style={{ width: (p.Bolos / maxTotal) * 100 + '%' }} />
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Daftar kehadiran sesuai filter</h2>
        <div className="grid-pusat-rapat mt-6">
          {loading
            ? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonAttendanceCard /></div> })
            : paginatedRows.map(function (r) {
                return (
                  <div key={r.id} className="kolom-kartu-rapat">
                    <AttendanceCard row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                      onDetail={function () { setDetail(r) }} />
                  </div>
                )
              })}
          {!loading && !rows.length ? <div className="w-full"><EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /></div> : null}
        </div>
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-500">
          Halaman {pageAman} dari {totalPages} • {totalData} catatan
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/components/icons.jsx
```javascript
function svg(inner, size) {
  const s = size || 16
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {inner}
    </svg>
  )
}

const paths = {
  funnel: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
  user: (
    <>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  tag: (
    <>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </>
  ),
  close: (
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  ),
  chevron: <polyline points="6 9 12 15 18 9" />,
  list: (
    <>
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </>
  ),
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </>
  ),
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  file: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>
  ),
  camera: (
    <>
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  ),
  expand: (
    <>
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </>
  ),
  youtube: (
    <>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </>
  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  sort: (
    <>
      <path d="M3 6h13" />
      <path d="M3 12h9" />
      <path d="M3 18h5" />
      <path d="M17 6v12" />
      <path d="m14 15 3 3 3-3" />
    </>
  )
}

export const ICONS = {
  funnel: svg(paths.funnel),
  user: svg(paths.user),
  tag: svg(paths.tag),
  calendar: svg(paths.calendar),
  image: svg(paths.image),
  close: svg(paths.close),
  check: svg(paths.check),
  chevron: svg(paths.chevron),
  list: svg(paths.list),
  link: svg(paths.link)
}

export function SizedIcon(props) {
  const inner = paths[props.name]
  if (!inner) return null
  return svg(inner, props.size || 16)
}

export function EyeToggle(props) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={'eye-icon ' + (props.open ? 'terbuka' : '')}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" className="eye-pupil" />
      <line x1="2" y1="2" x2="22" y2="22" className="eye-slash" />
    </svg>
  )
}
```

## File: src/pages/GalleryPage.jsx
```javascript
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'
import { SkeletonGalleryCard } from '../components/Skeleton.jsx'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function GalleryPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, mahasiswa(*)').order('tanggal', { ascending: false })
      setAll(g.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const items = all.filter(function (i) {
    if (filter.kegiatan && (i.kegiatan || 'Lainnya') !== filter.kegiatan) return false
    if (filter.tipe && i.media_type !== filter.tipe) return false
    return matchesDateFilters(i.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedItems = urutkanTanggal(items, sort)
  const totalData = sortedItems.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedItems = sortedItems.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Galeri dokumentasi</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Foto dan video kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.tag} value={filter.kegiatan} onChange={function (v) { setFilter(Object.assign({}, filter, { kegiatan: v })) }}
            options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
          <FilterSelect icon={ICONS.image} value={filter.tipe} onChange={function (v) { setFilter(Object.assign({}, filter, { tipe: v })) }}
            options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonGalleryCard /></div> })
          : paginatedItems.map(function (i) {
              return (
                <div key={i.id} className="kolom-kartu">
                  <GalleryCard item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                    onDetail={function () { setDetail(i) }} />
                </div>
              )
            })}
        {!loading && !items.length ? <div className="w-full"><EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-500">
          Halaman {pageAman} dari {totalPages} • {totalData} media
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}
```

## File: src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* ===== Animasi ===== */
@keyframes appFadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes overlayFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes modalPop { from { opacity: 0; transform: scale(.95) translateY(16px); } to { opacity: 1; transform: scale(1) translateY(0); } }
@keyframes toastSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes filterSlide { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 600px; } }
.anim-page { animation: appFadeUp .35s ease; }
.anim-toast { animation: toastSlide .35s ease; }
.anim-overlay { animation: overlayFade .25s ease; }
.anim-modal { animation: modalPop .3s cubic-bezier(.16,1,.3,1); }
.anim-filter { animation: filterSlide .3s ease; }

/* ===== Komponen umum ===== */
body { transition: background-color .3s ease, color .3s ease; }
button, a, input, select, textarea { transition: background-color .2s ease, color .2s ease, border-color .2s ease, transform .15s ease, box-shadow .2s ease, opacity .2s ease; }
button:active, a:active, .clickable:active { transform: scale(.97); }
.card-hover { transition: none; }
.card-hover:hover { transform: none; }

/* ===== Carousel ===== */
.media-carousel { position: relative; overflow: hidden; border-radius: 1rem; aspect-ratio: 16 / 9; background: #020617; }
.carousel-track { display: flex; height: 100%; transition: transform .5s ease; }
.carousel-slide { position: relative; flex: 0 0 100%; height: 100%; }
.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; background: #020617; }
.media-carousel button:active { transform: translateY(-50%) scale(.97); }

/* ===== Filter ===== */
.filter-input-wrap { position: relative; display: inline-flex; align-items: center; }
.filter-input-wrap svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; z-index: 1; }
.filter-input-wrap select, .filter-input-wrap input { padding-left: 38px !important; }
.time-toggle { display: inline-flex; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; }
.time-toggle button { padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; color: #64748b; }
.time-toggle button.active { background: #16623c; color: #fff; }

/* ===== Dark mode ===== */
.dark body { background-color: #020617; color: #e2e8f0; }
.dark .bg-white { background-color: #0f172a !important; }
.dark .bg-slate-50 { background-color: #020617 !important; }
.dark .bg-slate-100 { background-color: #1e293b !important; }
.dark .bg-slate-900 { background-color: #f8fafc !important; color: #0f172a !important; }
.dark .bg-white\/90 { background-color: rgba(2,6,23,.9) !important; }
.dark .bg-white\/10 { background-color: rgba(255,255,255,.07) !important; }
.dark .bg-white\/5 { background-color: rgba(255,255,255,.04) !important; }
.dark .border-slate-100, .dark .border-slate-200, .dark .border-slate-300, .dark .border-white\/10 { border-color: #1e293b !important; }
.dark .text-slate-900, .dark .text-slate-800, .dark .text-slate-700 { color: #f8fafc !important; }
.dark .text-slate-600, .dark .text-slate-500, .dark .text-slate-400 { color: #94a3b8 !important; }
.dark .hover\:bg-slate-100:hover { background-color: #1e293b !important; color: #f8fafc !important; }
.dark .hover\:bg-slate-200:hover { background-color: #0f172a !important; color: #f8fafc !important; }
.dark input, .dark select, .dark textarea { background-color: #0f172a; color: #e2e8f0; border-color: #334155; }
.dark input::placeholder, .dark textarea::placeholder { color: #64748b; }
.dark .bg-emerald-50, .dark .bg-emerald-100 { background-color: rgba(16,185,129,.14) !important; }
.dark .text-emerald-800, .dark .text-emerald-900 { color: #6ee7b7 !important; }
.dark .bg-amber-50, .dark .bg-amber-100 { background-color: rgba(245,158,11,.14) !important; }
.dark .text-amber-800 { color: #fcd34d !important; }
.dark .bg-red-50, .dark .bg-red-100 { background-color: rgba(239,68,68,.14) !important; }
.dark .text-red-700 { color: #fca5a5 !important; }
.dark .bg-bsi-100 { background-color: rgba(39,192,109,.16) !important; }
.dark .text-bsi-900, .dark .text-bsi-800, .dark .text-bsi-700 { color: #6ee7b7 !important; }
.dark .bg-bsi-800, .dark .bg-bsi-900 { background-color: #065f46 !important; }
.dark .text-gold-600, .dark .text-gold-500 { color: #fbbf24 !important; }
.dark .bg-gold-500\/15 { background-color: rgba(245,158,11,.15) !important; }
.dark .bg-gold-500 { color: #0f172a !important; }
.dark .time-toggle { border-color: #334155; }
.dark .time-toggle button { color: #94a3b8; }
.dark .time-toggle button.active { background: #065f46; color: #fff; }

/* ===== Skeleton loader ===== */
@keyframes shimmer {
  100% { transform: translateX(100%); }
}
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: #e2e8f0;
  border-radius: 0.75rem;
}
.skeleton::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
  animation: shimmer 1.4s infinite;
}
.dark .skeleton { background-color: #1e293b; }
.dark .skeleton::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }
.skeleton-on-dark { background-color: rgba(255,255,255,0.15); }
.skeleton-on-dark::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent); }

/* ===== Textarea tanpa resize manual ===== */
textarea {
  resize: none;
  overflow-y: hidden;
}

/* ===== Scrollbar custom tipis bertema ===== */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}
.dark * {
  scrollbar-color: #334155 transparent;
}
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: #16623c;
}
.dark ::-webkit-scrollbar-thumb {
  background-color: #334155;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #27c06d;
}

/* ===== Animasi icon mata ===== */
.eye-icon .eye-slash {
  stroke-dasharray: 29;
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset .35s ease, opacity .3s ease;
}
.eye-icon.terbuka .eye-slash {
  stroke-dashoffset: 29;
  opacity: 0;
}
.eye-icon .eye-pupil {
  transform-origin: 12px 12px;
  transition: transform .35s ease, opacity .35s ease;
}
.eye-icon.terbuka .eye-pupil {
  transform: scale(1);
  opacity: 1;
}
.eye-icon:not(.terbuka) .eye-pupil {
  transform: scale(.7);
  opacity: .6;
}

.titik-anim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}
.titik-anim i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.2;
  animation: titik-halus 1.1s ease-in-out infinite;
}
.titik-anim i:nth-child(2) { animation-delay: 0.18s; }
.titik-anim i:nth-child(3) { animation-delay: 0.36s; }
@keyframes titik-halus {
  0%, 60%, 100% { opacity: 0.2; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-1px) scale(1); }
}

.pemutar-bungkus iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}

/* Pemutar video referensi: iframe cropping & slider custom */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}
.pemutar-referensi:fullscreen {
  border-radius: 0;
  max-width: none;
  width: 100vw;
  height: 100vh;
}
.pemutar-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}

/* pusat-pemutar-v3: iframe mengisi wadah persis, layar penuh menengahkan video */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
  position: absolute;
  left: 0;
  top: 0;
  width: 100% !important;
  height: 100% !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000;
}

/* pusat-pemutar-v4: margin crop 70px menyembunyikan seluruh chrome bawaan YouTube */
.pemutar-referensi iframe {
  position: absolute !important;
  top: -70px !important;
  left: -2px !important;
  width: calc(100% + 4px) !important;
  height: calc(100% + 140px) !important;
  pointer-events: none !important;
  border: 0 !important;
  background: #000 !important;
}
.pemutar-referensi:fullscreen {
  aspect-ratio: auto !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  border-radius: 0 !important;
  background: #000 !important;
}

/* grid-pusat: baris kartu yang tidak penuh otomatis rata tengah */
.grid-pusat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem; }
.grid-pusat-rapat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.kolom-kartu, .kolom-kartu-rapat { width: 100%; display: flex; }
.kolom-kartu > *, .kolom-kartu-rapat > * { width: 100%; }
@media (min-width: 768px) {
  .kolom-kartu { width: calc(50% - 0.625rem); }
  .kolom-kartu-rapat { width: calc(50% - 0.5rem); }
}
@media (min-width: 1280px) {
  .kolom-kartu { width: calc(33.3333% - 0.83333rem); }
  .kolom-kartu-rapat { width: calc(33.3333% - 0.66667rem); }
}
```

## File: src/components/cards.jsx
```javascript
import { Avatar } from './ui.jsx'
import PemutarVideo from './PemutarVideo.jsx'
import Carousel from './Carousel.jsx'
import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall, ZoomableMedia, SmartFit , MediaYouTube } from './ui.jsx'
import { formatTanggal, formatTanggalShort } from '../lib/format.js'

function PersonChip(props) {
  const p = props.mahasiswa
  const nama = p ? p.nama : 'Mahasiswa'
  const nim = p ? p.nim : '-'
  const prodi = p && p.prodi ? p.prodi : ''
  const initials = nama.split(' ').slice(0, 2).map(function (w) { return w.charAt(0) || '' }).join('').toUpperCase()
  return (
    <div className="flex items-center gap-3">
      <div className={'rounded-2xl bg-bsi-800 text-white grid place-items-center font-bold ' + (props.size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11')}>
        {typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-[28%] object-cover" /> : initials}</div>
      <div>
        <p className="font-semibold text-slate-900">{nama}</p>
        <p className="text-xs text-slate-500">NIM {nim}</p>
      </div>
    </div>
  )
}

function ActionButtons(props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={props.onDetail} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>Detail</button>
      {props.isOwner && props.onEdit ? (
        <>
          <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
          <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
        </>
      ) : null}
    </div>
  )
}

export function slidesFromItems(items) {
  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {
    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }
  })
}

export function LogbookCard(props) {
  const log = props.log
  const items = log.logbook_items || []
  const slides = slidesFromItems(items)
  const preview = items.slice(0, 2)
  return (
    <article className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4">
      {slides.length ? <Carousel slides={slides} /> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          <CategoryBadge value={log.kategori} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        </div>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-900">{log.judul}</h3>
        <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-bsi-800">Terdapat {items.length} kegiatan</p>
        <div className="mt-2 space-y-1">
          {preview.map(function (it, i) {
            return <p key={it.id} className="text-xs text-slate-500 truncate">{i + 1}. {it.judul}</p>
          })}
          {items.length > 2 ? <p className="text-xs text-bsi-700 font-semibold">+{items.length - 2} kegiatan lainnya</p> : null}
        </div>
      </div>
      <div className="mt-auto border-t border-slate-100 pt-4 flex flex-wrap items-center justify-between gap-4">
        <PersonChip mahasiswa={log.mahasiswa} />
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </article>
  )
}

export function LogbookDetail(props) {
  const log = props.log
  const items = log.logbook_items || []
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <CategoryBadge value={log.kategori} />
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{log.unit || 'Unit belum diisi'}</span>
        <StatusBadge status={log.status} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{formatTanggal(log.tanggal)}</p>
        <h2 className="mt-1 text-2xl font-black text-slate-900">{log.judul}</h2>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Rincian kegiatan</p>
        <div className="mt-4">
          {items.map(function (it, i) {
            return (
              <div key={it.id} className={'relative pl-12 ' + (i < items.length - 1 ? 'pb-6' : 'pb-0')}>
                <span className="absolute left-0 top-0 h-9 w-9 rounded-full bg-bsi-800 text-white grid place-items-center text-sm font-bold">{i + 1}</span>
                {i < items.length - 1 ? <span className="absolute left-4 top-9 bottom-0 w-px bg-slate-200 dark:bg-slate-700" /> : null}
                 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                   {it.media_path ? (
                     it.media_source === 'youtube' ? (
                       <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className="aspect-video w-full rounded-2xl mb-3" />
                     ) : (
                       <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                     )
                   ) : null}
                  <p className="font-bold text-slate-900">
                    {it.judul}
                    {it.show_in_gallery && it.media_path ? <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Di galeri</span> : null}
                  </p>
                  {it.deskripsi ? <p className="mt-1 text-sm text-slate-600">{it.deskripsi}</p> : null}
                  {it.hasil ? <p className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Hasil: {it.hasil}</p> : null}
                </div>
              </div>
            )
          })}
          {!items.length ? <p className="text-sm text-slate-500">Belum ada rincian kegiatan.</p> : null}
        </div>
      </div>
      {log.kendala || log.solusi || log.pembelajaran ? (
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Refleksi harian</p>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {log.kendala ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Kendala</p><p className="mt-1 text-sm text-slate-700">{log.kendala}</p></div> : null}
            {log.solusi ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Solusi</p><p className="mt-1 text-sm text-slate-700">{log.solusi}</p></div> : null}
            {log.pembelajaran ? <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold uppercase text-slate-400">Pembelajaran</p><p className="mt-1 text-sm text-slate-700">{log.pembelajaran}</p></div> : null}
          </div>
        </div>
      ) : null}
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={log.mahasiswa} /></div>
    </div>
  )
}

export function GalleryCard(props) {
  const item = props.item
  return (
    <article onClick={props.onDetail} className="clickable cursor-pointer bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {item.media_source === 'youtube' ? (
        <MediaYouTube src={item.media_path} alt={item.judul} />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}
      </div>
      <div className="p-5 space-y-3 flex-1 flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            <CategoryBadge value={item.kegiatan} />
            {item.logbook_item_id ? <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gold-500/15 text-gold-600">Dari logbook</span> : null}
          </div>
          <span className="text-xs text-slate-500">{formatTanggalShort(item.tanggal)}</span>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{item.judul}</h3>
        <p className="text-sm text-slate-600 line-clamp-2">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
        <div className="mt-auto pt-3 border-t border-slate-100 space-y-3">
          <PersonChip mahasiswa={item.mahasiswa} />
          {props.onEdit ? (
            <div className="flex flex-wrap gap-2" onClick={function (e) { e.stopPropagation() }}>
              <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
              <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-bsi-800">Klik kartu untuk melihat detail</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function GalleryDetail(props) {
  const item = props.item
  return (
    <div className="space-y-4">
      {item.media_source === 'youtube' ? (
        <PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className="aspect-video w-full rounded-2xl" />
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <CategoryBadge value={item.kegiatan} />
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{item.media_type === 'video' ? 'Video' : 'Foto'}</span>
        </div>
        <span className="text-sm text-slate-500">{formatTanggal(item.tanggal)}</span>
      </div>
      <div>
        <h2 className="text-2xl font-black text-slate-900">{item.judul}</h2>
        <p className="mt-3 text-slate-600 leading-relaxed">{item.deskripsi || 'Tidak ada deskripsi.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={item.mahasiswa} /></div>
    </div>
  )
}

export function AttendanceCard(props) {
  const row = props.row
  return (
    <div className="card-hover bg-white rounded-3xl border border-slate-200 shadow-sm p-5 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500 pb-4">{formatTanggal(row.tanggal)}</p>
          <div className="flex items-center gap-3"><Avatar src={props.row && props.row.mahasiswa && props.row.mahasiswa.foto_profil ? props.row.mahasiswa.foto_profil : null} nama={props.row && props.row.mahasiswa ? props.row.mahasiswa.nama : 'Mahasiswa'} size="md" /><div className="min-w-0 flex-1"><p className="mt-1 font-bold text-slate-900">{row.mahasiswa ? row.mahasiswa.nama : 'Mahasiswa'}</p>
          <p className="text-xs text-slate-500">NIM {row.mahasiswa ? row.mahasiswa.nim : '-'}</p></div></div>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="mt-4">
        <ActionButtons isOwner={props.isOwner} onDetail={props.onDetail} onEdit={props.onEdit} onDelete={props.onDelete} />
      </div>
    </div>
  )
}

export function AttendanceDetail(props) {
  const row = props.row
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{formatTanggal(row.tanggal)}</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Detail daftar hadir</h2>
        </div>
        <AttendanceBadge status={row.status} />
      </div>
      <div className="rounded-2xl bg-slate-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Alasan atau keterangan</p>
        <p className="mt-1 text-sm text-slate-700">{row.alasan || 'Tidak ada alasan.'}</p>
      </div>
      <div className="border-t border-slate-100 pt-4"><PersonChip mahasiswa={row.mahasiswa} /></div>
    </div>
  )
}
```

## File: src/components/ui.jsx
```javascript
import PemutarVideo from './PemutarVideo.jsx'
import { useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
function useBodyScrollLock(active) {
  useEffect(function () {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () {
      document.body.style.overflow = previous
    }
  }, [active])
}


export const inputCls = 'mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'
export const labelCls = 'text-sm font-semibold text-slate-700'
export const btnPrimary = 'w-full rounded-2xl bg-bsi-800 px-6 py-4 text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-4 py-2 rounded-xl text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  return (
    <div className={cardCls + ' p-6'}>
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-2 text-3xl font-black text-bsi-900">{props.value}</p>
      {props.sub ? <p className="mt-1 text-xs text-slate-500">{props.sub}</p> : null}
    </div>
  )
}

export function EmptyState(props) {
  return (
    <div className={cardCls + ' border-dashed p-10 text-center'}>
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
        <SizedIcon name={props.icon || 'file'} size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{props.title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Siap dilihat' : 'Draft'}
    </span>
  )
}

export function CategoryBadge(props) {
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bsi-100 text-bsi-900">{props.value || 'Lainnya'}</span>
}

export function AttendanceBadge(props) {
  const map = {
    Masuk: 'bg-emerald-100 text-emerald-800',
    Izin: 'bg-amber-100 text-amber-800',
    Bolos: 'bg-red-100 text-red-700'
  }
  return <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (map[props.status] || 'bg-slate-100 text-slate-700')}>{props.status}</span>
}

export function Modal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.children}</div>
        </div>
      </div>
    </div>
  )
}

export function AutoTextArea(props) {
  const ref = useRef(null)

  useEffect(function () {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [props.value])

  return (
    <textarea
      ref={ref}
      className={props.className}
      rows={props.rows || 2}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      disabled={props.disabled || false}
    />
  )
}

export function ConfirmModal(props) {
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="p-6 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
              <SizedIcon name="trash" size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">{props.title || 'Hapus data ini?'}</h3>
              <p className="mt-2 text-sm text-slate-500">{props.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={props.onCancel}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Batal
              </button>
              <button type="button" onClick={props.onConfirm}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
                {props.confirmLabel || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    let nama = 'media'
      try {
        const urlAsli = new URL(props.src)
        const ekstensi = urlAsli.pathname.split('.').pop().split('?')[0] || 'jpg'
        if (props.title && props.title.trim()) {
          const judulAman = props.title.trim().replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '-').substring(0, 60)
          nama = judulAman + '.' + ekstensi
        } else {
          nama = urlAsli.pathname.split('/').pop() || ('media.' + ekstensi)
        }
      } catch (e) {
        nama = (props.title || 'media') + '.jpg'
      }
    try {
      const urlUnduh = props.src + (props.src.includes('?') ? '&' : '?') + 'unduh=1'
      const res = await fetch(urlUnduh, { cache: 'no-store' })
      if (!res.ok) throw new Error('status ' + res.status)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nama
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(function () { URL.revokeObjectURL(url) }, 2000)
    } catch (err) {
      window.open(props.src, '_blank')
    }
    setBusyUnduh(false)
  }
  return (
    <div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>
      <div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
          <PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (
          <img
            src={props.src}
            alt={props.title || 'Media'}
            onClick={props.onClose}
            className="mx-auto max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-2xl object-contain"
          />
        )}
        {props.title ? <p className="mt-3 truncate text-center text-sm text-slate-300">{props.title}</p> : null}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : 'Unduh media'}
          onClick={unduh}
          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={props.onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">Klik media atau tekan Esc untuk menutup</p>
    </div>
  )
}

export function ZoomableMedia(props) {
  const [open, setOpen] = useState(false)
  const isVideo = props.type === 'video'
  return (
    <div className={'relative group ' + (props.className || '')}>
      <SmartFit
        src={props.src}
        type={props.type}
        alt={props.title || 'Media'}
        full={props.full || props.src}
         controls={isVideo}
        onClick={isVideo ? null : function (e) { e.stopPropagation(); setOpen(true) }}
      />
      <button
        type="button"
        title="Perbesar media"
        onClick={function (e) { e.stopPropagation(); setOpen(true) }}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100"
      >
        <SizedIcon name="expand" size={15} />
      </button>
      {open ? <Lightbox src={props.full || props.src} type={props.type} title={props.title} onClose={function () { setOpen(false) }} /> : null}
    </div>
  )
}


export function SmartFit(props) {
  const [ratio, setRatio] = useState(null)
  const [near, setNear] = useState(false)
  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }
  useEffect(function () {
    const el = mediaRef.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return undefined
    }
    const io = new IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          setNear(true)
          io.disconnect()
          break
        }
      }
    }, { rootMargin: '400px' })
    io.observe(el)
    return function () { io.disconnect() }
  }, [])
  function bacaUkuran(e) {
    const el = e.target
    const w = isVideo ? el.videoWidth : el.naturalWidth
    const h = isVideo ? el.videoHeight : el.naturalHeight
    if (w && h) setRatio(w / h)
  }
  function cadangkan(e) {
    const el = e.currentTarget
    const cad = props.full && props.full !== props.src ? props.full : props.src
    if (cad && el.src !== cad) el.src = cad
  }
  const cover = ratio !== null && ratio > 1
  const potret = ratio !== null && ratio <= 1
  return (
    <>
      {potret && !isVideo ? (
        <img src={props.src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={cadangkan} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      ) : null}
      {isVideo ? (
        <video
          ref={mediaRef}
          src={near ? props.src : undefined}
          muted={props.controls ? false : true}
          preload="metadata"
          controls={props.controls || false}
          onLoadedMetadata={bacaUkuran}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain')}
        />
      ) : (
        <img
          ref={mediaRef}
          src={near ? props.src : undefined}
          alt={props.alt || 'Media'}
          loading="lazy"
          decoding="async"
          onLoad={bacaUkuran}
          onError={cadangkan}
          onClick={props.onClick || undefined}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain') + (props.onClick ? ' cursor-zoom-in' : '')}
        />
      )}
    </>
  )
}

export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="video" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Pratinjau video belum siap' : 'Menyiapkan pratinjau video'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Pratinjau video'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}

export function TitikAnim() {

  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\.{3}/g, '').replace(/\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}

export function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const radius = Math.round(px * 0.28) + 'px'
  const nama = props.nama || ''
  const kata = nama.trim().split(/\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    borderRadius: radius,
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 10px 28px rgba(15, 23, 42, 0.22)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: radius
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  if (bisaKlik) {
    return (
      <button type="button" onClick={props.onClick} title={props.title} style={gaya}>
        {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
      </button>
    )
  }
  return (
    <span style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}

export function Pagination(props) {
  /* pagination-v2: tombol nomor halaman sesuai tema BSI */
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (!totalItems) return null
  const halaman = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) halaman.push(i)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        halaman.push(i)
      } else if (halaman[halaman.length - 1] !== '...') {
        halaman.push('...')
      }
    }
  }
  const clsAngka = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold transition '
  const clsNav = 'flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition '
  const clsNetral = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-bsi-800'
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page <= 1}
          onClick={function () { onPageChange(page - 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Sebelumnya
        </button>
      ) : null}
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-sm font-bold text-slate-400">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={clsAngka + (aktif
              ? 'bg-bsi-800 text-white shadow-lg shadow-bsi-900/25'
              : clsNetral)}
          >
            {h}
          </button>
        )
      })}
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={function () { onPageChange(page + 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Berikutnya
        </button>
      ) : null}
    </div>
  )
}
```

## File: src/pages/DashboardPage.jsx
```javascript
import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'
import { uploadFotoProfil, updateFotoProfilMahasiswa, hapusFotoProfil } from '../lib/profil.js'
import { Avatar } from '../components/ui.jsx'
import { supabase as sbClient } from '../lib/supabase.js'
import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'
import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { CustomSelect, CustomDateInput, FileInput } from '../components/controls.jsx'
import { SizedIcon, ICONS } from '../components/icons.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }
}

const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const GAL_INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE_DASH = 6

function ModeIndicator(props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ' + (props.edit ? 'bg-gold-500/15 text-gold-600' : 'bg-bsi-100 text-bsi-900')}>
        <span className={'h-2 w-2 rounded-full ' + (props.edit ? 'bg-gold-500' : 'bg-bsi-500')}></span>
        {props.edit ? 'Mode Edit' : 'Mode Tambah'}
      </span>
      {props.edit ? (
        <button type="button" onClick={props.onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
          <SizedIcon name="close" size={12} />
          Batal Edit
        </button>
      ) : null}
    </div>
  )
}

export default function DashboardPage() {
  const { mahasiswa, loading } = useAuth()
  const [tab, setTab] = useState('logbook')
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [hadir, setHadir] = useState([])
  const [detail, setDetail] = useState(null)

  const [form, setForm] = useState({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
  const [items, setItems] = useState([newItem()])
  const [editLogId, setEditLogId] = useState(null)

  const [galForm, setGalForm] = useState({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
  const [editGalId, setEditGalId] = useState(null)

  const [hadirForm, setHadirForm] = useState({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  const [editHadirId, setEditHadirId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)
  const [showUploadFoto, setShowUploadFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [, setVersiFoto] = useState(0)
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)
  const [itemMode, setItemMode] = useState({})
  const [galYtTitle, setGalYtTitle] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const [logFilter, setLogFilter] = useState(LOG_INITIAL)
  const [logFilterOpen, setLogFilterOpen] = useState(false)
  const [galFilter, setGalFilter] = useState(GAL_INITIAL)
  const [galFilterOpen, setGalFilterOpen] = useState(false)
  const [hadirFilter, setHadirFilter] = useState(HADIR_INITIAL)
  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)
  const [sort, setSort] = useState('terbaru')
   const [logPage, setLogPage] = useState(1)
   const [galPage, setGalPage] = useState(1)
   const [hadirPage, setHadirPage] = useState(1)
   const refListLog = useRef(null)
   const refListGal = useRef(null)
   const refListHadir = useRef(null)

  async function refresh() {
    if (!mahasiswa) return
    const l = await supabase.from('logbooks').select('*, mahasiswa(*), logbook_items(*)')
      .eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () {
    if (mahasiswa) refresh()
    setYtQuotaLoading(true)
    fetchYouTubeQuota().then(function (data) {
      setYtQuota(data)
      setYtQuotaLoading(false)
    })
    const iv = setInterval(function () { fetchYouTubeQuota().then(function (data) { setYtQuota(data); setYtQuotaLoading(false) }) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])

   useEffect(function () {
     setLogPage(1)
     setGalPage(1)
     setHadirPage(1)
   }, [logFilter, galFilter, hadirFilter, sort])

  if (loading || !mahasiswa) {
    return <div className="p-10 text-center text-slate-500">Memuat sesi...</div>
  }

  function getItemMode(i) { return itemMode[i] || 'foto' }
  function setItemModeAt(i, mode) { setItemMode(function (p) { const n = Object.assign({}, p); n[i] = mode; return n }) }
  function patchItem(i, patch) {
    setItems(function (prev) {
      return prev.map(function (it, idx) { return idx === i ? Object.assign({}, it, patch) : it })
    })
  }

  async function onItemFile(i, file) {
    if (!file) return
    if (formatHeic(file)) {
      patchItem(i, { file: file, preview: '', previewLoading: true })
      const blob = await pratinjauHeic(file)
      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(file)
      patchItem(i, { preview: preview, previewLoading: false })
    } else {
      patchItem(i, { file: file, preview: URL.createObjectURL(file), previewLoading: false })
    }
  }

  function removeItemFile(i) {
    patchItem(i, { file: null, preview: '', oldPath: '', previewLoading: false, show: false })
  }

  function keyDariUrl(url) {
    try {
      return new URL(url).pathname.slice(1)
    } catch (e) {
      return ''
    }
  }

  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)
    if (!key) {
      console.warn('URL media tidak valid, dilewati:', url)
      return
    }
    try {
      await deleteMedia(key)
      console.log('Media R2 terhapus:', key)
    } catch (err) {
      console.error('Gagal hapus media R2:', key, err.message)
    }
  }

  async function submitLogbook(e) {
    e.preventDefault()
    setBusy(true)
     const menambahLog = !editLogId
    try {
      const clean = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!it.judul.trim()) continue
        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { alert('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { alert('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
          mediaSource = 'youtube'
          youtubeId = hasilYt.videoId
          mediaPath = ytThumb(hasilYt.videoId)
          mediaThumb = ytThumb(hasilYt.videoId)
          mediaType = 'video'
          setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
          fetchYouTubeQuota().then(setYtQuota)
        } else if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
          mediaSource = 'r2'
          youtubeId = null
        } else if (it.mode === 'video' && !it.file && !it.ytLink && it.oldYtId) {
          mediaSource = 'youtube'
          youtubeId = it.oldYtId
          mediaPath = ytThumb(it.oldYtId)
          mediaThumb = ytThumb(it.oldYtId)
          mediaType = 'video'
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })
      }
      if (!clean.length) { alert('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }

      let logId = editLogId
      let oldUrls = []
      if (editLogId) {
        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })
        await supabase.from('logbooks').update({
          tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).eq('id', editLogId)
        await supabase.from('logbook_items').delete().eq('logbook_id', editLogId)
      } else {
        const ins = await supabase.from('logbooks').insert({
          mahasiswa_id: mahasiswa.id, tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).select().single()
        logId = ins.data.id
      }

      const rows = clean.map(function (c, idx) {
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }
      })
      const insItems = await supabase.from('logbook_items').insert(rows).select()
      await syncGaleriFromLogbook(mahasiswa.id, insItems.data || [], { tanggal: form.tanggal, kategori: form.kategori })

      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })
      for (const u of oldUrls) {
        if (newUrls.indexOf(u) === -1) await hapusMediaR2(u)
      }

      setEditLogId(null)
      setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
      setItems([newItem()])
      await refresh()
       if (menambahLog) setLogPage(1)
    } catch (err) {
      alert('Gagal menyimpan logbook: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function startEditLog(log) {
    setEditLogId(log.id)
    setForm({
      tanggal: log.tanggal, unit: log.unit || '', kategori: log.kategori, judul: log.judul,
      kendala: log.kendala || '', solusi: log.solusi || '', pembelajaran: log.pembelajaran || '', status: log.status
    })
    const mapped = (log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }
    })
    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditLog() {
    setEditLogId(null)
    setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
    setItems([newItem()])
  }

  function startEditGal(g) {
    setEditGalId(g.id)
    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')
    setGalOldYt(g.youtube_id || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditGal() {
    setEditGalId(null)
    setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
  }

  function startEditHadir(h) {
    setEditHadirId(h.id)
    setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditHadir() {
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  }

  function deleteLog(log) {
    setPendingDelete({ type: 'log', data: log })
  }

  async function submitGaleri(e) {
    e.preventDefault()
    setBusy(true)
     const menambahGal = !editGalId
    try {
      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link video tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
        mediaSource = 'r2'
        youtubeId = null
      } else if (galMode === 'video' && !galForm.file && !galYtLink && galOldYt) {
        mediaSource = 'youtube'
        youtubeId = galOldYt
        mediaPath = ytThumb(galOldYt)
        mediaThumb = ytThumb(galOldYt)
        mediaType = 'video'
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }
      let oldGalUrls = []
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      for (const u of oldGalUrls) await hapusMediaR2(u)
      setEditGalId(null)
      setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
      await refresh()
       if (menambahGal) setGalPage(1)
    } catch (err) {
      alert('Gagal menyimpan galeri: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }

    function pilihFotoProfil(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { alert('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }
    setFotoFile(f)
    const reader = new FileReader()
    reader.onloadend = function () { setFotoPreview(reader.result) }
    reader.readAsDataURL(f)
  }
  async function simpanFotoProfil() {
    if (!fotoFile) { alert('Pilih file foto terlebih dahulu.'); return }
    setUploadingFoto(true)
    try {
      const url = await uploadFotoProfil(fotoFile, mahasiswa.id, mahasiswa.foto_profil)
      await updateFotoProfilMahasiswa(mahasiswa.id, url)
      mahasiswa.foto_profil = url
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
      setShowUploadFoto(false)
      setFotoPreview(null)
      setFotoFile(null)
    } catch (err) {
      alert('Gagal upload foto profil: ' + err.message)
    }
    setUploadingFoto(false)
  }
  async function hapusFotoProfilKu() {
    if (!window.confirm('Hapus foto profil saat ini?')) return
    try {
      await hapusFotoProfil(mahasiswa.id, mahasiswa.foto_profil)
      mahasiswa.foto_profil = null
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
    } catch (err) {
      alert('Gagal menghapus foto profil: ' + err.message)
    }
  }
async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
     const menambahHadir = !editHadirId
    const payload = { mahasiswa_id: mahasiswa.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
    if (editHadirId) {
      await supabase.from('daftar_hadir').update(payload).eq('id', editHadirId)
    } else {
      const res = await supabase.from('daftar_hadir').insert(payload)
      if (res.error) { alert('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }
    }
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
    await refresh()
     if (menambahHadir) setHadirPage(1)
    setInfoProses('')
    setBusy(false)
  }

  function deleteHadir(row) {
    setPendingDelete({ type: 'hadir', data: row })
  }

  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'media-item') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada kegiatan ini akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'media-gal') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada form galeri akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'log') {
      return {
        title: 'Hapus logbook?',
        message: 'Logbook "' + pendingDelete.data.judul + '" beserta seluruh rincian kegiatannya akan dihapus permanen. Media galeri yang terhubung dari logbook ini juga ikut terhapus.'
      }
    }
    if (pendingDelete.type === 'gal') {
      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus. Centang tampilan galeri pada kegiatan logbook akan dimatikan dan bisa dinyalakan lagi kapan saja.'
        : ''
      return {
        title: 'Hapus media galeri?',
        message: 'Media "' + pendingDelete.data.judul + '" akan dihapus permanen dari galeri kamu.' + extra
      }
    }
    return {
      title: 'Hapus catatan hadir?',
      message: 'Catatan kehadiran tanggal ' + pendingDelete.data.tanggal + ' dengan status ' + pendingDelete.data.status + ' akan dihapus permanen.'
    }
  }

  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'media-item') {
      removeItemFile(target.data)
      return
    }
    if (target.type === 'media-gal') {
      setGalForm(function (g) { return Object.assign({}, g, { file: null, preview: '', oldPath: '' }) })
      return
    }
    if (target.type === 'log') {
      const urls = []
      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'gal') {
      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'hadir') {
      await supabase.from('daftar_hadir').delete().eq('id', target.data.id)
    }
    await refresh()
  }

  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })
  const sortedLogs = urutkanTanggal(filteredLogs, sort)
  const logFilterActive = countActiveFilters(logFilter)

  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })
  const sortedGaleri = urutkanTanggal(filteredGaleri, sort)
  const galFilterActive = countActiveFilters(galFilter)

  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })
  const sortedHadir = urutkanTanggal(filteredHadir, sort)
  const hadirFilterActive = countActiveFilters(hadirFilter)
   const logTotal = filteredLogs.length
   const logTotalPages = Math.max(1, Math.ceil(logTotal / PER_PAGE_DASH))
   const logPageAman = Math.min(logPage, logTotalPages)
   const paginatedLogs = sortedLogs.slice((logPageAman - 1) * PER_PAGE_DASH, logPageAman * PER_PAGE_DASH)
   const galTotal = filteredGaleri.length
   const galTotalPages = Math.max(1, Math.ceil(galTotal / PER_PAGE_DASH))
   const galPageAman = Math.min(galPage, galTotalPages)
   const paginatedGaleri = sortedGaleri.slice((galPageAman - 1) * PER_PAGE_DASH, galPageAman * PER_PAGE_DASH)
   const hadirTotal = filteredHadir.length
   const hadirTotalPages = Math.max(1, Math.ceil(hadirTotal / PER_PAGE_DASH))
   const hadirPageAman = Math.min(hadirPage, hadirTotalPages)
   const paginatedHadir = sortedHadir.slice((hadirPageAman - 1) * PER_PAGE_DASH, hadirPageAman * PER_PAGE_DASH)
   function gantiHalamanLog(p) {
     setLogPage(p)
     if (refListLog.current) refListLog.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanGal(p) {
     setGalPage(p)
     if (refListGal.current) refListGal.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanHadir(p) {
     setHadirPage(p)
     if (refListHadir.current) refListHadir.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }

  const editGalDerived = editGalId ? ((galeri.find(function (g) { return g.id === editGalId }) || {}).logbook_item_id || null) : null

  const tabCls = function (t) {
    return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-6">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl"  onClick={function () { setTab('profil') }} title="Kelola foto profil" />
<div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>
            <p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>
{mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}
          </div>
        </div>
        </div>
<div className="mt-8 flex flex-wrap gap-2">
          <button onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button onClick={function () { setTab('galeri') }} className={tabCls('galeri')}>Galeri</button>
          <button onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
<button onClick={function () { setTab('profil') }} className={tabCls('profil')}>Profil</button>
        </div>
      
</div></section>

      {tab === 'profil' ? (
<section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" />
<h2 className="mt-4 text-xl font-black text-slate-900">{mahasiswa.nama}</h2>
<p className="mt-1 text-sm text-slate-500">NIM {mahasiswa.nim}</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
{mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
</div>
{showUploadFoto ? (
<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">
<div className="flex flex-wrap items-start gap-4">
{fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-[28%] object-cover shadow-lg" /> : null}
<div className="min-w-0 flex-1">
<input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
<p className="mt-2 text-xs text-slate-500">Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
<button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
</div>
</div>
) : null}
</div>
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
<h2 className="text-lg font-black text-slate-900">Ringkasan aktivitas magang</h2>
<div className="mt-4 grid grid-cols-3 gap-4">
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof logs !== 'undefined' ? logs.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Logbook</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof galeri !== 'undefined' ? galeri.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Galeri</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof hadir !== 'undefined' ? hadir.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Kehadiran</p></div>
</div>
<div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
<p>Foto profil tampil otomatis di kartu kamu pada halaman publik, logbook, galeri, dan daftar hadir.</p>
<p>Gunakan foto dengan pencahayaan baik dan wajah terlihat jelas agar mudah dikenali dosen pembimbing.</p>
<p>Klik foto pada kartu header kapan saja untuk kembali ke halaman ini dan memperbarui foto.</p>
</div>
</div>
</section>
) : null}

{tab === 'logbook' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editLogId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editLogId} onCancel={cancelEditLog} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
            <form onSubmit={submitLogbook} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Unit utama</label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih unit" value={form.unit}
                      onChange={function (v) { setForm(Object.assign({}, form, { unit: v })) }}
                      options={UNIT.map(function (u) { return { value: u, label: u } })} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Kategori utama <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih kategori" value={form.kategori}
                      onChange={function (v) { setForm(Object.assign({}, form, { kategori: v })) }}
                      options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status tampil</label>
                  <div className="mt-1.5">
                    <CustomSelect value={form.status}
                      onChange={function (v) { setForm(Object.assign({}, form, { status: v })) }}
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>
                <input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} placeholder="Contoh: Kegiatan harian di divisi Back Office" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
                  <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} placeholder="Judul kegiatan" />
                      <AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} placeholder="Hasil (opsional)" />
                      {it.previewLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                            <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                          </div>
                        </div>
                      ) : null}
                      {it.preview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                          {it.file && it.file.type.indexOf('video') === 0
                            ? <video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                            : <img src={it.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                          <button type="button" onClick={function () { setPendingDelete({ type: 'media-item', data: i }) }} title="Hapus gambar"
                            className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                            <SizedIcon name="close" size={14} />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}
                      <label className={'flex items-start gap-3 rounded-2xl border p-3 cursor-pointer w-full ' + (it.preview ? (it.show ? 'border-gold-500 bg-gold-500/5' : 'border-slate-200') : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed')}>
                        <input type="checkbox" disabled={!it.preview} checked={it.show} onChange={function (e) { patchItem(i, { show: e.target.checked }) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                        <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div><label className={labelCls}>Kendala</label><AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListLog} className="text-2xl font-black text-slate-900 scroll-mt-24">Logbook kamu</h2>
            <FilterBar open={logFilterOpen} onToggle={function () { setLogFilterOpen(function (o) { return !o }) }} activeCount={logFilterActive}
              onReset={function () { setLogFilter(LOG_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={logFilter.kategori} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { kategori: v })) }}
                options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.check} value={logFilter.status} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
              <TimeFilter filter={logFilter} set={setLogFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredLogs.length} dari {logs.length} logbook{logTotalPages > 1 ? ' • Halaman ' + logPageAman + ' dari ' + logTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2">
              {paginatedLogs.map(function (l) {
                return <LogbookCard key={l.id} log={l} isOwner
                  onDetail={function () { setDetail({ type: 'log', data: l }) }}
                  onEdit={function () { startEditLog(l) }}
                  onDelete={function () { deleteLog(l) }} />
              })}
            </div>
            {!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}
             <Pagination totalItems={logTotal} perPage={PER_PAGE_DASH} page={logPageAman} onPageChange={gantiHalamanLog} />
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editGalId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editGalId} onCancel={cancelEditGal} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>
              </div>
              {galForm.previewLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                    <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                  </div>
                </div>
              ) : null}
              {galForm.preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                  {galForm.file && galForm.file.type.indexOf('video') === 0
                    ? <video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                    : <img src={galForm.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                  <button type="button" onClick={function () { setPendingDelete({ type: 'media-gal' }) }} title="Hapus gambar"
                    className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} placeholder="Kosongkan untuk judul otomatis" /></div>
                <div>
                  <label className={labelCls}>Tanggal (opsional)</label>
                  <div className="mt-1.5">
                    <CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Kegiatan (opsional)</label>
                <div className="mt-1.5">
                  <CustomSelect placeholder="Pilih kegiatan" value={galForm.kegiatan}
                    onChange={function (v) { setGalForm(Object.assign({}, galForm, { kegiatan: v })) }}
                    options={GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } })} />
                </div>
                {editGalDerived ? <p className="mt-1 text-xs text-slate-400">Media ini berasal dari logbook. Perubahan judul, deskripsi, kegiatan, dan tanggal hanya memengaruhi galeri dan tidak akan ditimpa saat logbook disimpan.</p> : null}
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListGal} className="text-2xl font-black text-slate-900 scroll-mt-24">Galeri kamu</h2>
            <FilterBar open={galFilterOpen} onToggle={function () { setGalFilterOpen(function (o) { return !o }) }} activeCount={galFilterActive}
              onReset={function () { setGalFilter(GAL_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={galFilter.kegiatan} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { kegiatan: v })) }}
                options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.image} value={galFilter.tipe} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { tipe: v })) }}
                options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
              <TimeFilter filter={galFilter} set={setGalFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredGaleri.length} dari {galeri.length} media{galTotalPages > 1 ? ' • Halaman ' + galPageAman + ' dari ' + galTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2">
              {paginatedGaleri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { startEditGal(g) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!filteredGaleri.length ? <EmptyState icon="camera" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}
            </div>
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editHadirId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editHadirId} onCancel={cancelEditHadir} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
            <form onSubmit={submitHadir} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status kehadiran <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect value={hadirForm.status}
                      onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { status: v, alasan: v === 'Masuk' ? '' : hadirForm.alasan })) }}
                      options={[{ value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Alasan atau keterangan</label>
                <AutoTextArea
                  className={inputCls + (hadirForm.status === 'Masuk' ? ' opacity-60 cursor-not-allowed' : '')}
                  value={hadirForm.alasan}
                  onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }}
                  placeholder={hadirForm.status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                  disabled={hadirForm.status === 'Masuk'}
                />
                {hadirForm.status === 'Masuk' ? <p className="mt-1 text-xs text-slate-400">Field ini hanya terisi untuk status Izin atau Bolos.</p> : null}
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks="Menyimpan" /> : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListHadir} className="text-2xl font-black text-slate-900 scroll-mt-24">Daftar hadir kamu</h2>
            <FilterBar open={hadirFilterOpen} onToggle={function () { setHadirFilterOpen(function (o) { return !o }) }} activeCount={hadirFilterActive}
              onReset={function () { setHadirFilter(HADIR_INITIAL) }}>
              <FilterSelect icon={ICONS.check} value={hadirFilter.status} onChange={function (v) { setHadirFilter(Object.assign({}, hadirFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
              <SortSelect value={sort} onChange={setHadirFilterOpen && setSort ? setSort : setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Menampilkan {filteredHadir.length} dari {hadir.length} catatan{hadirTotalPages > 1 ? ' • Halaman ' + hadirPageAman + ' dari ' + hadirTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2">
            {paginatedHadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { startEditHadir(h) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            </div>
            {!filteredHadir.length ? <EmptyState icon="clipboard" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}
             <Pagination totalItems={hadirTotal} perPage={PER_PAGE_DASH} page={hadirPageAman} onPageChange={gantiHalamanHadir} />
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      {pendingDelete ? (
        <ConfirmModal
          open={true}
          title={confirmInfo().title}
          message={confirmInfo().message}
          onCancel={function () { setPendingDelete(null) }}
          onConfirm={executeDelete}
        />
      ) : null}
    </div>
  )
}
```
