const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

function rentangFungsi(isi, nama) {
  const idx = isi.indexOf('function ' + nama + '(')
  if (idx === -1) return null
  const pakaiExport = isi.slice(Math.max(0, idx - 7), idx) === 'export '
  const mulai = pakaiExport ? idx - 7 : idx
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
  return { mulai: mulai, akhir: akhir, pakaiExport: pakaiExport }
}

/* ConfirmModal ditulis ulang: markup identik dengan aslinya, ditambah animasi masuk dan keluar */
const CONFIRM_BARU = `export function ConfirmModal(props) {
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
const isiAktif = (
<div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>
<div className="min-h-full flex items-center justify-center py-8">
<div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
<div className="p-6 space-y-4">
<div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
<SizedIcon name="trash" size={24} />
</div>
<div className="text-center">
<h3 className="text-xl font-black text-slate-900">{props.title || 'Hapus data ini?'}</h3>
<p className="mt-2 text-sm text-slate-500">{props.message}</p>
</div>
<div className="grid grid-cols-2 gap-3">
<button type="button" onClick={props.onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
Batal
</button>
<button type="button" onClick={props.onConfirm} className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
{props.confirmLabel || 'Ya, Hapus'}
</button>
</div>
</div>
</div>
</div>
</div>
)
if (props.open) isiSimpan.current = isiAktif
if (!tampil) return null
if (tutup && isiSimpan.current) return <div className="modal-tutup">{isiSimpan.current}</div>
return isiAktif
}`

console.log('Mulai menulis ulang ConfirmModal dengan animasi masuk dan keluar...')
console.log('')

/* ===== 1. ConfirmModal: ganti utuh satu fungsi ===== */
const rC = rentangFungsi(u, 'ConfirmModal')
if (!rC) {
  console.log('[TIDAK KETEMU] Fungsi ConfirmModal di ui.jsx')
} else if (u.slice(rC.mulai, rC.akhir).includes('isiSimpan')) {
  console.log('[SUDAH ADA] Animasi keluar di ConfirmModal')
} else {
  const teks = rC.pakaiExport ? CONFIRM_BARU : CONFIRM_BARU.replace('export function ConfirmModal', 'function ConfirmModal')
  u = u.slice(0, rC.mulai) + teks + u.slice(rC.akhir)
  berubah = true
  console.log('[BERHASIL] ConfirmModal ditulis ulang dengan animasi masuk dan keluar')
}

/* ===== 2. Lightbox: pastikan punya animasi masuk bila belum ===== */
const rL = rentangFungsi(u, 'Lightbox')
if (!rL) {
  console.log('[LEWATI] Fungsi Lightbox tidak ditemukan di ui.jsx')
} else {
  let span = u.slice(rL.mulai, rL.akhir)
  if (span.includes('anim-overlay')) {
    console.log('[SUDAH ADA] Kelas anim-overlay di Lightbox')
  } else if (span.includes('className="fixed inset-0')) {
    span = span.replace('className="fixed inset-0', 'className="anim-overlay fixed inset-0')
    u = u.slice(0, rL.mulai) + span + u.slice(rL.akhir)
    berubah = true
    console.log('[BERHASIL] Animasi masuk Lightbox ditambahkan')
  } else {
    console.log('[TIDAK KETEMU] Div fixed inset-0 di Lightbox')
  }
}

if (berubah) fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')

/* ===== 3. Verifikasi ===== */
u = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const [tampil, setTampil] = useState(props.open)\nconst [tutup, setTutup] = useState(false)\nconst isiSimpan = useRef(null)\nuseBodyScrollLock(!!props.open)') ? '[OK] ' : '[BELUM] ') + 'ConfirmModal memakai penunda unmount dan penyangga isi')
console.log((u.includes('if (tutup && isiSimpan.current) return <div className="modal-tutup">') ? '[OK] ' : '[BELUM] ') + 'ConfirmModal membungkus salinan isi dengan modal-tutup saat keluar')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Modal konfirmasi hapus muncul dengan pop halus seperti sebelumnya.')
console.log('2. Saat ditutup lewat Batal, tombol Ya Hapus, atau klik latar, ia mengecil dan memudar selama 0.2 detik dengan teks pertanyaan tetap utuh.')
console.log('3. Markup di dalam ConfirmModal tidak berubah sedikit pun: ikon sampah, judul, pesan, dan kedua tombol sama persis dengan sebelumnya.')
console.log('4. Lightbox dipastikan punya animasi masuk; animasi keluarnya sengaja tidak dipaksa karena Lightbox dilepas langsung oleh induknya di beberapa tempat sekaligus.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, klik Hapus pada kartu logbook: modal konfirmasi muncul dengan pop.')
console.log('2. Klik Batal: modal mengecil memudar, tidak lagi lenyap seketika.')
console.log('3. Ulangi lalu klik Ya Hapus: animasi keluar bermain sebentar lalu data terhapus dan toast sukses muncul.')
console.log('4. Buka detail dan lightbox media: animasi masuk tetap halus seperti biasa.')
console.log('')
console.log('Catatan jujur soal Lightbox:')
console.log('Animasi keluar Lightbox butuh perubahan di setiap pemanggilnya (kartu galeri, detail logbook, dashboard) karena induknya langsung melepas komponen saat ditutup.')
console.log('Bila kamu mau itu juga, bilang saja dan saya buatkan script terpisah yang menyentuh titik titik pemanggil tersebut secara hati hati.')