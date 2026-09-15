const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memperbaiki animasi keluar ConfirmModal dari akar masalahnya...')
console.log('')

/* ===== 1. ui.jsx: ConfirmModal punya penunda lepas dan penyangga isi ===== */
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const idx = u.indexOf('function ConfirmModal(')
if (idx === -1) {
  console.log('[TIDAK KETEMU] Fungsi ConfirmModal di ui.jsx')
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
    console.log('[GAGAL] Batas fungsi ConfirmModal tidak terbaca')
  } else {
    let span = u.slice(idx, akhir)
    if (span.includes('isiSimpan')) {
      console.log('[SUDAH ADA] Penunda lepas di ConfirmModal')
    } else {
      const RE_KEPALA = /function ConfirmModal\(props\) \{\s*useBodyScrollLock\(props\.open\)\s*if \(!props\.open\) return null\s*return \(/
      if (!RE_KEPALA.test(span)) {
        console.log('[TIDAK KETEMU] Pola kepala ConfirmModal')
      } else if (!span.endsWith(')\n}')) {
        console.log('[TIDAK KETEMU] Pola ekor ConfirmModal')
      } else {
        const KEPALA = `function ConfirmModal(props) {
const [tampil, setTampil] = useState(props.open)
const [tutup, setTutup] = useState(false)
const isiSimpan = useRef(null)
useBodyScrollLock(!!props.open)
useEffect(function () {
if (props.open) { setTampil(true); setTutup(false); return undefined }
if (!tampil) return undefined
setTutup(true)
const t = setTimeout(function () { setTampil(false); setTutup(false) }, 200)
return function () { clearTimeout(t) }
}, [props.open])
const isiAktif = (`
        span = span.replace(RE_KEPALA, KEPALA)
        const EKOR = ')\n' +
          'if (props.open) isiSimpan.current = isiAktif\n' +
          'if (!tampil) return null\n' +
          'if (tutup && isiSimpan.current) return <div className="modal-tutup">{isiSimpan.current}</div>\n' +
          'return isiAktif\n}'
        span = span.slice(0, span.length - 3) + EKOR
        u = u.slice(0, idx) + span + u.slice(akhir)
        simpan(FILE_U, u)
        console.log('[BERHASIL] ConfirmModal kini menunda lepas 200ms dan menyimpan salinan isi')
      }
    }
  }
}

/* ===== 2. DashboardPage: ConfirmModal tidak lagi dibuang paksa oleh induknya ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[LEWATI] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_D)
  if (d.includes('open={!!pendingDelete}')) {
    console.log('[SUDAH ADA] Pemakaian ConfirmModal selalu dirender')
  } else {
    const RE_PAKAI = /\{pendingDelete \? \(\s*<ConfirmModal\s*open=\{true\}\s*title=\{confirmInfo\(\)\.title\}\s*message=\{confirmInfo\(\)\.message\}\s*onCancel=\{function \(\) \{ setPendingDelete\(null\) \}\}\s*onConfirm=\{executeDelete\}\s*\/>\s*\) : null\}/
    if (RE_PAKAI.test(d)) {
      d = d.replace(RE_PAKAI, `<ConfirmModal
open={!!pendingDelete}
title={pendingDelete && confirmInfo() ? confirmInfo().title : ''}
message={pendingDelete && confirmInfo() ? confirmInfo().message : ''}
onCancel={function () { setPendingDelete(null) }}
onConfirm={executeDelete}
/>`)
      simpan(FILE_D, d)
      console.log('[BERHASIL] ConfirmModal kini selalu dirender dengan open mengikuti pendingDelete')
    } else {
      console.log('[TIDAK KETEMU] Pola pemakaian ConfirmModal di DashboardPage')
    }
  }
}

/* ===== 3. Verifikasi ===== */
u = baca(FILE_U)
const d2 = fs.existsSync(path.join(root, FILE_D)) ? baca(FILE_D) : ''
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const isiSimpan = useRef(null)') && u.indexOf('const isiSimpan = useRef(null)') > u.indexOf('function ConfirmModal(') ? '[OK] ' : '[BELUM] ') + 'Penunda lepas dan penyangga isi di ConfirmModal')
console.log((u.includes('if (tutup && isiSimpan.current) return <div className="modal-tutup">') ? '[OK] ' : '[BELUM] ') + 'Pembungkus modal-tutup saat keluar')
console.log((d2.includes('open={!!pendingDelete}') ? '[OK] ' : '[BELUM] ') + 'ConfirmModal tidak lagi dibuang paksa oleh induk')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan akar masalah:')
console.log('1. Sebelumnya induk merender ConfirmModal hanya saat pendingDelete ada, jadi komponen langsung dibuang sebelum animasi keluar sempat bermain.')
console.log('2. Kini ConfirmModal selalu dirender dan hanya prop open yang berubah, sehingga penunda lepas 200 milidetik di dalamnya bisa memainkan animasi keluar.')
console.log('3. Judul dan pesan diberi penjaga null supaya tidak error saat pendingDelete kosong, dan salinan isi menjaga teks pertanyaan tetap utuh selama animasi.')
console.log('4. Markup tombol Batal, Ya Hapus, dan ikon sampah tidak disentuh sama sekali.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard lalu klik Hapus pada kartu mana pun: modal konfirmasi muncul dengan pop.')
console.log('2. Klik Batal: modal mengecil dan memudar selama 0.2 detik dengan teks pertanyaan tetap terbaca, baru benar benar hilang.')
console.log('3. Klik Hapus lagi lalu klik Ya Hapus: animasi keluar bermain sebentar lalu data terhapus dan toast sukses muncul.')
console.log('4. Buka tutup modal berulang dengan cepat: tidak ada nyangkut atau kedip kosong.')