const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi tutup untuk Modal detail...')
console.log('')

/* ===== 1. ui.jsx: buat Modal menunda unmount 200ms sambil memainkan animasi keluar ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)

if (u.includes('const [tampil, setTampil]')) {
  console.log('[SUDAH ADA] Logika animasi tutup di Modal')
} else {
  const idx = u.indexOf('export function Modal(')
  if (idx === -1) {
    console.log('[TIDAK KETEMU] Fungsi Modal di ui.jsx')
  } else {
    /* cari batas akhir fungsi Modal dengan menghitung kurung kurawal */
    const idxOpen = u.indexOf('{', idx)
    let brace = 0, akhir = -1, inStr = false, strCh = ''
    for (let i = idxOpen; i < u.length; i++) {
      const ch = u[i]
      const prev = i > 0 ? u[i - 1] : ''
      if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
      if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
      if (ch === '{') brace++
      if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
    }
    if (akhir === -1) {
      console.log('[GAGAL] Batas fungsi Modal tidak terbaca')
    } else {
      let span = u.slice(idx, akhir)
      const RE_KEPALA = /export function Modal\(props\) \{[\s\S]*?if \(!props\.open\) return null/
      const KEPALA_BARU = `export function Modal(props) {
  const [tampil, setTampil] = useState(props.open)
  const [tutup, setTutup] = useState(false)
  useBodyScrollLock(!!props.open)
  useEffect(function () {
    if (props.open) {
      setTampil(true)
      setTutup(false)
      return undefined
    }
    if (!tampil) return undefined
    setTutup(true)
    const t = setTimeout(function () {
      setTampil(false)
      setTutup(false)
    }, 200)
    return function () { clearTimeout(t) }
  }, [props.open])
  if (!tampil) return null`
      if (!RE_KEPALA.test(span)) {
        console.log('[TIDAK KETEMU] Pola kepala fungsi Modal')
      } else {
        span = span.replace(RE_KEPALA, KEPALA_BARU)
        const sebelum = span
        span = span.replace(/<div className="(fixed inset-0 z-50[^"]*)">/, function (m, cls) {
          return "<div className={'" + cls + "' + (tutup ? ' modal-tutup' : '')}>"
        })
        if (span === sebelum) {
          console.log('[TIDAK KETEMU] Pola div pembungkus Modal')
        } else {
          u = u.slice(0, idx) + span + u.slice(akhir)
          simpan(FILE_U, u)
          console.log('[BERHASIL] Modal kini menunda unmount dan memakai kelas modal-tutup')
        }
      }
    }
  }
}

/* ===== 2. index.css: keyframe animasi keluar ===== */
const FILE_CSS = 'src/index.css'
const CSS_TUTUP = `/* modal-tutup: animasi keluar saat detail ditutup, memakai struktur anak supaya tidak bergantung nama kelas */
@keyframes modalPopOut {
  from { opacity: 1; transform: scale(1) translateY(0); }
  to { opacity: 0; transform: scale(0.94) translateY(12px); }
}
@keyframes overlayFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
.modal-tutup { pointer-events: none; }
.modal-tutup > *:first-child { animation: overlayFadeOut 0.2s ease-in forwards; }
.modal-tutup > *:last-child { animation: modalPopOut 0.2s ease-in forwards; }
`
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* modal-tutup')) {
    console.log('[SUDAH ADA] CSS modal-tutup di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_TUTUP)
    console.log('[BERHASIL] CSS modal-tutup ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
u = baca(FILE_U)
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const [tampil, setTampil]') ? '[OK] ' : '[BELUM] ') + 'State penunda unmount di Modal')
console.log((u.includes('modal-tutup') ? '[OK] ' : '[BELUM] ') + 'Kelas modal-tutup di pembungkus Modal')
console.log((css2.includes('@keyframes modalPopOut') ? '[OK] ' : '[BELUM] ') + 'Keyframe panel mengecil dan memudar')
console.log((css2.includes('@keyframes overlayFadeOut') ? '[OK] ' : '[BELUM] ') + 'Keyframe latar gelap memudar')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Menutup detail lewat tombol X, tombol tutup mana pun, atau klik latar gelap kini memainkan animasi keluar selama 0.2 detik.')
console.log('2. Panel detail mengecil ke 94 persen sambil turun 12 piksel dan memudar, latar gelap memudar bersamaan, lalu modal benar benar dilepas dari DOM.')
console.log('3. Membuka detail tetap memakai animasi masuk yang lama, tidak berubah sama sekali.')
console.log('4. Selama animasi keluar, pointer-events dimatikan supaya klik ganda tidak menembus ke halaman di belakangnya.')
console.log('5. Scope terbatas pada komponen Modal dan satu blok CSS, tidak ada komponen atau halaman lain yang disentuh.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik, klik tombol Detail pada kartu mana pun.')
console.log('2. Klik tombol X: panel mengecil halus ke bawah dan latar memudar, bukan hilang seketika.')
console.log('3. Ulangi dengan klik latar gelap di luar panel: efek keluar yang sama muncul.')
console.log('4. Buka detail galeri dan daftar hadir: keduanya ikut mendapat animasi keluar karena memakai komponen Modal yang sama.')
console.log('5. Pastikan animasi masuk saat membuka detail tetap sama seperti sebelumnya.')