const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = fs.readFileSync(path.join(root, FILE_U), 'utf8').replace(/\r\n/g, '\n')

const CONFIRM_BARU = `export function ConfirmModal(props) {
const [tampil, setTampil] = useState(props.open)
const propsSimpan = useRef(null)
if (props.open) propsSimpan.current = props
const p = props.open ? props : (propsSimpan.current || props)
const tutup = tampil && !props.open
useBodyScrollLock(!!props.open)
useEffect(function () {
if (props.open) { setTampil(true); return undefined }
if (!tampil) return undefined
const t = setTimeout(function () { setTampil(false) }, 200)
return function () { clearTimeout(t) }
}, [props.open, tampil])
if (!tampil) return null
return (
<div className={'anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4' + (tutup ? ' modal-tutup' : '')} onClick={p.onCancel}>
<div className="min-h-full flex items-center justify-center py-8">
<div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
<div className="p-6 space-y-4">
<div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
<SizedIcon name="trash" size={24} />
</div>
<div className="text-center">
<h3 className="text-xl font-black text-slate-900">{p.title || 'Hapus data ini?'}</h3>
<p className="mt-2 text-sm text-slate-500">{p.message}</p>
</div>
<div className="grid grid-cols-2 gap-3">
<button type="button" onClick={p.onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
Batal
</button>
<button type="button" onClick={p.onConfirm} className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
{p.confirmLabel || 'Ya, Hapus'}
</button>
</div>
</div>
</div>
</div>
</div>
)
}`

console.log('Mulai menghilangkan glitch pada animasi keluar ConfirmModal...')
console.log('')

const idx = u.indexOf('function ConfirmModal(')
if (idx === -1) {
  console.log('[TIDAK KETEMU] Fungsi ConfirmModal di ui.jsx')
} else {
  const pakaiExport = u.slice(Math.max(0, idx - 7), idx) === 'export '
  const mulai = pakaiExport ? idx - 7 : idx
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
    const span = u.slice(mulai, akhir)
    if (span.includes('propsSimpan')) {
      console.log('[SUDAH ADA] ConfirmModal versi tanpa glitch')
    } else {
      const teks = pakaiExport ? CONFIRM_BARU : CONFIRM_BARU.replace('export function ConfirmModal', 'function ConfirmModal')
      u = u.slice(0, mulai) + teks + u.slice(akhir)
      fs.writeFileSync(path.join(root, FILE_U), u, 'utf8')
      console.log('[BERHASIL] ConfirmModal ditulis ulang tanpa ganti bentuk pohon saat menutup')
    }
  }
}

u = fs.readFileSync(path.join(root, FILE_U), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((u.includes('const propsSimpan = useRef(null)') ? '[OK] ' : '[BELUM] ') + 'Salinan props untuk fase menutup')
console.log((u.includes("const tutup = tampil && !props.open") ? '[OK] ' : '[BELUM] ') + 'Status tutup dihitung langsung tanpa menunggu effect')
console.log((u.includes("(tutup ? ' modal-tutup' : '')") ? '[OK] ' : '[BELUM] ') + 'Kelas modal-tutup ditempel pada overlay yang sama')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa versi ini tidak glitch:')
console.log('1. Tidak ada lagi frame kosong karena status tutup dihitung langsung dari props, bukan menunggu effect berjalan setelah render.')
console.log('2. Bentuk pohon JSX saat terbuka dan saat menutup identik, jadi React hanya memperbarui kelas pada node yang sama, bukan membongkar dan memasang ulang DOM.')
console.log('3. Karena node tidak dipasang ulang, animasi masuk tidak pernah terpicu kedua kali. Animasi keluar bermain tepat satu kali.')
console.log('4. Judul, pesan, dan tombol diambil dari salinan props yang disimpan saat modal masih terbuka, sehingga isi tetap utuh sampai modal benar benar lepas.')
console.log('5. Latar gelap tidak lagi menghilang sesaat karena elemen overlay yang sama tetap hidup sepanjang animasi keluar.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard lalu klik Hapus pada kartu mana pun.')
console.log('2. Klik tombol X atau Batal: modal langsung mengecil dan memudar mulus dalam satu gerakan, tanpa kedip hilang lalu muncul lagi.')
console.log('3. Ulangi lewat klik latar gelap di luar panel: perilaku sama halusnya.')
console.log('4. Klik Ya Hapus: animasi keluar bermain sekali lalu data terhapus dan toast sukses muncul.')
console.log('5. Buka tutup cepat beberapa kali: tidak ada sisa modal yang nyangkut di layar.')