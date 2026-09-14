const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang Avatar gaya lencana bulat sempurna...')
console.log('')

/* ===== 1. ui.jsx: tulis ulang fungsi Avatar ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const mulai = u.indexOf('export function Avatar(props) {')
if (mulai === -1) {
  console.log('[TIDAK KETEMU] Fungsi Avatar di ui.jsx')
} else if (u.includes('avatar-bulat ')) {
  console.log('[SUDAH ADA] Avatar gaya lencana')
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
    console.log('[GAGAL] Batas akhir fungsi Avatar tidak ditemukan')
  } else {
    const AVATAR_BARU = `export function Avatar(props) {
  const size = props.size || 'md'
  const kotak = size === 'sm' ? 'h-9 w-9 text-xs' : size === 'lg' ? 'h-14 w-14 text-base' : size === 'xl' ? 'h-24 w-24 text-2xl' : size === '2xl' ? 'h-40 w-40 text-4xl' : 'h-11 w-11 text-sm'
  const nama = props.nama || ''
  const inisial = nama ? nama.trim().split(/\\s+/).map(function (w) { return w[0] }).join('').slice(0, 2).toUpperCase() : '?'
  const palet = ['bg-bsi-700', 'bg-bsi-600', 'bg-gold-600', 'bg-gold-500', 'bg-slate-700', 'bg-emerald-700']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  return (
    <span className={'avatar-bulat ' + kotak + ' ' + (props.src ? '' : warna)}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} /> : <span className="font-black text-white">{inisial}</span>}
    </span>
  )
}`
    u = u.slice(0, mulai) + AVATAR_BARU + u.slice(akhir)
    simpan(FILE_U, u)
    console.log('[BERHASIL] Avatar ditulis ulang dengan struktur satu elemen')
  }
}

/* ===== 2. index.css: kelas tunggal pengunci bentuk bulat ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* avatar-bulat-v2 */')) {
    console.log('[SUDAH ADA] CSS avatar-bulat-v2')
  } else {
    css = css.trimEnd() + '\n\n' + `/* avatar-bulat-v2: satu kelas pengunci bentuk lingkaran sempurna */
.avatar-bulat {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 9999px;
  border: 3px solid #166534;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
}
.avatar-bulat img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 9999px;
  display: block;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] CSS avatar-bulat-v2 ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir gaya lencana:')
console.log('1. Foto dipotong lingkaran penuh dan mengisi seluruh wadah, tidak ada lagi wadah squircle di belakangnya.')
console.log('2. Cincin hijau BSI 3 piksel mengelilingi foto secara merata, memberi kesan lencana resmi yang rapi.')
console.log('3. Mahasiswa tanpa foto melihat lingkaran hijau atau emas berisi inisial dengan cincin yang sama persis.')
console.log('4. Semua ukuran dari sm sampai 2xl memakai kelas yang sama, jadi bentuknya konsisten di header, tab Profil, kartu publik, PersonChip, dan daftar hadir.')
console.log('5. Bila ingin cincin berwarna lain, cukup ganti nilai border pada .avatar-bulat di index.css, misalnya #ffffff untuk cincin putih atau #eab308 untuk emas.')