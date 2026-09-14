const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki foto profil di halaman publik dan warning key...')
console.log('')

/* ===== 1. Perbaiki query select mahasiswa agar menyertakan foto_profil ===== */
const pages = [
  'src/pages/HomePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/TimPage.jsx'
]

pages.forEach(rel => {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return
  let code = baca(rel)
  let changed = false
  
  // Cari pola .select('...') yang memuat mahasiswa(...)
  code = code.replace(/\.select\((['"`])([^'"`]+)\1\)/g, (match, quote, content) => {
    if (content.includes('mahasiswa') && !content.includes('foto_profil') && !content.includes('mahasiswa(*)')) {
      changed = true
      // Ganti mahasiswa(id, nama, dll) menjadi mahasiswa(*) agar semua kolom termasuk foto_profil ikut diambil
      let newContent = content.replace(/mahasiswa\([^)]*\)/, 'mahasiswa(*)')
      return `.select(${quote}${newContent}${quote})`
    }
    return match
  })
  
  if (changed) {
    simpan(rel, code)
    console.log('[BERHASIL] Query mahasiswa diperbarui di ' + rel)
  }
})

/* ===== 2. Tulis ulang PersonChip dan PersonCard di cards.jsx ===== */
const cardsPath = path.join(root, 'src/components/cards.jsx')
if (fs.existsSync(cardsPath)) {
  let cards = baca('src/components/cards.jsx')
  
  if (!cards.includes("import { Avatar } from './ui.jsx'") && !cards.includes('import { Avatar } from')) {
    cards = "import { Avatar } from './ui.jsx'\n" + cards
  }

  // Timpa PersonChip lama dengan versi yang pasti memanggil Avatar
  cards = cards.replace(/export function PersonChip[\s\S]*?\n\}/, `export function PersonChip(props) {
  const m = props.mahasiswa || props.person || props.m || props.p
  if (!m) return null
  return (
    <div className="flex items-center gap-2">
      <Avatar src={m.foto_profil || null} nama={m.nama} size={props.size || 'md'} />
      <div className="min-w-0">
        <p className="truncate font-bold text-slate-900">{m.nama}</p>
        <p className="truncate text-xs text-slate-500">{m.nim || ''} {m.prodi ? '• ' + m.prodi : ''}</p>
      </div>
    </div>
  )
}`)

  // Timpa PersonCard lama dengan versi yang pasti memanggil Avatar
  cards = cards.replace(/export function PersonCard[\s\S]*?\n\}/, `export function PersonCard(props) {
  const m = props.mahasiswa || props.person || props.m || props.p
  if (!m) return null
  return (
    <div className="card-hover flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <Avatar src={m.foto_profil || null} nama={m.nama} size="xl" />
      <div>
        <p className="font-bold text-slate-900">{m.nama}</p>
        <p className="text-xs text-slate-500">{m.nim || ''}</p>
        {m.prodi ? <p className="text-xs text-slate-500">{m.prodi}</p> : null}
      </div>
    </div>
  )
}`)

  simpan('src/components/cards.jsx', cards)
  console.log('[BERHASIL] PersonChip dan PersonCard ditulis ulang menggunakan Avatar')
}

/* ===== 3. Perbaiki warning "unique key prop" di AttendancePage.jsx ===== */
const attPath = path.join(root, 'src/pages/AttendancePage.jsx')
if (fs.existsSync(attPath)) {
  let att = baca('src/pages/AttendancePage.jsx')
  let changedAtt = false
  
  // Pola 1: .map(function (x, i) { return <Element ...
  att = att.replace(/\.map\(function\s*\(([^,)]+)(?:,\s*([^)]+))?\)\s*\{\s*return\s*(<[A-Za-z][\s\S]*?)(\s*\/?>)/g, (match, p1, p2, tag, close) => {
    if (tag.includes('key=')) return match
    changedAtt = true
    const indexVar = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([A-Za-z0-9_]+)/, `<$1 key={${indexVar}}`)
    const params = p2 ? `${p1}, ${p2}` : `${p1}, ${indexVar}`
    return `.map(function (${params}) { return ${newTag}${close}`
  })

  // Pola 2: .map((x, i) => <Element ...
  att = att.replace(/\.map\(\(([^,)]+)(?:,\s*([^)]+))?\)\s*=>\s*(<[A-Za-z][\s\S]*?)(\s*\/?>)/g, (match, p1, p2, tag, close) => {
    if (tag.includes('key=')) return match
    changedAtt = true
    const indexVar = p2 ? p2.trim() : 'i'
    const newTag = tag.replace(/<([A-Za-z0-9_]+)/, `<$1 key={${indexVar}}`)
    const params = p2 ? `${p1}, ${p2}` : `${p1}, ${indexVar}`
    return `.map((${params}) => ${newTag}${close}`
  })
  
  if (changedAtt) {
    simpan('src/pages/AttendancePage.jsx', att)
    console.log('[BERHASIL] Warning key prop diperbaiki di AttendancePage.jsx')
  } else {
    console.log('[INFO] Tidak ada .map tanpa key yang terdeteksi di AttendancePage.jsx (mungkin sudah benar atau polanya berbeda)')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Query database di halaman publik kini mengambil seluruh kolom mahasiswa (termasuk foto_profil).')
console.log('2. PersonChip dan PersonCard ditulis ulang secara eksplisit memanggil komponen Avatar, sehingga tidak bergantung pada tebakan nama variabel.')
console.log('3. Script secara otomatis menyuntikkan atribut key pada elemen yang di-render di dalam .map() di AttendancePage.jsx untuk menghilangkan warning React.')