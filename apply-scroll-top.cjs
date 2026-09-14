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