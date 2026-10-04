#!/usr/bin/env node
/* patch-tanggal-valid-v1.cjs
   Pemakaian: node patch-tanggal-valid-v1.cjs   (jalankan dari root repo)
   Menerapkan otomatis fitur batas tanggal form (logbook, galeri, daftar hadir):
   - tidak bisa memilih tanggal masa depan (dinamis sesuai tanggal perangkat),
   - tidak bisa memilih tanggal sebelum hari pertama magang (8 September 2026),
   - pesan error ramah saat tanggal terlarang diketuk atau saat submit.
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

/* ========== 1. src/lib/constants.js ========== */
const KONSTANTA_TAMBAHAN = "\n/* Hari pertama masa magang BSI; form tidak menerima tanggal sebelum ini */\nexport const MULAI_MAGANG = '2026-09-08'\n"
let constants = baca('src/lib/constants.js')
if (constants != null && constants.indexOf('MULAI_MAGANG') !== -1) {
  catatan.push('LEWATI src/lib/constants.js (sudah ada MULAI_MAGANG)')
  constants = null
} else if (constants != null) {
  constants = constants.replace(/\s*$/, '') + KONSTANTA_TAMBAHAN
  catatan.push('UBAH  src/lib/constants.js (+ MULAI_MAGANG)')
}

/* ========== 2. src/lib/format.js ========== */
const FORMAT_FUNGSI = "\n/* Batas pilihan tanggal form: tidak sebelum hari pertama magang, tidak setelah hari ini.\n   Dinamis karena max diambil dari tanggal perangkat saat web dibuka. */\nexport function batasTanggalPilihan() {\n  return { min: MULAI_MAGANG, max: todayInput() }\n}\n/* Mengembalikan pesan error bila tanggal di luar batas, atau null bila valid.\n   Perbandingan string aman karena format tanggal ISO (YYYY-MM-DD). */\nexport function pesanTanggalTerlarang(value, min, max) {\n  if (!value) return null\n  if (max && value > max) {\n    return 'Tanggal ' + formatTanggal(value) + ' belum kamu lewati. Kamu hanya bisa memilih tanggal hari ini atau sebelumnya, karena logbook, galeri, dan daftar hadir mencatat kegiatan yang sudah benar-benar terjadi.'\n  }\n  if (min && value < min) {\n    return 'Tanggal ' + formatTanggal(value) + ' berada sebelum hari pertama masa magang (' + formatTanggal(min) + '). Silakan pilih tanggal pada rentang masa magang berlangsung, ya.'\n  }\n  return null\n}\n"
let format = baca('src/lib/format.js')
if (format != null && format.indexOf('batasTanggalPilihan') !== -1) {
  catatan.push('LEWATI src/lib/format.js (sudah ada batasTanggalPilihan)')
  format = null
} else if (format != null) {
  if (format.indexOf("./constants.js") === -1) {
    format = "import { MULAI_MAGANG } from './constants.js'\n" + format
  }
  format = ganti('src/lib/format.js', format, /(export function todayInput\(\)\s*\{[^}]*\})/, '$1' + FORMAT_FUNGSI, 'sisip fungsi setelah todayInput')
  catatan.push('UBAH  src/lib/format.js (+ batasTanggalPilihan, pesanTanggalTerlarang)')
}

