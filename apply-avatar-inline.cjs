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