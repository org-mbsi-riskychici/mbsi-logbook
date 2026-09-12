const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/pages/DashboardPage.jsx'

function baca(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(file, isi) {
  fs.writeFileSync(path.join(root, file), isi, 'utf8')
}

function ganti(cari, gantiDengan, label) {
  let isi = baca(FILE)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + FILE)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(FILE, isi)
  console.log('[BERHASIL] ' + label)
}

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('File ' + FILE + ' tidak ditemukan.')
  console.log('Pastikan script dijalankan di root project (folder yang berisi folder src).')
  process.exit(1)
}

console.log('Mulai menerapkan penanda mode edit dan tombol batal edit...')
console.log('')

/* ===== 1. Komponen ModeIndicator ===== */
ganti(
  `const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }`,
  `const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

function ModeIndicator(props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ' + (props.edit ? 'bg-gold-500/15 text-gold-600' : 'bg-bsi-100 text-bsi-900')}>
        <span className={'h-2 w-2 rounded-full ' + (props.edit ? 'bg-gold-500' : 'bg-bsi-500')}></span>
        {props.edit ? 'Mode Edit' : 'Mode Tambah'}
      </span>
      {props.edit ? (
        <button type="button" onClick={props.onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
          <SizedIcon name="close" size={12} />
          Batal Edit
        </button>
      ) : null}
    </div>
  )
}`,
  'Komponen ModeIndicator ditambahkan'
)

/* ===== 2. Fungsi batal edit, mulai edit galeri dan hadir, plus gulir ke atas ===== */
ganti(
  `    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
  }`,
  `    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditLog() {
    setEditLogId(null)
    setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
    setItems([newItem()])
  }

  function startEditGal(g) {
    setEditGalId(g.id)
    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditGal() {
    setEditGalId(null)
    setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '' })
  }

  function startEditHadir(h) {
    setEditHadirId(h.id)
    setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditHadir() {
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  }`,
  'Fungsi batal edit dan mulai edit galeri serta hadir'
)

/* ===== 3. Penanda mode di form logbook ===== */
ganti(
  `          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>`,
  `          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editLogId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editLogId} onCancel={cancelEditLog} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>`,
  'Penanda mode dan tepi emas di form logbook'
)

/* ===== 4. Penanda mode di form galeri ===== */
ganti(
  `          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>`,
  `          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editGalId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editGalId} onCancel={cancelEditGal} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>`,
  'Penanda mode dan tepi emas di form galeri'
)

/* ===== 5. Penanda mode di form daftar hadir ===== */
ganti(
  `          <div className="card-hover bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 min-w-0">
            <h2 className="text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>`,
  `          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editHadirId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editHadirId} onCancel={cancelEditHadir} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>`,
  'Penanda mode dan tepi emas di form daftar hadir'
)

/* ===== 6. Tombol edit kartu galeri memakai startEditGal ===== */
ganti(
  `                  onEdit={function () { setEditGalId(g.id); setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path }) }}`,
  `                  onEdit={function () { startEditGal(g) }}`,
  'Tombol edit kartu galeri memakai startEditGal'
)

/* ===== 7. Tombol edit kartu hadir memakai startEditHadir ===== */
ganti(
  `                onEdit={function () { setEditHadirId(h.id); setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' }) }}`,
  `                onEdit={function () { startEditHadir(h) }}`,
  'Tombol edit kartu hadir memakai startEditHadir'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji yang disarankan:')
console.log('1. Buka dashboard, perhatikan badge Mode Tambah berwarna hijau di ketiga form.')
console.log('2. Klik Edit pada salah satu logbook. Badge berubah menjadi Mode Edit berwarna emas,')
console.log('   tepi kartu form menjadi emas, dan halaman menggulir mulus ke form.')
console.log('3. Klik Batal Edit. Form kembali kosong dan badge kembali ke Mode Tambah.')
console.log('4. Ulangi hal yang sama pada kartu galeri dan kartu daftar hadir.')
console.log('5. Masuk mode edit lalu simpan perubahan. Mode harus otomatis kembali ke Mode Tambah.')