const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang ulang animasi tutup Modal sesuai struktur asli...')
console.log('')

/* ===== 1. ui.jsx: state penunda unmount dan kelas modal-tutup pada div anim-overlay ===== */
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
        let ganti = false
        span = span.replace(/<div className="(anim-overlay[^"]*)"/, function (m, cls) {
          ganti = true
          return "<div className={'" + cls + "' + (tutup ? ' modal-tutup' : '')}"
        })
        if (!ganti) {
          console.log('[TIDAK KETEMU] Pola div anim-overlay pembungkus Modal')
        } else {
          u = u.slice(0, idx) + span + u.slice(akhir)
          simpan(FILE_U, u)
          console.log('[BERHASIL] Modal menunda unmount 200ms dan pembungkus memakai kelas modal-tutup')
        }
      }
    }
  }
}

/* ===== 2. index.css: luruskan selector animasi keluar sesuai susunan overlay lalu panel ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  const SALAH1 = '.modal-tutup > *:first-child { animation: overlayFadeOut 0.2s ease-in forwards; }'
  const SALAH2 = '.modal-tutup > *:last-child { animation: modalPopOut 0.2s ease-in forwards; }'
  const BENAR1 = '.modal-tutup.anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }'
  const BENAR2 = '.modal-tutup .anim-modal { animation: modalPopOut 0.2s ease-in forwards; }'
  if (css.includes(BENAR1)) {
    console.log('[SUDAH ADA] Selector animasi keluar yang benar di index.css')
  } else if (css.includes(SALAH1)) {
    css = css.split(SALAH1).join(BENAR1).split(SALAH2).join(BENAR2)
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Selector animasi keluar disesuaikan dengan struktur Modal asli')
  } else {
    console.log('[TIDAK KETEMU] Blok selector modal-tutup lama di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
u = baca(FILE_U)
const css2 = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const [tampil, setTampil]') ? '[OK] ' : '[BELUM] ') + 'State penunda unmount di Modal')
console.log((u.includes("modal-tutup' : ''") ? '[OK] ' : '[BELUM] ') + 'Kelas modal-tutup pada div anim-overlay')
console.log((css2.includes('.modal-tutup.anim-overlay') ? '[OK] ' : '[BELUM] ') + 'Selector latar gelap memudar')
console.log((css2.includes('.modal-tutup .anim-modal') ? '[OK] ' : '[BELUM] ') + 'Selector panel mengecil dan memudar')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perbedaan perbaikan versi ini:')
console.log('1. Pola div pembungkus kini mencari kelas anim-overlay yang memang dipakai Modal aslimu, lengkap dengan z-[60] dan onClick penutup.')
console.log('2. Selector CSS animasi keluar diubah menjadi menarget overlay itu sendiri dan panel berkelas anim-modal, sesuai susunan overlay lalu pembungkus penyeret lalu panel.')
console.log('3. ConfirmModal tidak disentuh sama sekali, jadi modal konfirmasi hapus tetap berperilaku seperti sebelumnya sesuai batasan scope.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook publik lalu klik Detail pada kartu mana pun.')
console.log('2. Klik tombol X: panel mengecil halus sambil turun dan latar gelap memudar selama 0.2 detik, baru modal benar benar hilang.')
console.log('3. Buka detail lagi lalu klik latar gelap di luar panel: animasi keluar yang sama bermain.')
console.log('4. Buka detail galeri dan daftar hadir: keduanya ikut beranimasi keluar karena memakai komponen Modal yang sama.')
console.log('5. Tutup lalu buka lagi dengan cepat di tengah animasi: modal kembali muncul mulus tanpa nyangkut.')