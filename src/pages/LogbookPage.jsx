import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

const INITIAL = { peserta: '', kategori: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function LogbookPage() {
  const { peserta } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, peserta(nim, nama, prodi), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const p = await supabase.from('peserta').select('id, nama').order('nama')
      setAll(l.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const logs = all.filter(function (l) {
    if (filter.peserta && l.peserta_id !== filter.peserta) return false
    if (filter.kategori && l.kategori !== filter.kategori) return false
    return matchesDateFilters(l.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Logbook publik</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Catatan kegiatan magang</h1>
        <p className="mt-3 text-slate-600 max-w-2xl">Satu logbook mewakili satu hari kerja dan bisa berisi beberapa kegiatan.</p>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.peserta} onChange={function (v) { setFilter(Object.assign({}, filter, { peserta: v })) }}
            options={[{ value: '', label: 'Semua peserta' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.tag} value={filter.kategori} onChange={function (v) { setFilter(Object.assign({}, filter, { kategori: v })) }}
            options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonLogbookCard key={i} /> })
          : logs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner={peserta && peserta.id === l.peserta_id}
                onDetail={function () { setDetail(l) }} />
            })}
        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}