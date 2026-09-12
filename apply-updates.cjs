const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(file) {
  return fs.readFileSync(path.join(root, file), 'utf8')
}

function simpan(file, isi) {
  fs.writeFileSync(path.join(root, file), isi, 'utf8')
}

function ada(file) {
  return fs.existsSync(path.join(root, file))
}

function ganti(file, cari, gantiDengan, label, semua) {
  if (!ada(file)) {
    console.log('[LEWATI] File tidak ditemukan: ' + file)
    return
  }
  let isi = baca(file)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + file)
    return
  }
  isi = semua ? isi.split(cari).join(gantiDengan) : isi.replace(cari, gantiDengan)
  simpan(file, isi)
  console.log('[BERHASIL] ' + label)
}

function tambahkan(file, penanda, blok, label) {
  if (!ada(file)) {
    console.log('[LEWATI] File tidak ditemukan: ' + file)
    return
  }
  let isi = baca(file)
  if (isi.includes(penanda)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  isi = isi + '\n' + blok
  simpan(file, isi)
  console.log('[BERHASIL] ' + label)
}

if (!ada('src/index.css')) {
  console.log('Script harus dijalankan di root project (folder yang berisi folder src).')
  console.log('Contoh: cd path/ke/project/mbsi-logbook lalu node apply-updates.js')
  process.exit(1)
}

console.log('Mulai menerapkan pembaruan otomatis...')
console.log('')

/* ===== 1. CSS: textarea tanpa resize + scrollbar bertema ===== */
const CSS_BLOK = `
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
`
tambahkan('src/index.css', '::-webkit-scrollbar', CSS_BLOK, 'CSS scrollbar tipis dan textarea tanpa resize di index.css')

/* ===== 2. ui.jsx: import hook + komponen AutoTextArea ===== */
ganti(
  'src/components/ui.jsx',
  "import { SizedIcon } from './icons.jsx'",
  "import { useEffect, useRef } from 'react'\nimport { SizedIcon } from './icons.jsx'",
  'Import hook React di ui.jsx'
)

const AUTOTEXTAREA = `
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
    />
  )
}
`
tambahkan('src/components/ui.jsx', 'export function AutoTextArea', AUTOTEXTAREA, 'Komponen AutoTextArea di ui.jsx')

/* ===== 3. DashboardPage.jsx ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  "import { StatCard, EmptyState, Modal, inputCls, labelCls, btnPrimary, btnSmall } from '../components/ui.jsx'",
  "import { StatCard, EmptyState, Modal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'",
  'Import AutoTextArea di DashboardPage'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="2" className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />',
  '<AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />',
  'Textarea deskripsi kegiatan menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="3" className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" />',
  '<AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" />',
  'Textarea kendala menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="3" className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" />',
  '<AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" />',
  'Textarea solusi menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="3" className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" />',
  '<AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" />',
  'Textarea pembelajaran menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="4" className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." />',
  '<AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." />',
  'Textarea deskripsi galeri menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<textarea rows="4" className={inputCls} value={hadirForm.alasan} onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }} placeholder="Contoh: Keperluan keluarga, sakit." />',
  '<AutoTextArea className={inputCls} value={hadirForm.alasan} onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }} placeholder="Contoh: Keperluan keluarga, sakit." />',
  'Textarea alasan daftar hadir menjadi AutoTextArea'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<label className={labelCls}>Tanggal</label>',
  '<label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label Tanggal',
  true
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<label className={labelCls}>Kategori utama</label>',
  '<label className={labelCls}>Kategori utama <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label Kategori utama'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<label className={labelCls}>Ringkasan hari ini</label>',
  '<label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label Ringkasan hari ini'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini</p>',
  '<p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>',
  'Penanda wajib pada judul Rincian kegiatan'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<label className={labelCls}>Pilih foto atau video</label>',
  '<label className={labelCls}>Pilih foto atau video {editGalId ? null : <span className="text-red-500">*</span>}</label>',
  'Penanda wajib kondisional pada label upload media galeri'
)

ganti(
  'src/pages/DashboardPage.jsx',
  '<label className={labelCls}>Status kehadiran</label>',
  '<label className={labelCls}>Status kehadiran <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label Status kehadiran'
)

/* ===== 4. LoginPage.jsx ===== */
ganti(
  'src/pages/LoginPage.jsx',
  '<label className={labelCls}>NIM</label>',
  '<label className={labelCls}>NIM <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label NIM'
)

ganti(
  'src/pages/LoginPage.jsx',
  '<label className={labelCls}>Kode akses</label>',
  '<label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>',
  'Penanda wajib pada label Kode akses'
)

console.log('')
console.log('Selesai. Silakan cek browser, Vite akan memuat ulang otomatis.')
console.log('Jika ada baris bertanda [TIDAK KETEMU], berarti format kode di file tersebut')
console.log('sedikit berbeda dari panduan. Kabari aku supaya bisa disesuaikan.')