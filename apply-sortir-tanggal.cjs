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

console.log('Mulai memasang fitur sortir Terbaru dan Terlama...')
console.log('')

/* ===== 1. Icon sort di icons.jsx ===== */
ganti(
  'src/components/icons.jsx',
  `  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  )
}`,
  `  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  ),
  sort: (
    <>
      <path d="M3 6h13" />
      <path d="M3 12h9" />
      <path d="M3 18h5" />
      <path d="M17 6v12" />
      <path d="m14 15 3 3 3-3" />
    </>
  )
}`,
  'Icon sort ditambahkan'
)

/* ===== 2. Fungsi urutkanTanggal di format.js ===== */
ganti(
  'src/lib/format.js',
  `  return true
}`,
  `  return true
}
export function urutkanTanggal(rows, mode) {
  const salin = (rows || []).slice()
  salin.sort(function (a, b) {
    const da = a.tanggal || ''
    const db = b.tanggal || ''
    if (da === db) return 0
    if (mode === 'terlama') return da < db ? -1 : 1
    return da < db ? 1 : -1
  })
  return salin
}`,
  'Fungsi urutkanTanggal ditambahkan'
)

/* ===== 3. Komponen SortSelect di FilterBar.jsx ===== */
ganti(
  'src/components/FilterBar.jsx',
  `export function countActiveFilters(o) {`,
  `export function SortSelect(props) {
  return (
    <CustomSelect
      icon={ICONS.sort}
      value={props.value}
      onChange={props.onChange}
      options={[{ value: 'terbaru', label: 'Terbaru' }, { value: 'terlama', label: 'Terlama' }]}
      className="min-w-[150px]"
      buttonCls="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-bsi-500"
    />
  )
}
export function countActiveFilters(o) {`,
  'Komponen SortSelect ditambahkan'
)

/* ===== 4. Halaman Logbook publik ===== */
ganti('src/pages/LogbookPage.jsx',
  `import { matchesDateFilters } from '../lib/format.js'`,
  `import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'`,
  'LogbookPage import urutkanTanggal')
ganti('src/pages/LogbookPage.jsx',
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'`,
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'`,
  'LogbookPage import SortSelect')
ganti('src/pages/LogbookPage.jsx',
  `  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)`,
  `  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)`,
  'LogbookPage state sort')
ganti('src/pages/LogbookPage.jsx',
  `  const active = countActiveFilters(filter)`,
  `  const active = countActiveFilters(filter)
  const sortedLogs = urutkanTanggal(logs, sort)`,
  'LogbookPage daftar tersortir')
ganti('src/pages/LogbookPage.jsx',
  `: logs.map(function (l) {`,
  `: sortedLogs.map(function (l) {`,
  'LogbookPage grid memakai daftar tersortir')
ganti('src/pages/LogbookPage.jsx',
  `          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>`,
  `          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>`,
  'LogbookPage menampilkan SortSelect')

/* ===== 5. Halaman Galeri publik ===== */
ganti('src/pages/GalleryPage.jsx',
  `import { matchesDateFilters } from '../lib/format.js'`,
  `import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'`,
  'GalleryPage import urutkanTanggal')
ganti('src/pages/GalleryPage.jsx',
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'`,
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'`,
  'GalleryPage import SortSelect')
ganti('src/pages/GalleryPage.jsx',
  `  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)`,
  `  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)`,
  'GalleryPage state sort')
ganti('src/pages/GalleryPage.jsx',
  `  const active = countActiveFilters(filter)`,
  `  const active = countActiveFilters(filter)
  const sortedItems = urutkanTanggal(items, sort)`,
  'GalleryPage daftar tersortir')
ganti('src/pages/GalleryPage.jsx',
  `: items.map(function (i) {`,
  `: sortedItems.map(function (i) {`,
  'GalleryPage grid memakai daftar tersortir')
ganti('src/pages/GalleryPage.jsx',
  `          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>`,
  `          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>`,
  'GalleryPage menampilkan SortSelect')

/* ===== 6. Halaman Daftar Hadir publik ===== */
ganti('src/pages/AttendancePage.jsx',
  `import { matchesDateFilters } from '../lib/format.js'`,
  `import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'`,
  'AttendancePage import urutkanTanggal')
