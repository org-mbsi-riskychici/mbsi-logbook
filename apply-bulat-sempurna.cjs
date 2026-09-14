const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai mengunci semua foto profil menjadi lingkaran sempurna...')
console.log('')

/* ===== 1. ui.jsx: tulis ulang Avatar dengan pola wadah terkunci ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const mulai = u.indexOf('export function Avatar(props) {')
if (mulai === -1) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else {
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
    console.log('[GAGAL] Tidak dapat menemukan batas akhir fungsi Avatar')
  } else {
    const AVATAR_BARU = `export function Avatar(props) {
  const size = props.size || 'md'
  const kelas = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  if (props.src) {
    return (
      <span className={kelas + ' relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md'}>
        <img src={props.src} alt={nama || 'Foto profil'} className="absolute inset-0 h-full w-full rounded-full object-cover" />
      </span>
    )
  }
  return (
    <span className={kelas + ' ' + warna + ' relative inline-block shrink-0 overflow-hidden rounded-full border-2 border-white shadow-md'}>
      <span className="absolute inset-0 grid place-items-center font-black text-white">{inisial}</span>
    </span>
  )
}`
    u = u.slice(0, mulai) + AVATAR_BARU + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar ditulis ulang dengan wadah lingkaran terkunci')
  }
}

/* ===== 2. index.css: aturan global pemaksa lingkaran sempurna ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* bulat-sempurna-v1 */')) {
    console.log('[SUDAH ADA] Aturan CSS bulat-sempurna')
  } else {
    css = css.trimEnd() + '\n\n' + `/* bulat-sempurna-v1: paksa semua foto profil menjadi lingkaran sempurna */
.rounded-full {
  overflow: hidden;
}
.rounded-full:has(> img) {
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
}
.rounded-full > img {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  border-radius: 9999px !important;
}
img[alt="Foto profil"],
img.rounded-full {
  border-radius: 9999px !important;
  object-fit: cover !important;
  object-position: center !important;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pemaksa lingkaran sempurna ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja penguncian:')
console.log('1. Komponen Avatar kini memakai wadah span persegi tetap dengan overflow tersembunyi, sehingga foto apa pun dipotong melingkar penuh tanpa peduli rasio aslinya.')
console.log('2. Foto di dalam Avatar diposisikan absolut mengisi wadah, jadi tidak ada lagi sisi lurus atau sudut yang lolos.')
console.log('3. Aturan CSS global menangkap semua gambar di dalam wadah bulat di halaman mana pun, termasuk sisa img inline hasil script sebelumnya, dan memaksanya cover plus radius penuh.')
console.log('4. aspect-ratio 1 banding 1 menjamin wadah tetap persegi walau suatu halaman lupa memberi tinggi tetap, sehingga hasilnya lingkaran, bukan elips.')
console.log('')
console.log('Langkah uji:')
console.log('1. Header dashboard: avatar foto terlihat lingkaran penuh dengan ring putih rapi.')
console.log('2. Tab Profil: foto besar 2xl lingkaran sempurna tanpa sisi terpotong aneh.')
console.log('3. Beranda, Tim, Dospem: kartu mahasiswa menampilkan foto lingkaran penuh.')
console.log('4. Kartu logbook, galeri, dan baris daftar hadir: PersonChip menampilkan foto lingkaran kecil yang rapi.')
console.log('5. Mahasiswa tanpa foto tetap melihat lingkaran inisial berwarna tema dengan bentuk yang sama persis.')