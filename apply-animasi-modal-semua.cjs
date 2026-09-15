const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang animasi muncul dan menghilang pada ConfirmModal dan Lightbox...')
console.log('')

/* ===== 1. index.css: aturan fade keluar untuk overlay yang dibungkus modal-tutup ===== */
const FILE_CSS = 'src/index.css'
let css = baca(FILE_CSS)
const RULE_BARU = '.modal-tutup .anim-overlay { animation: overlayFadeOut 0.2s ease-in forwards; }'
if (css.includes('.modal-tutup .anim-overlay')) {
  console.log('[SUDAH ADA] Aturan fade keluar overlay turunan di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n' + RULE_BARU + '\n')
  console.log('[BERHASIL] Aturan fade keluar overlay turunan ditambahkan di index.css')
}

/* ===== 2. ui.jsx: transformasi ConfirmModal dan Lightbox ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)

function batasFungsi(isi, nama) {
  const idx = isi.indexOf('export function ' + nama + '(')
  if (idx === -1) return null
  const idxOpen = isi.indexOf('{', idx)
  let brace = 0, akhir = -1, inStr = false, strCh = ''
  for (let i = idxOpen; i < isi.length; i++) {
    const ch = isi[i]
    const prev = i > 0 ? isi[i - 1] : ''
    if (inStr) { if (ch === strCh && prev !== '\\') inStr = false; continue }
    if (ch === '"' || ch === "'" || ch === '`') { inStr = true; strCh = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') { brace--; if (brace === 0) { akhir = i + 1; break } }
  }
  if (akhir === -1) return null
  return { mulai: idx, akhir: akhir }
}

function transformModal(isi, rentang, nama, kondisiOpen, depsOpen) {
  let span = isi.slice(rentang.mulai, rentang.akhir)
  if (span.includes('const isiSimpan = useRef(null)')) return { isi: isi, berubah: false, alasan: 'sudah' }
  const RE_KEPALA = new RegExp('export function ' + nama + '\\(props\\) \\{[\\s\\S]*?if \\(!props\\.' + kondisiOpen + '\\) return null')
  if (!RE_KEPALA.test(span)) return { isi: isi, berubah: false, alasan: 'kepala' }
  const KEPALA = 'export function ' + nama + '(props) {\n' +
    'const buka = !!props.' + kondisiOpen + '\n' +
    'const [tampil, setTampil] = useState(buka)\n' +
    'const [tutup, setTutup] = useState(false)\n' +
    'const isiSimpan = useRef(null)\n' +
    'useBodyScrollLock(buka)\n' +
    'useEffect(function () {\n' +
    'if (buka) { setTampil(true); setTutup(false); return undefined }\n' +
    'if (!tampil) return undefined\n' +
    'setTutup(true)\n' +
    'const t = setTimeout(function () { setTampil(false); setTutup(false) }, 200)\n' +
    'return function () { clearTimeout(t) }\n' +
    '}, [' + depsOpen + '])'
  span = span.replace(RE_KEPALA, KEPALA)
  if (!/return \(/.test(span)) return { isi: isi, berubah: false, alasan: 'return' }
  span = span.replace(/return \(/, 'let isiAktif = null\ntry {\nisiAktif = (')
  if (!span.endsWith(')\n}')) return { isi: isi, berubah: false, alasan: 'ekor' }
  const EKOR = ')\n} catch (err) { isiAktif = null }\n' +
    'if (buka && isiAktif) isiSimpan.current = isiAktif\n' +
    'if (!tampil) return null\n' +
    'if (tutup && isiSimpan.current) return <div className="modal-tutup">{isiSimpan.current}</div>\n' +
    'return isiAktif\n}'
  span = span.slice(0, span.length - 3) + EKOR
  return { isi: isi.slice(0, rentang.mulai) + span + isi.slice(rentang.akhir), berubah: true, alasan: '' }
}

const target = [
  { nama: 'ConfirmModal', kondisi: 'open', deps: 'buka', label: 'ConfirmModal' },
  { nama: 'Lightbox', kondisi: 'item', deps: 'buka', label: 'Lightbox' }
]
target.forEach(function (t) {
  const rentang = batasFungsi(u, t.nama)
  if (!rentang) { console.log('[LEWATI] Fungsi ' + t.nama + ' tidak ditemukan di ui.jsx'); return }
  const hasil = transformModal(u, rentang, t.nama, t.kondisi, t.deps)
  if (hasil.ubah) {
    u = hasil.isi
    simpan(FILE_U, u)
    console.log('[BERHASIL] ' + t.label + ' kini beranimasi masuk dan keluar')
  } else if (hasil.alasan === 'sudah') {
    console.log('[SUDAH ADA] Animasi keluar di ' + t.label)
  } else {
    console.log('[TIDAK KETEMU] Pola ' + hasil.alasan + ' pada ' + t.label)
  }
})

/* ===== 3. Verifikasi ===== */
u = baca(FILE_U)
css = baca(FILE_CSS)
console.log('')
console.log('Verifikasi:')
console.log((css.includes('.modal-tutup .anim-overlay') ? '[OK] ' : '[BELUM] ') + 'Aturan fade keluar overlay turunan')
console.log((u.includes('export function ConfirmModal(props) {\nconst buka = !!props.open') ? '[OK] ' : '[BELUM] ') + 'ConfirmModal memakai penunda unmount')
console.log((u.includes('export function Lightbox(props) {\nconst buka = !!props.item') ? '[OK] ' : '[BELUM] ') + 'Lightbox memakai penunda unmount')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Modal konfirmasi hapus muncul dengan pop halus dan kini menghilang dengan mengecil plus memudar, tidak lagi lenyap seketika.')
console.log('2. Lightbox zoom media juga mendapat animasi masuk dan keluar yang sama.')
console.log('3. Isi kedua modal disalin lebih dulu, jadi teks konfirmasi dan media tetap utuh terlihat selama animasi keluar.')
console.log('4. Membungkus salinan isi dengan kelas modal-tutup membuat keyframe keluar yang sudah ada dipakai ulang, tanpa keyframe baru.')
console.log('5. Bila pembangunan isi gagal karena data sudah kosong, blok try catch menjaga modal tetap aman memakai salinan terakhir.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, klik Hapus pada salah satu kartu: modal konfirmasi muncul dengan pop.')
console.log('2. Klik batal atau konfirmasi: modal mengecil dan memudar selama 0.2 detik, teks di dalamnya tidak kosong.')
console.log('3. Buka galeri, klik media untuk zoom: Lightbox muncul dengan fade.')
console.log('4. Tutup Lightbox lewat tombol X atau klik latar: ia memudar keluar dengan mulus.')
console.log('5. Modal detail logbook tetap berperilaku sama seperti sebelumnya.')