const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(file) {
  return fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(file, isi) {
  fs.writeFileSync(path.join(root, file), isi, 'utf8')
}

function ada(file) {
  return fs.existsSync(path.join(root, file))
}

function ganti(file, cari, gantiDengan, label) {
  if (!ada(file)) {
    console.log('[LEWATI] File tidak ditemukan: ' + file)
    return
  }
  let isi = baca(file)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + file)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(file, isi)
  console.log('[BERHASIL] ' + label)
}

function tambahkan(file, penanda, blok, label) {
  if (!ada(file)) {
    console.log('[LEWATI] File tidak ditemukan: ' + file)
    return
  }
  let isi = baca(file)
  if (isi.includes(penanda)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  isi = isi + '\n' + blok
  simpan(file, isi)
  console.log('[BERHASIL] ' + label)
}

if (!ada('src/pages/DashboardPage.jsx')) {
  console.log('Jalankan script ini di root project (folder yang berisi folder src).')
  process.exit(1)
}

console.log('Memeriksa paket perubahan sebelumnya...')
const dash = baca('src/pages/DashboardPage.jsx')
if (!dash.includes('AutoTextArea')) console.log('[PERINGATAN] Paket textarea auto-size sepertinya belum diterapkan.')
if (!dash.includes('CustomSelect')) console.log('[PERINGATAN] Paket kontrol custom sepertinya belum diterapkan.')
if (!dash.includes('FileInput')) console.log('[PERINGATAN] Paket FileInput sepertinya belum diterapkan.')
console.log('')
console.log('Mulai menerapkan paket modal konfirmasi hapus...')
console.log('')

/* ===== 1. icons.jsx: tambah icon trash ===== */
ganti(
  'src/components/icons.jsx',
  `  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  )
}`,
  `  clipboard: (
    <>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </>
  )
}`,
  'Icon trash di icons.jsx'
)

/* ===== 2. ui.jsx: tambah komponen ConfirmModal ===== */
const CONFIRM_MODAL = `
export function ConfirmModal(props) {
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto bg-slate-900/60 p-4" onClick={props.onCancel}>
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
              <button type="button" onClick={props.onCancel}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Batal
              </button>
              <button type="button" onClick={props.onConfirm}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
                {props.confirmLabel || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
`
tambahkan('src/components/ui.jsx', 'export function ConfirmModal', CONFIRM_MODAL, 'Komponen ConfirmModal di ui.jsx')

/* ===== 3. DashboardPage.jsx: import ConfirmModal ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  "import { StatCard, EmptyState, Modal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'",
  "import { StatCard, EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea } from '../components/ui.jsx'",
  'Import ConfirmModal di DashboardPage'
)

/* ===== 4. DashboardPage.jsx: state pendingDelete ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `  const [busy, setBusy] = useState(false)`,
  `  const [busy, setBusy] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)`,
  'State pendingDelete di DashboardPage'
)

/* ===== 5. DashboardPage.jsx: ganti deleteLog ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `  async function deleteLog(log) {
    if (!confirm('Hapus logbook ini? Media galeri turunan ikut terhapus.')) return
    await supabase.from('logbooks').delete().eq('id', log.id)
    await refresh()
  }`,
  `  function deleteLog(log) {
    setPendingDelete({ type: 'log', data: log })
  }`,
  'Fungsi deleteLog menjadi alur konfirmasi'
)

/* ===== 6. DashboardPage.jsx: ganti deleteGaleri ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `  async function deleteGaleri(item) {
    if (!confirm('Hapus media ini dari galeri?')) return
    await supabase.from('galeri').delete().eq('id', item.id)
    await refresh()
  }`,
  `  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }`,
  'Fungsi deleteGaleri menjadi alur konfirmasi'
)

/* ===== 7. DashboardPage.jsx: ganti deleteHadir + tambah confirmInfo dan executeDelete ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `  async function deleteHadir(row) {
    if (!confirm('Hapus catatan kehadiran ini?')) return
    await supabase.from('daftar_hadir').delete().eq('id', row.id)
    await refresh()
  }`,
  `  function deleteHadir(row) {
    setPendingDelete({ type: 'hadir', data: row })
  }

  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'log') {
      return {
        title: 'Hapus logbook?',
        message: 'Logbook "' + pendingDelete.data.judul + '" beserta seluruh rincian kegiatannya akan dihapus permanen. Media galeri yang terhubung dari logbook ini juga ikut terhapus.'
      }
    }
    if (pendingDelete.type === 'gal') {
      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus.'
        : ''
      return {
        title: 'Hapus media galeri?',
        message: 'Media "' + pendingDelete.data.judul + '" akan dihapus permanen dari galeri kamu.' + extra
      }
    }
    return {
      title: 'Hapus catatan hadir?',
      message: 'Catatan kehadiran tanggal ' + pendingDelete.data.tanggal + ' dengan status ' + pendingDelete.data.status + ' akan dihapus permanen.'
    }
  }

  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'log') {
      await supabase.from('logbooks').delete().eq('id', target.data.id)
    } else if (target.type === 'gal') {
      await supabase.from('galeri').delete().eq('id', target.data.id)
    } else if (target.type === 'hadir') {
      await supabase.from('daftar_hadir').delete().eq('id', target.data.id)
    }
    await refresh()
  }`,
  'Fungsi deleteHadir menjadi alur konfirmasi plus confirmInfo dan executeDelete'
)

/* ===== 8. DashboardPage.jsx: render ConfirmModal ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>
    </div>
  )
}`,
  `      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      {pendingDelete ? (
        <ConfirmModal
          open={true}
          title={confirmInfo().title}
          message={confirmInfo().message}
          onCancel={function () { setPendingDelete(null) }}
          onConfirm={executeDelete}
        />
      ) : null}
    </div>
  )
}`,
  'Render ConfirmModal di akhir DashboardPage'
)

console.log('')
console.log('Selesai. Silakan cek browser, Vite akan memuat ulang otomatis.')
console.log('Coba klik tombol Hapus pada logbook, galeri, atau daftar hadir untuk melihat modal konfirmasi.')
console.log('Jika ada baris bertanda [TIDAK KETEMU], kirim baris tersebut ke sini supaya aku sesuaikan.')