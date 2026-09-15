const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi keluar untuk dropdown, date picker, dan panel filter...')
console.log('')

/* ===== 1. ui.jsx: komponen pembungkus SelubungPanel ===== */
const FILE_U = 'src/components/ui.jsx'
const KOMPONEN = `export function SelubungPanel(props) {
  const [tampil, setTampil] = useState(props.open)
  const tutup = tampil && !props.open
  useEffect(function () {
    if (props.open) { setTampil(true); return undefined }
    if (!tampil) return undefined
    const t = setTimeout(function () { setTampil(false) }, 180)
    return function () { clearTimeout(t) }
  }, [props.open, tampil])
  if (!tampil) return null
  return <div className={'selubung-panel' + (tutup ? ' panel-tutup' : '')}>{props.children}</div>
}`
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.includes('export function SelubungPanel')) {
  console.log('[SUDAH ADA] Komponen SelubungPanel di ui.jsx')
} else {
  simpan(FILE_U, u.trimEnd() + '\n\n' + KOMPONEN + '\n')
  console.log('[BERHASIL] Komponen SelubungPanel ditambahkan di ui.jsx')
}

/* ===== 2. index.css: keyframe animasi keluar panel ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* panel-keluar: animasi keluar dropdown, date picker, dan panel filter */
@keyframes panelOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-6px) scale(0.98); }
}
.panel-tutup { pointer-events: none; }
.panel-tutup .anim-modal, .panel-tutup .anim-filter { animation: panelOut 0.18s ease-in forwards; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('panel-keluar')) {
    console.log('[SUDAH ADA] CSS panel-keluar di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS panel-keluar ditambahkan di index.css')
  }
}

/* ===== 3. FilterBar.jsx: bungkus semua panel kondisional dengan SelubungPanel ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (!fs.existsSync(path.join(root, FILE_F))) {
  console.log('[LEWATI] FilterBar.jsx tidak ditemukan')
} else {
  let d = baca(FILE_F)
  let berubah = false
  if (!d.includes("SelubungPanel } from './ui.jsx'")) {
    d = "import { SelubungPanel } from './ui.jsx'\n" + d
    berubah = true
    console.log('[BERHASIL] Import SelubungPanel ditambahkan di FilterBar.jsx')
  } else {
    console.log('[SUDAH ADA] Import SelubungPanel di FilterBar.jsx')
  }
  if (d.includes('<SelubungPanel open={')) {
    console.log('[SUDAH ADA] Panel panel sudah dibungkus SelubungPanel')
  } else {
    let jumlah = 0
    const RE_BLOK = /\{(open|props\.open) \? \(\s*([\s\S]*?)\s*\) : null\}/g
    const baru = d.replace(RE_BLOK, function (m, cond, inner) {
      if (!/^\s*</.test(inner)) return m
      jumlah++
      return '<SelubungPanel open={' + cond + '}>\n' + inner + '\n</SelubungPanel>'
    })
    if (jumlah === 0) {
      console.log('[TIDAK KETEMU] Pola panel kondisional di FilterBar.jsx')
    } else {
      d = baru
      berubah = true
      console.log('[BERHASIL] ' + jumlah + ' panel dibungkus SelubungPanel di FilterBar.jsx')
    }
  }
  if (berubah) simpan(FILE_F, d)
}

/* ===== 4. Verifikasi ===== */
u = baca(FILE_U)
const css2 = baca(FILE_CSS)
const f2 = fs.existsSync(path.join(root, FILE_F)) ? baca(FILE_F) : ''
console.log('')
console.log('Verifikasi:')
console.log((u.includes('export function SelubungPanel') ? '[OK] ' : '[BELUM] ') + 'Komponen SelubungPanel ada di ui.jsx')
console.log((css2.includes('@keyframes panelOut') ? '[OK] ' : '[BELUM] ') + 'Keyframe panelOut ada di index.css')
console.log((f2.includes('<SelubungPanel open={') ? '[OK] ' : '[BELUM] ') + 'Panel di FilterBar.jsx sudah dibungkus')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja fitur baru:')
console.log('1. SelubungPanel menahan DOM panel selama 180 milidetik setelah state open menjadi false, memberi waktu bagi animasi keluar bermain.')
console.log('2. Kelas panel-tutup memicu keyframe panelOut pada panel berkelas anim-modal maupun anim-filter, jadi dropdown, date picker, dan panel filter semua kebagian.')
console.log('3. Animasi keluar berupa memudar sambil naik sedikit dan mengecil, konsisten dengan bahasa animasi modal di web ini.')
console.log('4. Selama fase keluar, pointer-events dimatikan supaya panel yang sedang memudar tidak bisa diklik lagi.')
console.log('5. Bila panel dibuka kembali di tengah animasi keluar, animasi masuk otomatis bermain ulang karena kelas panel-tutup dilepas.')
console.log('6. Pembungkus bersifat div statis, jadi posisi absolute dropdown tetap berpatokan ke induk relative semula tanpa perubahan tata letak.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik, klik tombol filter pada kartu filter: panel opsi muncul dengan animasi masuk seperti biasa.')
console.log('2. Klik lagi untuk menutup atau pilih salah satu opsi: panel memudar naik lalu hilang, tidak lenyap seketika.')
console.log('3. Buka dropdown urutan dan dropdown kategori: perilaku keluar sama halusnya.')
console.log('4. Buka date picker bulan maupun tanggal pada TimeFilter: saat ditutup ia memudar dengan mulus.')
console.log('5. Buka panel Filter utama di dashboard: saat ditutup ia memudar lalu ruangnya rapih terlepas.')
console.log('6. Buka tutup cepat berulang kali: tidak ada panel nyangkut atau kedip aneh.')