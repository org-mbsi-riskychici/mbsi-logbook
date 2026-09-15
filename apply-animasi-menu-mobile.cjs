const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang animasi smooth untuk menu navigasi mobile dan tablet...')
console.log('')

/* ===== 1. Layout.jsx: komponen MenuMobile dengan mount bertahan saat animasi keluar ===== */
const FILE_L = 'src/components/Layout.jsx'
if (!ada(FILE_L)) {
  console.log('[GAGAL] Layout.jsx tidak ditemukan')
  process.exit(1)
}
let l = baca(FILE_L)
let berubahL = false

if (l.includes("import { useEffect, useState } from 'react'")) {
  console.log('[SUDAH ADA] Impor useEffect di Layout.jsx')
} else if (l.includes("import { useState } from 'react'")) {
  l = l.replace("import { useState } from 'react'", "import { useEffect, useState } from 'react'")
  berubahL = true
  console.log('[BERHASIL] Impor useEffect ditambahkan di Layout.jsx')
} else {
  console.log('[TIDAK KETEMU] Impor useState di Layout.jsx')
}

const KOMPONEN = `function MenuMobile(props) {
  const [tampil, setTampil] = useState(props.open)
  const tutup = tampil && !props.open
  useEffect(function () {
    if (props.open) { setTampil(true); return undefined }
    if (!tampil) return undefined
    const t = setTimeout(function () { setTampil(false) }, 240)
    return function () { clearTimeout(t) }
  }, [props.open, tampil])
  if (!tampil) return null
  return (
    <div className={'menu-mobile xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2' + (tutup ? ' menu-mobile-tutup' : '')}>
      {props.children}
    </div>
  )
}
`

if (l.includes('function MenuMobile(')) {
  console.log('[SUDAH ADA] Komponen MenuMobile di Layout.jsx')
} else if (l.includes('export default function Layout() {')) {
  l = l.replace('export default function Layout() {', KOMPONEN + 'export default function Layout() {')
  berubahL = true
  console.log('[BERHASIL] Komponen MenuMobile ditambahkan di Layout.jsx')
} else {
  console.log('[TIDAK KETEMU] Anchor export default function Layout')
}

const BUKA_LAMA = "        {open ? (\n          <div className=\"xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2\">"
const BUKA_BARU = "        <MenuMobile open={open}>"
if (l.includes('<MenuMobile open={open}>')) {
  console.log('[SUDAH ADA] Pembuka menu memakai MenuMobile')
} else if (l.includes(BUKA_LAMA)) {
  l = l.replace(BUKA_LAMA, BUKA_BARU)
  berubahL = true
  console.log('[BERHASIL] Pembuka menu mobile diganti menjadi MenuMobile')
} else {
  console.log('[TIDAK KETEMU] Pola pembuka menu mobile di Layout.jsx')
}

const TUTUP_LAMA = "          </div>\n        ) : null}\n      </header>"
const TUTUP_BARU = "        </MenuMobile>\n      </header>"
if (l.includes('</MenuMobile>')) {
  console.log('[SUDAH ADA] Penutup menu memakai MenuMobile')
} else if (l.includes(TUTUP_LAMA)) {
  l = l.replace(TUTUP_LAMA, TUTUP_BARU)
  berubahL = true
  console.log('[BERHASIL] Penutup menu mobile diganti menjadi MenuMobile')
} else {
  console.log('[TIDAK KETEMU] Pola penutup menu mobile di Layout.jsx')
}

if (berubahL) simpan(FILE_L, l)

