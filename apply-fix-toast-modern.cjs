const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki posisi, animasi, dan tampilan toast menjadi gaya modern...')
console.log('')

/* ===== 1. ui.jsx: ToastProvider dua fase (masuk lalu keluar) plus struktur baru ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
const PROVIDER_BARU = `export function ToastProvider(props) {
  const [toasts, setToasts] = useState([])
  function tutupToast(id) {
    setToasts(function (prev) { return prev.map(function (t) { return t.id === id ? Object.assign({}, t, { tutup: true }) : t }) })
    setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
    }, 240)
  }
  function tambahToast(tipe, pesan) {
    const id = Date.now() + Math.random()
    setToasts(function (prev) { return prev.concat([{ id: id, tipe: tipe, pesan: pesan, tutup: false }]) })
    setTimeout(function () { tutupToast(id) }, 4000)
  }
  function toastSukses(pesan) { tambahToast('sukses', pesan) }
  function toastGagal(pesan) { tambahToast('gagal', pesan) }
  return (
    <ToastContext.Provider value={{ sukses: toastSukses, gagal: toastGagal }}>
      {props.children}
      <div className="toast-wadah fixed z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(function (t) {
          const sukses = t.tipe === 'sukses'
          return (
            <div key={t.id} className={'toast-kartu pointer-events-auto flex items-center gap-3 ' + (sukses ? 'toast-sukses' : 'toast-gagal') + (t.tutup ? ' toast-keluar' : '')}>
              <span className={'toast-ikon ' + (sukses ? 'toast-ikon-sukses' : 'toast-ikon-gagal')}>
                <SizedIcon name={sukses ? 'check' : 'close'} size={15} />
              </span>
              <p className="toast-teks flex-1 text-sm font-semibold">{t.pesan}</p>
              <button type="button" onClick={function () { tutupToast(t.id) }} title="Tutup notifikasi"
                className="toast-tutup grid h-7 w-7 shrink-0 place-items-center rounded-lg">
                <SizedIcon name="close" size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
`
const mulaiProvider = u.indexOf('export function ToastProvider(props) {')
const mulaiUseToast = u.indexOf('export function useToast() {')
if (mulaiProvider === -1 || mulaiUseToast === -1 || mulaiUseToast < mulaiProvider) {
  console.log('[TIDAK KETEMU] Blok ToastProvider di ui.jsx')
} else if (u.includes('toast-wadah fixed z-[100]')) {
  console.log('[SUDAH ADA] ToastProvider versi modern di ui.jsx')
} else {
  u = u.slice(0, mulaiProvider) + PROVIDER_BARU + u.slice(mulaiUseToast)
  simpan(FILE_U, u)
  console.log('[BERHASIL] ToastProvider diganti menjadi versi dua fase dengan struktur modern')
}

/* ===== 2. index.css: ganti blok toast lama dengan toast-modern-v1 ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
const CSS_BARU = `/* toast-modern-v1: kartu glass blur, ikon kotak berwarna lembut, posisi responsif, animasi masuk dan keluar */
.toast-wadah {
  top: 1rem;
  left: 1rem;
  right: 1rem;
}
@media (min-width: 640px) {
  .toast-wadah {
    left: auto;
    right: 1.25rem;
    top: 1.25rem;
    width: 100%;
    max-width: 24rem;
  }
}
@keyframes toastIn {
  from { opacity: 0; transform: translateY(-14px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateY(0) scale(1); }
  to { opacity: 0; transform: translateY(-10px) scale(0.97); }
}
.toast-kartu {
  border-radius: 1rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.18), 0 2px 8px rgba(15, 23, 42, 0.06);
  padding: 0.75rem 0.875rem;
  animation: toastIn 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.toast-keluar {
  animation: toastOut 0.22s ease-in forwards;
}
.toast-ikon {
  display: grid;
  place-items: center;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
}
.toast-ikon-sukses { background: rgba(16, 185, 129, 0.12); color: #059669; }
.toast-ikon-gagal { background: rgba(239, 68, 68, 0.12); color: #dc2626; }
.toast-sukses { border-color: rgba(16, 185, 129, 0.28); }
.toast-gagal { border-color: rgba(239, 68, 68, 0.28); }
.toast-teks { color: #1e293b; }
.toast-tutup { color: #94a3b8; transition: background-color 0.15s ease, color 0.15s ease; }
.toast-tutup:hover { background: rgba(15, 23, 42, 0.06); color: #475569; }
.dark .toast-kartu {
  background: rgba(15, 23, 42, 0.92);
  border-color: rgba(51, 65, 85, 0.7);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.4);
}
.dark .toast-ikon-sukses { background: rgba(16, 185, 129, 0.16); color: #34d399; }
.dark .toast-ikon-gagal { background: rgba(239, 68, 68, 0.16); color: #f87171; }
.dark .toast-sukses { border-color: rgba(52, 211, 153, 0.35); }
.dark .toast-gagal { border-color: rgba(248, 113, 113, 0.35); }
.dark .toast-teks { color: #f1f5f9; }
.dark .toast-tutup { color: #64748b; }
.dark .toast-tutup:hover { background: rgba(255, 255, 255, 0.08); color: #cbd5e1; }
`
if (css.includes('toast-modern-v1')) {
  console.log('[SUDAH ADA] CSS toast-modern-v1 di index.css')
} else {
  const mulaiToast = css.indexOf('/* toast-opaque:')
  const akhirToast = css.indexOf('/* animasi-halus-v1')
  if (mulaiToast !== -1 && akhirToast !== -1 && akhirToast > mulaiToast) {
    css = css.slice(0, mulaiToast) + CSS_BARU + css.slice(akhirToast)
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Blok toast lama diganti menjadi toast-modern-v1')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BARU)
    console.log('[BERHASIL] CSS toast-modern-v1 ditambahkan (blok lama tidak ditemukan)')
  }
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const u2 = baca(FILE_U)
const c2 = baca(FILE_CSS)
console.log((u2.includes('toast-wadah fixed z-[100]') ? '[OK] ' : '[BELUM] ') + 'Wadah toast memakai kelas posisi responsif')
console.log((u2.includes('function tutupToast(id)') && u2.includes('setTimeout(function () { tutupToast(id) }, 4000)') ? '[OK] ' : '[BELUM] ') + 'Auto hide melewati fase animasi keluar')
console.log((u2.includes('toast-ikon-sukses') ? '[OK] ' : '[BELUM] ') + 'Ikon kotak berwarna lembut terpasang')
console.log((!u2.includes('anim-toast pointer-events-auto') ? '[OK] ' : '[BELUM] ') + 'Struktur toast lama sudah diganti')
console.log((c2.includes('toast-modern-v1') ? '[OK] ' : '[BELUM] ') + 'CSS toast-modern-v1 tersedia')
console.log((c2.includes('@keyframes toastOut') ? '[OK] ' : '[BELUM] ') + 'Keyframes animasi keluar tersedia')
console.log((c2.includes('.toast-wadah {\n  top: 1rem;\n  left: 1rem;\n  right: 1rem;\n}') ? '[OK] ' : '[BELUM] ') + 'Posisi mobile memakai inset kiri kanan sehingga tidak terpotong')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab masalah dan cara kerja perbaikan:')
console.log('1. Toast terpotong di mobile karena wadah lama memakai lebar penuh dengan batas max-w-sm plus offset kanan 20px, sehingga di layar sempit tepi kirinya terdorong keluar viewport. Kini di bawah 640px wadah memakai inset kiri dan kanan 16px, jadi toast selalu utuh di tengah layar dengan margin simetris.')
console.log('2. Animasi keluar tidak ada karena toast langsung dibuang dari array setelah 4 detik. Kini penutupan berjalan dua fase: toast ditandai tutup, memainkan animasi toastOut 220 milidetik berupa memudar sambil naik tipis dan mengecil, baru kemudian dilepas dari DOM. Tombol tutup manual memakai jalur yang sama.')
console.log('3. Animasi masuk diganti menjadi meluncur dari atas dengan kurva pegas cubic-bezier(0.22, 1, 0.36, 1), terasa seperti notifikasi sistem modern, bukan geser samping datar.')
console.log('4. Tampilan baru bergaya glass: kartu semi transparan dengan backdrop blur 12px, sudut 16px, bayangan berlapis lembut, dan border tipis yang warnanya mengikuti tipe notifikasi.')
console.log('5. Ikon lingkaran solid diganti kotak 32px bersudut 10px dengan latar tint 12 persen dan ikon berwarna emerald atau merah, jauh lebih ringan secara visual dan mengikuti bahasa desain notifikasi modern.')
console.log('6. Tombol tutup kini kotak 28px dengan efek hover berupa latar lembut, bukan sekadar ikon melayang, sehingga area sentuh lebih jelas di ponsel.')
console.log('7. Mode gelap memakai kartu slate gelap semi transparan dengan tint ikon lebih terang, kontras teks tetap terjaga di kedua mode.')
console.log('')
console.log('Langkah uji:')
console.log('1. Hapus atau simpan data di dashboard lewat ponsel: toast muncul utuh di tengah layar dengan margin kiri kanan sama, tidak ada bagian yang terpotong.')
console.log('2. Perhatikan masuknya: toast meluncur turun dari atas dengan pegas lembut lalu berhenti rapi.')
console.log('3. Tunggu 4 detik atau ketuk tombol tutup: toast memudar sambil naik tipis dan mengecil sebelum hilang, tidak lenyap sekonyongkonyong.')
console.log('4. Picu toast sukses dan gagal beruntun: keduanya menumpuk rapi dengan jarak 8px dan warna border serta ikon masing masing.')
console.log('5. Buka di desktop lebar 640px ke atas: toast kembali berlabuh di kanan atas dengan lebar maksimal 384px seperti kolom notifikasi aplikasi modern.')
console.log('6. Aktifkan mode gelap: kartu menjadi slate gelap kaca dengan ikon tint terang, tetap terbaca jelas.')