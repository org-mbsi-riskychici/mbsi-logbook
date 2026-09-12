const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.log('[LEWATI] File tidak ditemukan: ' + rel)
    return
  }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + rel)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai menerapkan tombol lihat kode akses dan pembatasan tombol di halaman publik...')
console.log('')

/* ===== 1. Tambahkan icon eye dan eyeOff di icons.jsx ===== */
ganti(
  'src/components/icons.jsx',
  `  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  )
}`,
  `  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </>
  )
}`,
  'Icon eye dan eyeOff ditambahkan'
)

/* ===== 2. Import SizedIcon di LoginPage ===== */
ganti(
  'src/pages/LoginPage.jsx',
  `import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'`,
  `import { inputCls, labelCls, btnPrimary } from '../components/ui.jsx'
import { SizedIcon } from '../components/icons.jsx'`,
  'Import SizedIcon di LoginPage'
)

/* ===== 3. State lihatKode di LoginPage ===== */
ganti(
  'src/pages/LoginPage.jsx',
  `  const [busy, setBusy] = useState(false)`,
  `  const [busy, setBusy] = useState(false)
  const [lihatKode, setLihatKode] = useState(false)`,
  'State lihatKode di LoginPage'
)

/* ===== 4. Input kode akses dengan tombol mata ===== */
ganti(
  'src/pages/LoginPage.jsx',
  `          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <input type="password" className={inputCls} value={kode} onChange={function (e) { setKode(e.target.value) }} placeholder="Masukkan kode akses" required />
          </div>`,
  `          <div>
            <label className={labelCls}>Kode akses <span className="text-red-500">*</span></label>
            <div className="relative mt-1.5">
              <input
                type={lihatKode ? 'text' : 'password'}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
                value={kode}
                onChange={function (e) { setKode(e.target.value) }}
                placeholder="Masukkan kode akses"
                required
              />
              <button
                type="button"
                onClick={function () { setLihatKode(function (v) { return !v }) }}
                title={lihatKode ? 'Sembunyikan kode akses' : 'Lihat kode akses'}
                className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <SizedIcon name={lihatKode ? 'eyeOff' : 'eye'} size={18} />
              </button>
            </div>
          </div>`,
  'Tombol lihat dan sembunyikan kode akses'
)

/* ===== 5. ActionButtons hanya menampilkan Edit dan Hapus bila ada fungsinya ===== */
ganti(
  'src/components/cards.jsx',
  `      {props.isOwner ? (
        <>
          <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
          <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
        </>
      ) : null}`,
  `      {props.isOwner && props.onEdit ? (
        <>
          <button onClick={props.onEdit} className={btnSmall + ' bg-slate-900 text-white hover:bg-slate-700'}>Edit</button>
          <button onClick={props.onDelete} className={btnSmall + ' bg-red-50 text-red-700 hover:bg-red-100'}>Hapus</button>
        </>
      ) : null}`,
  'ActionButtons menyembunyikan Edit dan Hapus tanpa handler'
)

/* ===== 6. Footer kartu galeri mengikuti aturan yang sama ===== */
ganti(
  'src/components/cards.jsx',
  `          {props.isOwner ? (
            <div className="flex gap-2" onClick={function (e) { e.stopPropagation() }}>`,
  `          {props.isOwner && props.onEdit ? (
            <div className="flex gap-2" onClick={function (e) { e.stopPropagation() }}>`,
  'Footer kartu galeri menyembunyikan Edit dan Hapus tanpa handler'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman login dalam keadaan keluar.')
console.log('2. Ketik kode akses, klik icon mata di kanan kolom: teks harus terlihat.')
console.log('3. Klik lagi icon mata bergaris: teks kembali tertutup sebagai password.')
console.log('4. Login, lalu buka halaman Logbook, Galeri, dan Daftar Hadir.')
console.log('5. Setiap kartu hanya boleh menampilkan tombol Detail, tanpa Edit dan Hapus.')
console.log('6. Buka dashboard: tombol Detail, Edit, dan Hapus tetap lengkap seperti biasa.')