const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang pagination 10 data per halaman pada Logbook, Galeri, dan Daftar Hadir...')
console.log('')

/* =====================================================
   KOMPONEN PAGINATION REUSABLE UNTUK ui.jsx
   ===================================================== */
const PAGINATION_COMPONENT = `export function Pagination(props) {
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (totalPages <= 1) return null
  const halaman = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      halaman.push(i)
    } else if (halaman[halaman.length - 1] !== '...') {
      halaman.push('...')
    }
  }
  const dasar = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-semibold transition '
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={function () { onPageChange(page - 1) }}
        className={dasar + 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'}
      >
        Sebelumnya
      </button>
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-slate-400">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={dasar + (aktif ? 'bg-bsi-800 text-white' : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100')}
          >
            {h}
          </button>
        )
      })}
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={function () { onPageChange(page + 1) }}
        className={dasar + 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'}
      >
        Berikutnya
      </button>
    </div>
  )
}`

/* =====================================================
   BLOK KODE YANG DISISIPKAN KE SETIAP HALAMAN
   ===================================================== */
const BLOK_EFFECT = `  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }`

function buatBlokPagination(ns, np) {
  return '  const totalData = ' + ns + '.length\n' +
    '  const totalPages = Math.ceil(totalData / PER_PAGE)\n' +
    '  const pageAman = Math.min(page, Math.max(1, totalPages))\n' +
    '  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1\n' +
    '  const akhir = Math.min(pageAman * PER_PAGE, totalData)\n' +
    '  const ' + np + ' = ' + ns + '.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)'
}

function buatBlokAkhir(label) {
  return '      {!loading && totalData > 0 ? (\n' +
    '        <div className="mt-6 text-center text-sm text-slate-500">\n' +
    '          Menampilkan {mulai} sampai {akhir} dari {totalData} ' + label + '\n' +
    '        </div>\n' +
    '      ) : null}\n' +
    '      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}'
}

/* =====================================================
   LANGKAH 1: PASANG KOMPONEN PAGINATION DI ui.jsx
   ===================================================== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
if (u.includes('export function Pagination')) {
  console.log('[SUDAH ADA] Komponen Pagination di ui.jsx')
} else {
  u = u.trimEnd() + '\n\n' + PAGINATION_COMPONENT + '\n'
  simpan(FILE_U, u)
  console.log('[BERHASIL] Komponen Pagination ditambahkan di ui.jsx')
}

/* =====================================================
   FUNGSI TRANSFORMASI SATU HALAMAN
   ===================================================== */
function transformHalaman(cfg) {
  const rel = cfg.rel
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let berubah = false

  if (isi.includes(', Pagination }') || isi.includes('Pagination,')) {
    console.log('[SUDAH ADA] Import Pagination di ' + rel)
  } else if (isi.includes(cfg.importAsli)) {
    isi = isi.replace(cfg.importAsli, cfg.importBaru)
    berubah = true
    console.log('[BERHASIL] Import Pagination di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor import di ' + rel)
  }

  if (isi.includes('const PER_PAGE')) {
    console.log('[SUDAH ADA] Konstanta PER_PAGE di ' + rel)
  } else if (isi.includes(cfg.initialAnchor)) {
    isi = isi.replace(cfg.initialAnchor, cfg.initialAnchor + '\nconst PER_PAGE = 10')
    berubah = true
    console.log('[BERHASIL] Konstanta PER_PAGE di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor PER_PAGE di ' + rel)
  }

  if (isi.includes('const [page, setPage]')) {
    console.log('[SUDAH ADA] State page di ' + rel)
  } else if (isi.includes(cfg.loadingAnchor)) {
    isi = isi.replace(cfg.loadingAnchor, cfg.loadingAnchor + '\n  const [page, setPage] = useState(1)')
    berubah = true
    console.log('[BERHASIL] State page di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor state page di ' + rel)
  }

  if (isi.includes('function gantiHalaman')) {
    console.log('[SUDAH ADA] Logika gantiHalaman di ' + rel)
  } else if (isi.includes(cfg.filterAnchor)) {
    isi = isi.replace(cfg.filterAnchor, BLOK_EFFECT + '\n' + cfg.filterAnchor)
    berubah = true
    console.log('[BERHASIL] Logika gantiHalaman di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor gantiHalaman di ' + rel)
  }

  if (isi.includes(cfg.namaPaginated)) {
    console.log('[SUDAH ADA] Logika pagination di ' + rel)
  } else if (isi.includes(cfg.sortedAnchor)) {
    isi = isi.replace(cfg.sortedAnchor, cfg.sortedAnchor + '\n' + buatBlokPagination(cfg.namaSorted, cfg.namaPaginated))
    berubah = true
    console.log('[BERHASIL] Logika pagination di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor logika pagination di ' + rel)
  }

  if (isi.includes(cfg.namaPaginated + '.map')) {
    console.log('[SUDAH ADA] Grid memakai ' + cfg.namaPaginated + ' di ' + rel)
  } else if (isi.includes(cfg.mapAsli)) {
    isi = isi.replace(cfg.mapAsli, cfg.mapBaru)
    berubah = true
    console.log('[BERHASIL] Grid memakai ' + cfg.namaPaginated + ' di ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor map grid di ' + rel)
  }

  if (isi.includes('<Pagination totalItems={totalData}')) {
    console.log('[SUDAH ADA] Komponen Pagination di grid ' + rel)
  } else if (isi.includes(cfg.gridAnchor)) {
    isi = isi.replace(cfg.gridAnchor, cfg.gridAnchor + '\n' + buatBlokAkhir(cfg.labelData))
    berubah = true
    console.log('[BERHASIL] Komponen Pagination di grid ' + rel)
  } else {
    console.log('[TIDAK KETEMU] Anchor grid untuk Pagination di ' + rel)
  }

  if (berubah) simpan(rel, isi)
}

