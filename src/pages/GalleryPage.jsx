import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal, Pagination } from '../components/ui.jsx'
import { GalleryCard, GalleryDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { GALERI_KEGIATAN } from '../lib/constants.js'
import { SkeletonGalleryCard } from '../components/Skeleton.jsx'

const INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE = 12

export default function GalleryPage() {
  const { mahasiswa } = useAuth()
  const [all, setAll] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [sort, setSort] = useState('terbaru')
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(function () {
    async function load() {
      const g = await supabase.from('galeri').select('*, mahasiswa(*)').order('tanggal', { ascending: false })
      setAll(g.data || [])
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
  const items = all.filter(function (i) {
    if (filter.kegiatan && (i.kegiatan || 'Lainnya') !== filter.kegiatan) return false
    if (filter.tipe && i.media_type !== filter.tipe) return false
    return matchesDateFilters(i.tanggal, filter)
  })
  const active = countActiveFilters(filter)
  const sortedItems = urutkanTanggal(items, sort)
  const totalData = sortedItems.length
  const totalPages = Math.ceil(totalData / PER_PAGE)
  const pageAman = Math.min(page, Math.max(1, totalPages))
  const mulai = totalData === 0 ? 0 : (pageAman - 1) * PER_PAGE + 1
  const akhir = Math.min(pageAman * PER_PAGE, totalData)
  const paginatedItems = sortedItems.slice((pageAman - 1) * PER_PAGE, pageAman * PER_PAGE)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Galeri dokumentasi</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Foto dan video kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Setiap kartu mewakili satu kegiatan. Klik media untuk melihat detail.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.tag} value={filter.kegiatan} onChange={function (v) { setFilter(Object.assign({}, filter, { kegiatan: v })) }}
            options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
          <FilterSelect icon={ICONS.image} value={filter.tipe} onChange={function (v) { setFilter(Object.assign({}, filter, { tipe: v })) }}
            options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
          <TimeFilter filter={filter} set={setFilter} />
          <SortSelect value={sort} onChange={setSort} />
        </FilterBar>
      </section>

      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonGalleryCard /></div> })
          : paginatedItems.map(function (i) {
              return (
                <div key={i.id} className="kolom-kartu">
                  <GalleryCard item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                    onDetail={function () { setDetail(i) }} />
                </div>
              )
            })}
        {!loading && !items.length ? <div className="w-full"><EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /></div> : null}
      </section>
      {!loading && totalData > 0 ? (
        <div className="mt-6 text-center text-sm text-slate-500">
          Total {totalData} media{totalPages > 1 ? ' • Halaman ' + pageAman + ' dari ' + totalPages : ''}
        </div>
      ) : null}
      {!loading ? <Pagination totalItems={totalData} perPage={PER_PAGE} page={pageAman} onPageChange={gantiHalaman} /> : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <GalleryDetail item={detail} /> : null}
      </Modal>
    </div>
  )
}