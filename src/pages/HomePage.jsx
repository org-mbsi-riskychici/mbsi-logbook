import { urutkanTanggal } from '../lib/format.js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { StatCard, EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard, SkeletonStatCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { mahasiswa } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, mahasiswa: 0 })
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    async function load() {
      const l = await supabase
        .from('logbooks')
        .select('*, mahasiswa(*), logbook_items(*)')
        .eq('status', 'publik')
        .order('tanggal', { ascending: false })
        .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
      const g = await supabase.from('galeri').select('id')
      const p = await supabase.from('mahasiswa').select('id')
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, mahasiswa: (p.data || []).length })
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
        <div className="card-hover relative overflow-hidden rounded-[2rem] bg-bsi-900 text-white p-5 sm:p-8 lg:p-12">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-500/20 blur-2xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-emerald-300/10 blur-2xl" />
          <div className="relative z-10">
            <span className="inline-flex px-3 py-1.5 rounded-full bg-white/10 text-[10px] font-semibold uppercase tracking-wide sm:px-4 sm:py-2 sm:text-xs">Magang Bank BSI</span>
            <h1 className="mt-6 text-2xl sm:text-3xl lg:text-5xl font-black leading-tight max-w-2xl">Logbook, Galeri, dan Daftar Hadir Magang dalam Satu Portal</h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:mt-5 sm:text-base">Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.</p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <Link to="/logbook" className="px-4 py-2.5 rounded-xl bg-gold-500 text-slate-900 text-sm font-bold hover:bg-gold-400 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Lihat Logbook</Link>
              <Link to="/galeri" className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Lihat Galeri</Link>
              <Link to="/absen" className="px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="px-4 py-2.5 rounded-xl bg-[#ffffff] text-[#135033] text-sm font-bold hover:bg-[#f1f5f9] sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Buka Dashboard</Link>
                : <Link to="/login" className="px-4 py-2.5 rounded-xl bg-[#ffffff] text-[#135033] text-sm font-bold hover:bg-[#f1f5f9] sm:px-6 sm:py-3 sm:rounded-2xl sm:text-base">Masuk Intern</Link>}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1 lg:gap-4">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonStatCard key={i} /> })
            : [
                <StatCard key="mahasiswa" label="Total mahasiswa magang" labelRapat="Mahasiswa" value={stats.mahasiswa} sub="Mahasiswa terdaftar dalam tim" rapat />,
                <StatCard key="logbook" label="Total logbook publik" labelRapat="Logbook" value={stats.logbook} sub="Catatan kegiatan harian" rapat />,
                <StatCard key="galeri" label="Total media galeri" labelRapat="Media" value={stats.galeri} sub="Foto dan video dokumentasi" rapat />
              ]}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-400">Kegiatan terbaru</p>
            <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Logbook terbaru tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat semua logbook</Link>
        </div>
        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : urutkanTanggal(logs, 'terbaru').slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah berstatus Published akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm">Lihat semua logbook</Link>
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}