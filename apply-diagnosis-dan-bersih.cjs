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