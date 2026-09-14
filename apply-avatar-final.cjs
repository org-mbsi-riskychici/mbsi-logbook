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