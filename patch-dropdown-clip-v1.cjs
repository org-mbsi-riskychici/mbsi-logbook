#!/usr/bin/env node
/* patch-dropdown-clip-v1.cjs
   Pemakaian: node patch-dropdown-clip-v1.cjs   (jalankan dari root repo)
   Memperbaiki sisa bug dropdown/picker di panel filter:
   - panel kalender (w-72) terpotong overflow-x: clip .filter-isi saat tombol
     berada dekat tepi kanan -> panel kini dibuka merapat ke kanan bila ruang
     di kanan tidak cukup (diukur terhadap .filter-isi atau viewport),
   - memastikan root FilterBar punya relative z-40 supaya dropdown tidak
     tertutup kartu (bagian ini dilewati bila sudah ada).
   Idempoten: bagian yang sudah terpasang akan dilewati. */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const gagal = []
const catatan = []

function baca(rel) {
  const p = path.join(ROOT, rel)
  if (!fs.existsSync(p)) { gagal.push(rel + ' : file tidak ditemukan'); return null }
  return fs.readFileSync(p, 'utf8')
}
function ganti(rel, src, pola, pengganti, label) {
  if (src == null) return src
  const hasil = src.replace(pola, pengganti)
  if (hasil === src) gagal.push(rel + ' : pola tidak ditemukan -> ' + label)
  return hasil
}
function tulis(rel, isi) {
  fs.writeFileSync(path.join(ROOT, rel), isi, 'utf8')
}

/* ========== 1. src/components/controls.jsx ========== */
let controls = baca('src/components/controls.jsx')
if (controls != null && controls.indexOf('alignRight') !== -1) {
  catatan.push('LEWATI src/components/controls.jsx (sudah ada alignRight)')
  controls = null
} else if (controls != null) {
  /* state penanda panel dibuka merapat ke kanan */
  controls = ganti('src/components/controls.jsx', controls,
    /(\s*)const \[view, setView\] = useState\(function \(\) \{/,
    '$1const [alignRight, setAlignRight] = useState(false)\n$1const [view, setView] = useState(function () {',
    'sisip state alignRight')
  /* ukur ruang saat dropdown dibuka */
  controls = ganti('src/components/controls.jsx', controls,
    /function toggle\(\)\s*\{\s*if \(!open\)\s*\{\s*const p = parseValue\(props\.value, mode\)\s*if \(p\) setView\(\{ y: p\.y, m: p\.m \}\)\s*\}/,
    "function toggle() {\n    if (!open) {\n      const p = parseValue(props.value, mode)\n      if (p) setView({ y: p.y, m: p.m })\n      if (boxRef.current) {\n        const r = boxRef.current.getBoundingClientRect()\n        const wadah = boxRef.current.closest('.filter-isi')\n        const batasKanan = wadah ? wadah.getBoundingClientRect().right : window.innerWidth - 8\n        setAlignRight(r.left + 296 > batasKanan)\n      }\n    }\n    setOpen(function (o) { return !o })\n  }",
    'ganti toggle dengan pengukuran ruang')
  /* panel kalender mengikuti hasil pengukuran */
  controls = ganti('src/components/controls.jsx', controls,
    '<div className="anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">',
    "<div className={'anim-modal absolute z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ' + (alignRight ? 'right-0' : '')}>",
    'kelas panel kalender responsif ruang')
  catatan.push('UBAH  src/components/controls.jsx (picker membuka merapat kanan bila ruang sempit)')
}

/* ========== 2. src/components/FilterBar.jsx ========== */
let filter = baca('src/components/FilterBar.jsx')
if (filter != null && filter.indexOf('relative z-40') !== -1) {
  catatan.push('LEWATI src/components/FilterBar.jsx (sudah ada relative z-40)')
  filter = null
} else if (filter != null) {
  filter = ganti('src/components/FilterBar.jsx', filter,
    '<div className="bsi-panel rounded-3xl p-4 lg:p-5">',
    '<div className="bsi-panel relative z-40 rounded-3xl p-4 lg:p-5">',
    'angkat stacking context panel filter')
  catatan.push('UBAH  src/components/FilterBar.jsx (relative z-40 agar dropdown di atas kartu)')
}

/* ========== Eksekusi ========== */
if (gagal.length) {
  console.error('PATCH DIBATALKAN (tidak ada file yang ditulis):')
  gagal.forEach(function (g) { console.error('  - ' + g) })
  process.exit(1)
}
if (controls != null) tulis('src/components/controls.jsx', controls)
if (filter != null) tulis('src/components/FilterBar.jsx', filter)
console.log('Patch dropdown clip selesai:')
catatan.forEach(function (c) { console.log('  ' + c) })
console.log('Silakan jalankan npm run dev untuk verifikasi.')