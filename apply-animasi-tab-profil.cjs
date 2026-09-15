const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi pada tab Profil dashboard...')
console.log('')

/* ===== 1. DashboardPage: sisipkan kelas anim-tab ke section tab Profil ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
const mulaiProfil = d.indexOf("{tab === 'profil' ? (")
if (mulaiProfil === -1) {
  console.log('[TIDAK KETEMU] Blok tab Profil di DashboardPage')
} else {
  const idxSec = d.indexOf('<section className="', mulaiProfil)
  if (idxSec === -1) {
    console.log('[TIDAK KETEMU] Section di dalam blok tab Profil')
  } else {
    const idxCls = idxSec + '<section className="'.length
    const akhirCls = d.indexOf('"', idxCls)
    const cls = d.slice(idxCls, akhirCls)
    if (cls.includes('anim-tab')) {
      console.log('[SUDAH ADA] Kelas anim-tab pada section tab Profil')
    } else {
      d = d.slice(0, idxCls) + 'anim-tab ' + d.slice(idxCls)
      simpan(FILE_D, d)
      console.log('[BERHASIL] Kelas anim-tab disisipkan pada section tab Profil')
    }
  }
}

/* ===== 2. index.css: pastikan kelas anim-tab tersedia ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('.anim-tab {')) {
    console.log('[SUDAH ADA] CSS anim-tab di index.css')
  } else {
    css = css.trimEnd() + '\n.anim-tab { animation: appFadeUp 0.28s ease; }\n'
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] CSS anim-tab ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
d = baca(FILE_D)
const css2 = baca(FILE_CSS)
const cekProfil = (function () {
  const m = d.indexOf("{tab === 'profil' ? (")
  if (m === -1) return false
  const s = d.indexOf('<section className="', m)
  if (s === -1) return false
  const c = d.indexOf('"', s + '<section className="'.length)
  return d.slice(s + '<section className="'.length, c).includes('anim-tab')
})()
console.log('')
console.log('Verifikasi:')
console.log((cekProfil ? '[OK] ' : '[BELUM] ') + 'Section tab Profil memakai kelas anim-tab')
console.log((css2.includes('.anim-tab {') ? '[OK] ' : '[BELUM] ') + 'CSS anim-tab tersedia di index.css')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Membuka tab Profil kini memainkan animasi fade naik yang sama dengan tab Logbook, Galeri, dan Daftar Hadir.')
console.log('2. Karena section Profil dirender bersyarat, animasi terpicu otomatis setiap kali tab dibuka, termasuk saat kembali dari tab lain.')
console.log('3. Tidak ada struktur maupun isi tab Profil yang diubah, hanya satu kelas animasi yang disisipkan.')
console.log('4. Durasi dan kurva animasi memakai appFadeUp yang sudah ada, jadi seluruh tab terasa satu keluarga.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard lalu klik tab Profil: konten muncul dengan fade naik lembut, tidak lagi kedip instan.')
console.log('2. Bolak balik antara Profil dan Logbook: setiap perpindahan memainkan animasi yang konsisten.')
console.log('3. Pastikan isi tab Profil (foto profil, form upload, data akun) tetap tampil utuh seperti sebelumnya.')