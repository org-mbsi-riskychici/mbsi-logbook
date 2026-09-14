const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengubah seluruh foto profil menjadi kotak bersudut melengkung halus...')
console.log('')

/* ===== 1. ui.jsx: Avatar menjadi kotak melengkung proporsional ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const m = u.match(/export\s+function\s+Avatar\s*\(/) || u.match(/function\s+Avatar\s*\(/)
if (!m) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else {
  const mulai = m.index
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = mulai; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Avatar tidak terbaca')
  } else {
    const pakaiExport = u.slice(mulai, mulai + 20).includes('export')
    const AVATAR_KOTAK = (pakaiExport ? 'export ' : '') + `function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const radius = Math.round(px * 0.28) + 'px'
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
    borderRadius: radius,
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
    borderRadius: radius
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
    u = u.slice(0, mulai) + AVATAR_KOTAK + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar kini kotak bersudut melengkung proporsional')
  }
}

/* ===== 2. Foto inline sisa script lama dan pratinjau form ===== */
const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx'
]
TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const sebelum = isi

  /* a. img foto profil: rounded-full menjadi rounded 28 persen */
  isi = isi.replace(/(<img\b[^>]*?alt="(?:Foto profil|Pratinjau foto profil)"[^>]*?)rounded-full object-cover/g, '$1rounded-[28%] object-cover')

  /* b. wadah div di belakang foto inline ikut melengkung kotak */
  isi = isi.replace(/<div\b[^>]*?rounded-full[^>]*?(?=>\s*\{typeof (?:p|m) !== 'undefined')/g, function (tag) {
    return tag.replace('rounded-full', 'rounded-[28%] overflow-hidden')
  })

  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Foto profil inline diperbarui di ' + rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Bentuk baru yang berlaku seragam:')
console.log('1. Setiap foto profil menjadi kotak dengan sudut melengkung halus sebesar 28 persen dari ukurannya, mirip ikon aplikasi modern.')
console.log('2. Lengkungan bersifat proporsional: avatar kecil di PersonChip melengkung ringkas, avatar besar di tab Profil melengkung lebih lembut, sehingga serasi di semua ukuran.')
console.log('3. Cincin hijau BSI mengikuti bentuk kotak melengkung yang sama, jadi bingkai dan foto selalu sejajar.')
console.log('4. Fallback inisial memakai wadah dan lengkungan identik, sehingga transisi foto ke inisial tidak mengubah bentuk.')
console.log('5. Pratinjau di form upload dan seluruh foto inline di kartu logbook, galeri, daftar hadir, tim, dan dospem mengikuti bentuk yang sama.')
console.log('')
console.log('Langkah uji:')
console.log('1. Header dashboard dan tab Profil menampilkan kotak melengkung halus bercincin hijau.')
console.log('2. Kartu beranda, tim, dospem, serta PersonChip di logbook, galeri, dan daftar hadir seragam kotak melengkung.')
console.log('3. Form upload menampilkan pratinjau dengan bentuk yang sama persis.')
console.log('4. Mahasiswa tanpa foto melihat inisial pada kotak melengkung berwarna tema.')