ganti('src/pages/AttendancePage.jsx',
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'`,
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'`,
  'AttendancePage import SortSelect')
ganti('src/pages/AttendancePage.jsx',
  `  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)`,
  `  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)`,
  'AttendancePage state sort')
ganti('src/pages/AttendancePage.jsx',
  `  const active = countActiveFilters(filter)`,
  `  const active = countActiveFilters(filter)
  const sortedRows = urutkanTanggal(rows, sort)`,
  'AttendancePage daftar tersortir')
ganti('src/pages/AttendancePage.jsx',
  `: rows.map(function (r) {`,
  `: sortedRows.map(function (r) {`,
  'AttendancePage grid memakai daftar tersortir')
ganti('src/pages/AttendancePage.jsx',
  `          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>`,
  `          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>`,
  'AttendancePage menampilkan SortSelect')

/* ===== 7. Dashboard: ketiga tab ===== */
ganti('src/pages/DashboardPage.jsx',
  `import { todayInput, detectMediaType, matchesDateFilters } from '../lib/format.js'`,
  `import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'`,
  'Dashboard import urutkanTanggal')
ganti('src/pages/DashboardPage.jsx',
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'`,
  `import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'`,
  'Dashboard import SortSelect')
ganti('src/pages/DashboardPage.jsx',
  `  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)`,
  `  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)
  const [sort, setSort] = useState('terbaru')`,
  'Dashboard state sort')
ganti('src/pages/DashboardPage.jsx',
  `  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })`,
  `  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })
  const sortedLogs = urutkanTanggal(filteredLogs, sort)`,
  'Dashboard logbook tersortir')
ganti('src/pages/DashboardPage.jsx',
  `  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })`,
  `  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })
  const sortedGaleri = urutkanTanggal(filteredGaleri, sort)`,
  'Dashboard galeri tersortir')
ganti('src/pages/DashboardPage.jsx',
  `  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })`,
  `  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })
  const sortedHadir = urutkanTanggal(filteredHadir, sort)`,
  'Dashboard daftar hadir tersortir')
ganti('src/pages/DashboardPage.jsx',
  `{filteredLogs.map(function (l) {`,
  `{sortedLogs.map(function (l) {`,
  'Dashboard grid logbook tersortir')
ganti('src/pages/DashboardPage.jsx',
  `{filteredGaleri.map(function (g) {`,
  `{sortedGaleri.map(function (g) {`,
  'Dashboard grid galeri tersortir')
ganti('src/pages/DashboardPage.jsx',
  `{filteredHadir.map(function (h) {`,
  `{sortedHadir.map(function (h) {`,
  'Dashboard grid hadir tersortir')
ganti('src/pages/DashboardPage.jsx',
  `              <TimeFilter filter={logFilter} set={setLogFilter} />
            </FilterBar>`,
  `              <TimeFilter filter={logFilter} set={setLogFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>`,
  'Dashboard tab logbook menampilkan SortSelect')
ganti('src/pages/DashboardPage.jsx',
  `              <TimeFilter filter={galFilter} set={setGalFilter} />
            </FilterBar>`,
  `              <TimeFilter filter={galFilter} set={setGalFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>`,
  'Dashboard tab galeri menampilkan SortSelect')
ganti('src/pages/DashboardPage.jsx',
  `              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
            </FilterBar>`,
  `              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
              <SortSelect value={sort} onChange={setHadirFilterOpen && setSort ? setSort : setSort} />
            </FilterBar>`,
  'Dashboard tab hadir menampilkan SortSelect')

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman Logbook, Galeri, dan Daftar Hadir: ada dropdown sortir berisi Terbaru dan Terlama.')
console.log('2. Nilai bawaan Terbaru, urutan sama seperti sebelumnya.')
console.log('3. Pilih Terlama: daftar berubah mulai dari tanggal paling awal.')
console.log('4. Kombinasi dengan filter dan reset: sortir tidak ikut terreset dan tidak dihitung sebagai filter aktif.')
console.log('5. Ulangi uji yang sama pada ketiga tab di Dashboard.')