/* ===== 2. index.css: keyframes animasi masuk dan keluar menu ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* menu-mobile-v1: animasi buka tutup menu navigasi mobile dan tablet, tinggi ikut mengembang dan merapat */
@keyframes menuMobileIn {
  from { opacity: 0; transform: translateY(-12px); max-height: 0; }
  to { opacity: 1; transform: translateY(0); max-height: 30rem; }
}
@keyframes menuMobileOut {
  from { opacity: 1; transform: translateY(0); max-height: 30rem; }
  to { opacity: 0; transform: translateY(-12px); max-height: 0; }
}
.menu-mobile {
  overflow: hidden;
  animation: menuMobileIn 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-mobile-tutup {
  pointer-events: none;
  animation: menuMobileOut 0.24s ease-in forwards;
}
@keyframes menuMobileItem {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.menu-mobile > * { animation: menuMobileItem 0.3s cubic-bezier(0.22, 1, 0.36, 1) backwards; }
.menu-mobile > *:nth-child(1) { animation-delay: 0.04s; }
.menu-mobile > *:nth-child(2) { animation-delay: 0.08s; }
.menu-mobile > *:nth-child(3) { animation-delay: 0.12s; }
.menu-mobile > *:nth-child(4) { animation-delay: 0.16s; }
.menu-mobile > *:nth-child(5) { animation-delay: 0.2s; }
.menu-mobile > *:nth-child(6) { animation-delay: 0.24s; }
.menu-mobile > *:nth-child(7) { animation-delay: 0.28s; }
.menu-mobile-tutup > * { animation: none; }
`
if (!ada(FILE_CSS)) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('menu-mobile-v1')) {
    console.log('[SUDAH ADA] CSS animasi menu mobile di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS animasi menu mobile ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const l2 = baca(FILE_L)
const css2 = ada(FILE_CSS) ? baca(FILE_CSS) : ''
console.log((l2.includes("import { useEffect, useState } from 'react'") ? '[OK] ' : '[BELUM] ') + 'Impor useEffect tersedia di Layout.jsx')
console.log((l2.includes('function MenuMobile(') ? '[OK] ' : '[BELUM] ') + 'Komponen MenuMobile tersedia')
console.log((l2.includes('<MenuMobile open={open}>') ? '[OK] ' : '[BELUM] ') + 'Menu mobile dibungkus MenuMobile')
console.log((l2.includes('</MenuMobile>') ? '[OK] ' : '[BELUM] ') + 'Penutup MenuMobile terpasang')
console.log((css2.includes('menu-mobile-v1') ? '[OK] ' : '[BELUM] ') + 'Keyframes animasi menu tersedia di index.css')
console.log((css2.includes('.menu-mobile-tutup') ? '[OK] ' : '[BELUM] ') + 'Kelas animasi keluar tersedia')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja animasi baru:')
console.log('1. Saat tombol Menu diketuk, wadah menu mengembang dari tinggi nol sambil memudar masuk dan bergeser turun lembut, sehingga tidak lagi muncul sekonyongkonyong.')
console.log('2. Tiap tautan di dalamnya muncul berurutan dengan jeda 40 milidetik, memberi efek mengalir dari atas ke bawah seperti menu aplikasi modern.')
console.log('3. Saat menu ditutup, tinggi wadah merapat kembali ke nol sambil memudar keluar, jadi konten halaman di bawah header tidak melompat tiba tiba.')
console.log('4. Elemen menu sengaja dibiarkan terpasang 240 milidetik selama animasi keluar lewat komponen MenuMobile, pola yang sama dengan Modal dan panel dropdown yang sudah ada.')
console.log('5. Selama animasi keluar, pointer events dimatikan supaya tautan tidak sengaja terklik saat menu sedang menghilang.')
console.log('6. Pengguna dengan preferensi reduce motion tetap mendapat perilaku instan karena aturan global proyek sudah memotong durasi semua animasi.')
console.log('7. Mode gelap tidak terpengaruh karena warna latar dan garis pemisah menu tetap memakai kelas bawaan yang sudah punya pengganti gelap.')
console.log('')
console.log('Langkah uji:')
console.log('1. Persempit jendela browser di bawah 1280 piksel atau buka di ponsel sehingga tombol Menu terlihat.')
console.log('2. Ketuk tombol Menu: panel navigasi mengembang mulus dengan tautan muncul berurutan.')
console.log('3. Ketuk tombol Menu lagi: panel merapat ke atas sambil memudar, lalu hilang tanpa membuat halaman melompat.')
console.log('4. Buka tutup berulang dengan cepat: animasi tidak menumpuk karena state tampil dikendalikan satu timer.')
console.log('5. Uji dalam mode gelap: warna menu menyesuaikan dan animasinya tetap sama halusnya.')