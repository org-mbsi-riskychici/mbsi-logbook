import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { mahasiswa: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function LogbookPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('mahasiswa').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(function () {
    setPage(1)
  }, [filter, sort])
  function gantiHalaman(p) {
    setPage(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const logs = all.filter(function (l) {
    if (filter.mahasiswa && l.mahasiswa_id !== filter.mahasiswa) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedLogs = urutkanTanggal(logs, sort)
  const totalData = sortedLogs.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedLogs = sortedLogs.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-5 sm:p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Logbook Publik</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">Catatan Kegiatan Magang</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl sm:mt-3 sm:text-base">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.mahasiswa} onChange={function (v) { setFilter(Object.assign({}, filter, { mahasiswa: v })) }}
            options={[{ value: '', label: 'Semua Mahasiswa' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua Kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
          : paginatedLogs.map(function (l) {
              return (
                <div key={l.id} className="kolom-kartu">
                  <LogbookCard log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                    onDetail={function () { setDetail(l) }} />
                </div>
              )
            })}
        {!loading && !logs.length ? <div className="w-full"><EmptyState title="Logbook Tidak Ditemukan" desc="Coba reset filter atau pilih filter lain." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-600">
          Total {totalData} logbook{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}