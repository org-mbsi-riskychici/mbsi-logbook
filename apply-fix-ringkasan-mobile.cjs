const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menyesuaikan Ringkasan aktivitas magang agar sama dengan pola Rekap Kehadiran...')
console.log('')

/* ===== 1. DashboardPage.jsx: Ubah struktur HTML dan urutan teks ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

// Ubah grid gap dari gap-4 menjadi gap-2 agar lebih rapat seperti rekap kehadiran
if (d.includes('stats-profil-grid mt-4 grid grid-cols-3 gap-4')) {
  d = d.replace('stats-profil-grid mt-4 grid grid-cols-3 gap-4', 'stats-profil-grid mt-4 grid grid-cols-3 gap-2')
  berubahD = true
}

// Ubah isi kotak ringkasan menjadi urutan label (kecil) di atas dan angka di bawah
const polaLogbook = /<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">\{typeof logs !== 'undefined' \? logs\.length : 0\}<\/p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Logbook<\/p><\/div>/
const baruLogbook = '<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Logbook</p><p className="text-base font-black text-bsi-800">{typeof logs !== \'undefined\' ? logs.length : 0}</p></div>'

const polaGaleri = /<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">\{typeof galeri !== 'undefined' \? galeri\.length : 0\}<\/p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Galeri<\/p><\/div>/
const baruGaleri = '<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Media</p><p className="text-base font-black text-bsi-800">{typeof galeri !== \'undefined\' ? galeri.length : 0}</p></div>'

const polaHadir = /<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">\{typeof hadir !== 'undefined' \? hadir\.length : 0\}<\/p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Kehadiran<\/p><\/div>/
const baruHadir = '<div className="rounded-xl bg-slate-50 p-2 text-center"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Kehadiran</p><p className="text-base font-black text-bsi-800">{typeof hadir !== \'undefined\' ? hadir.length : 0}</p></div>'

if (polaLogbook.test(d)) { d = d.replace(polaLogbook, baruLogbook); berubahD = true }
if (polaGaleri.test(d)) { d = d.replace(polaGaleri, baruGaleri); berubahD = true }
if (polaHadir.test(d)) { d = d.replace(polaHadir, baruHadir); berubahD = true }

if (berubahD) {
  simpan(FILE_D, d)
  console.log('[BERHASIL] DashboardPage.jsx telah diperbarui dengan layout baru.')
}

/* ===== 2. index.css: Hapus override grid 2 kolom di mobile ===== */
const FILE_CSS = 'src/index.css'
if (ada(FILE_CSS)) {
  let css = baca(FILE_CSS)
  let berubahC = false
  
  const cssLama1 = '.stats-profil-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 0.5rem !important; }'
  const cssLama2 = '.stats-profil-grid > div:last-child { grid-column: span 2 / span 2; }'
  
  if (css.includes(cssLama1)) {
    css = css.replace(cssLama1, '.stats-profil-grid { grid-template-columns: repeat(3, minmax(0, 1fr)) !important; gap: 0.5rem !important; }')
    berubahC = true
  }
  if (css.includes(cssLama2)) {
    css = css.replace(cssLama2, '/* dihapus agar kolom ketiga tidak memanjang sendiri */')
    berubahC = true
  }
  
  if (berubahC) {
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] index.css diperbarui, grid dipaksa menjadi 3 kolom konsisten di mobile.')
  }
}

console.log('')
console.log('Selesai. Silakan refresh browser.')