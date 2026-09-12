import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonStatCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { peserta } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, peserta: 0 })
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
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('peserta').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, peserta: (p.data || []).length })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-4 py-2 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wide">Magang Bank BSI</span>
            <h1 className="mt-6 text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-5 max-w-2xl text-white/80 leading-relaxed">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/logbook" className="px-6 py-3 rounded-2xl bg-gold-500 text-slate-900 font-bold hover:bg-gold-400">Lihat Logbook</Link>
              <Link to="/galeri" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Lihat Galeri</Link>
              <Link to="/absen" className="px-6 py-3 rounded-2xl bg-white/10 text-white font-bold hover:bg-white/20">Daftar Hadir</Link>
              {peserta
                ? <Link to="/dashboard" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Buka Dashboard</Link>
                : <Link to="/login" className="px-6 py-3 rounded-2xl bg-white text-bsi-900 font-bold hover:bg-slate-100">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="peserta" label="Total peserta magang" value={stats.peserta} sub="Peserta terdaftar dalam tim" />,
                <StatCard key="logbook" label="Total logbook publik" value={stats.logbook} sub="Catatan kegiatan harian" />,
                <StatCard key="galeri" label="Total media galeri" value={stats.galeri} sub="Foto dan video dokumentasi" />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600">Kegiatan terbaru</p>
            <h2 className="mt-2 text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.slice(0, 3).map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}