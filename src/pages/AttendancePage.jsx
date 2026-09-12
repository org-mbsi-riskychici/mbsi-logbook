import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters } from '../components/FilterBar.jsx'
import { ICONS } from '../components/icons.jsx'
import { matchesDateFilters } from '../lib/format.js'
import { SkeletonStatCard, SkeletonChartRow, SkeletonAttendanceCard } from '../components/Skeleton.jsx'

const INITIAL = { peserta: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }

export default function AttendancePage() {
  const { peserta } = useAuth()
  const [all, setAll] = useState([])
  const [people, setPeople] = useState([])
  const [filter, setFilter] = useState(INITIAL)
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const a = await supabase.from('daftar_hadir').select('*, peserta(nim, nama, prodi)').order('tanggal', { ascending: false })
      const p = await supabase.from('peserta').select('id, nama').order('nama')
      setAll(a.data || [])
      setPeople(p.data || [])
      setLoading(false)
    }
    load()
  }, [])

  const rows = all.filter(function (r) {
    if (filter.peserta && r.peserta_id !== filter.peserta) return false
    if (filter.status && r.status !== filter.status) return false
    return matchesDateFilters(r.tanggal, filter)
  })
  const active = countActiveFilters(filter)

  const counts = rows.reduce(function (acc, r) {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const perPerson = people.map(function (p) {
    const mine = rows.filter(function (r) { return r.peserta_id === p.id })
    const c = mine.reduce(function (acc, r) { acc[r.status] = (acc[r.status] || 0) + 1; return acc }, {})
    return { nama: p.nama, nim: p.nim, Masuk: c.Masuk || 0, Izin: c.Izin || 0, Bolos: c.Bolos || 0, total: mine.length }
  })
  const maxTotal = Math.max.apply(null, perPerson.map(function (p) { return p.total }).concat([1]))

  return (
    <div>
      <section className="rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Daftar hadir</p>
        <h1 className="mt-2 text-3xl lg:text-4xl font-black text-slate-900">Monitoring kehadiran tim magang</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading
            ? [0, 1, 2, 3].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="total" label="Total catatan hadir" value={rows.length} sub="Sesuai filter aktif" />,
                <StatCard key="masuk" label="Masuk" value={counts.Masuk || 0} sub="Peserta hadir" />,
                <StatCard key="izin" label="Izin" value={counts.Izin || 0} sub="Dengan keterangan" />,
                <StatCard key="bolos" label="Bolos" value={counts.Bolos || 0} sub="Tanpa keterangan" />
              ]}
        </div>
      </section>

      <section className="mt-6">
        <FilterBar open={open} onToggle={function () { setOpen(function (o) { return !o }) }} activeCount={active}
          onReset={function () { setFilter(INITIAL) }}>
          <FilterSelect icon={ICONS.user} value={filter.peserta} onChange={function (v) { setFilter(Object.assign({}, filter, { peserta: v })) }}
            options={[{ value: '', label: 'Semua peserta' }].concat(people.map(function (p) { return { value: p.id, label: p.nama } }))} />
          <FilterSelect icon={ICONS.check} value={filter.status} onChange={function (v) { setFilter(Object.assign({}, filter, { status: v })) }}
            options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
          <TimeFilter filter={filter} set={setFilter} />
        </FilterBar>
      </section>

      <section className="mt-8 card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-900">Grafik kehadiran per peserta</h2>
          <div className="flex flex-wrap gap-3 text-xs font-semibold">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" />Masuk</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" />Izin</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" />Bolos</span>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonChartRow key={i} /> })
            : perPerson.map(function (p) {
                return (
                  <div key={p.nim} className="card-hover rounded-[1.5rem] border border-slate-200 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{p.nama}</p>
                        <p className="text-xs text-slate-500">NIM {p.nim}</p>
                      </div>
                      <div className="text-xs text-slate-500">Masuk: {p.Masuk} | Izin: {p.Izin} | Bolos: {p.Bolos}</div>
                    </div>
                    <div className="mt-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="bg-emerald-500 transition-all duration-500" style={{ width: (p.Masuk / maxTotal) * 100 + '%' }} />
                      <div className="bg-amber-500 transition-all duration-500" style={{ width: (p.Izin / maxTotal) * 100 + '%' }} />
                      <div className="bg-red-500 transition-all duration-500" style={{ width: (p.Bolos / maxTotal) * 100 + '%' }} />
                    </div>
                  </div>
                )
              })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Daftar kehadiran sesuai filter</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonAttendanceCard key={i} /> })
            : rows.map(function (r) {
                return <AttendanceCard key={r.id} row={r} isOwner={peserta && peserta.id === r.peserta_id}
                  onDetail={function () { setDetail(r) }} />
              })}
          {!loading && !rows.length ? <EmptyState title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah peserta mengisi daftar hadir." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <AttendanceDetail row={detail} /> : null}
      </Modal>
    </div>
  )
}