/* =====================================================
   LANGKAH 2: TERAPKAN KE TIGA HALAMAN
   ===================================================== */
transformHalaman({
  rel: 'src/pages/LogbookPage.jsx',
  importAsli: "import { EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const logs = all.filter(function (l) {',
  sortedAnchor: '  const sortedLogs = urutkanTanggal(logs, sort)',
  namaSorted: 'sortedLogs',
  namaPaginated: 'paginatedLogs',
  mapAsli: ': sortedLogs.map(function (l) {',
  mapBaru: ': paginatedLogs.map(function (l) {',
  gridAnchor: '        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}\n      </section>',
  labelData: 'logbook'
})
console.log('')
transformHalaman({
  rel: 'src/pages/GalleryPage.jsx',
  importAsli: "import { EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const items = all.filter(function (i) {',
  sortedAnchor: '  const sortedItems = urutkanTanggal(items, sort)',
  namaSorted: 'sortedItems',
  namaPaginated: 'paginatedItems',
  mapAsli: ': sortedItems.map(function (i) {',
  mapBaru: ': paginatedItems.map(function (i) {',
  gridAnchor: '        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}\n      </section>',
  labelData: 'media'
})
console.log('')
transformHalaman({
  rel: 'src/pages/AttendancePage.jsx',
  importAsli: "import { StatCard, EmptyState, Modal } from '../components/ui.jsx'",
  importBaru: "import { StatCard, EmptyState, Modal, Pagination } from '../components/ui.jsx'",
  initialAnchor: "const INITIAL = { mahasiswa: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }",
  loadingAnchor: 'const [loading, setLoading] = useState(true)',
  filterAnchor: '  const rows = all.filter(function (r) {',
  sortedAnchor: '  const sortedRows = urutkanTanggal(rows, sort)',
  namaSorted: 'sortedRows',
  namaPaginated: 'paginatedRows',
  mapAsli: ': sortedRows.map(function (r) {',
  mapBaru: ': paginatedRows.map(function (r) {',
  gridAnchor: '          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}\n        </div>\n      </section>',
  labelData: 'catatan'
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang dipasang oleh script ini:')
console.log('1. Komponen Pagination reusable di ui.jsx dengan tombol Sebelumnya, nomor halaman, dan Berikutnya.')
console.log('2. Setiap halaman menampilkan 10 data per index sesuai konstanta PER_PAGE.')
console.log('3. Halaman otomatis kembali ke index pertama saat filter atau urutan berubah.')
console.log('4. Info rentang data tampil di bawah grid, misalnya Menampilkan 1 sampai 10 dari 25 logbook.')
console.log('5. Ada pengaman pageAman agar tidak error bila index aktif melebihi total halaman setelah filter berubah.')
console.log('6. Tampilan otomatis bergeser halus ke atas setiap kali pindah halaman.')
console.log('')
console.log('Bila ada baris TIDAK KETEMU, kirim baris tersebut ke chat supaya polanya disesuaikan.')