/* ========== 3. src/components/controls.jsx ========== */
const PICKDAY_BARU = "  function pickDay(d) {\n    const ds = view.y + '-' + pad(view.m + 1) + '-' + pad(d)\n    const pesan = pesanTanggalTerlarang(ds, props.min, props.max)\n    if (pesan) {\n      if (props.onTerlarang) props.onTerlarang(pesan)\n      return\n    }\n    props.onChange(ds)\n    setOpen(false)\n  }"
const CELLS_BARU = "              {cells.map(function (d, i) {\n                if (d === null) return <span key={'kosong' + i} />\n                const isSel = sel && sel.y === view.y && sel.m === view.m && sel.d === d\n                const isToday = today.getFullYear() === view.y && today.getMonth() === view.m && today.getDate() === d\n                const terlarang = pesanTanggalTerlarang(view.y + '-' + pad(view.m + 1) + '-' + pad(d), props.min, props.max)\n                return (\n                  <button\n                    key={d}\n                    type=\"button\"\n                    onClick={function () { pickDay(d) }}\n                    title={terlarang || undefined}\n                    className={'mx-auto grid h-8 w-8 place-items-center rounded-lg text-sm ' + (terlarang ? 'opacity-35 cursor-not-allowed ' : '') + (isSel ? 'bg-bsi-800 font-semibold text-white' : isToday ? 'font-bold text-bsi-700 ring-1 ring-bsi-500' : 'text-slate-700 hover:bg-slate-100')}\n                  >\n                    {d}\n                  </button>\n                )\n              })}"
let controls = baca('src/components/controls.jsx')
if (controls != null && controls.indexOf('pesanTanggalTerlarang') !== -1) {
  catatan.push('LEWATI src/components/controls.jsx (sudah ada pesanTanggalTerlarang)')
  controls = null
} else if (controls != null) {
  controls = "import { pesanTanggalTerlarang } from '../lib/format.js'\n" + controls
  controls = ganti('src/components/controls.jsx', controls,
    /function pickDay\(d\)\s*\{\s*props\.onChange\(view\.y \+ '-' \+ pad\(view\.m \+ 1\) \+ '-' \+ pad\(d\)\)\s*setOpen\(false\)\s*\}/,
    PICKDAY_BARU, 'ganti pickDay')
  controls = ganti('src/components/controls.jsx', controls,
    /\{cells\.map\(function \(d, i\) \{[\s\S]*?\n\s*\}\)\}/,
    CELLS_BARU, 'ganti sel kalender')
  catatan.push('UBAH  src/components/controls.jsx (picker menolak tanggal terlarang)')
}

/* ========== 4. src/pages/DashboardPage.jsx ========== */
let dash = baca('src/pages/DashboardPage.jsx')
if (dash != null && dash.indexOf('batasTanggalPilihan') !== -1) {
  catatan.push('LEWATI src/pages/DashboardPage.jsx (sudah ada batasTanggalPilihan)')
  dash = null
} else if (dash != null) {
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    "import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'",
    "import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal, batasTanggalPilihan, pesanTanggalTerlarang } from '../lib/format.js'",
    'perluas import format')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(const toast = useToast\(\)\r?\n)/,
    '$1  const batas = batasTanggalPilihan()\n  function tolakTanggal(pesan) { toast.gagal(pesan) }\n',
    'sisip batas & tolakTanggal')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(async function submitLogbook\(e\)\s*\{\s*e\.preventDefault\(\))/,
    '$1\n    const pesanTgl = pesanTanggalTerlarang(form.tanggal, batas.min, batas.max)\n    if (pesanTgl) { toast.gagal(pesanTgl); return }',
    'guard submitLogbook')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(async function submitGaleri\(e\)\s*\{\s*e\.preventDefault\(\))/,
    '$1\n    const pesanTgl = pesanTanggalTerlarang(galForm.tanggal, batas.min, batas.max)\n    if (pesanTgl) { toast.gagal(pesanTgl); return }',
    'guard submitGaleri')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    /(async function submitHadir\(e\)\s*\{\s*e\.preventDefault\(\))/,
    '$1\n    const pesanTgl = pesanTanggalTerlarang(hadirForm.tanggal, batas.min, batas.max)\n    if (pesanTgl) { toast.gagal(pesanTgl); return }',
    'guard submitHadir')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    "<CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} />",
    "<CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} min={batas.min} max={batas.max} onTerlarang={tolakTanggal} />",
    'props tanggal logbook')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    "<CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} />",
    "<CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} min={batas.min} max={batas.max} onTerlarang={tolakTanggal} />",
    'props tanggal galeri')
  dash = ganti('src/pages/DashboardPage.jsx', dash,
    "<CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} />",
    "<CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} min={batas.min} max={batas.max} onTerlarang={tolakTanggal} />",
    'props tanggal hadir')
  catatan.push('UBAH  src/pages/DashboardPage.jsx (3 form + 3 guard submit)')
}

/* ========== Eksekusi ========== */
if (gagal.length) {
  console.error('PATCH DIBATALKAN (tidak ada file yang ditulis):')
  gagal.forEach(function (g) { console.error('  - ' + g) })
  process.exit(1)
}
if (constants != null) tulis('src/lib/constants.js', constants)
if (format != null) tulis('src/lib/format.js', format)
if (controls != null) tulis('src/components/controls.jsx', controls)
if (dash != null) tulis('src/pages/DashboardPage.jsx', dash)
console.log('Patch tanggal valid selesai:')
catatan.forEach(function (c) { console.log('  ' + c) })
console.log('Silakan jalankan npm run dev untuk verifikasi.')