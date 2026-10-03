import { urutkanTanggal } from '../lib/format.js'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { EmptyState, Modal } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail } from '../components/cards.jsx'
import { SkeletonLogbookCard } from '../components/Skeleton.jsx'

export default function HomePage() {
  const { mahasiswa } = useAuth()
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState({ logbook: 0, galeri: 0, mahasiswa: 0 })
  const [hadir, setHadir] = useState({ masuk: 0, izin: 0, bolos: 0 })
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
      const h = await supabase.from('daftar_hadir').select('status')
      const hitung = { masuk: 0, izin: 0, bolos: 0 }
      const rows = h.data || []
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].status === 'Masuk') hitung.masuk += 1
        else if (rows[i].status === 'Izin') hitung.izin += 1
        else if (rows[i].status === 'Bolos') hitung.bolos += 1
      }
      setLogs(l.data || [])
      setStats({ logbook: (l.data || []).length, galeri: (g.data || []).length, mahasiswa: (p.data || []).length })
      setHadir(hitung)
      setLoading(false)
    }
    load()
  }, [])

  const totalHadir = hadir.masuk + hadir.izin + hadir.bolos
  const persenMasuk = totalHadir ? Math.round((hadir.masuk / totalHadir) * 100) : 0
  const lebarMasuk = totalHadir ? (hadir.masuk / totalHadir) * 100 : 0
  const lebarIzin = totalHadir ? (hadir.izin / totalHadir) * 100 : 0
  const lebarBolos = totalHadir ? (hadir.bolos / totalHadir) * 100 : 0

  return (
    <div>
      <section className="bsi-hero bsi-shadow relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
        <span className="bsi-chip bsi-chip-green bsi-chip-c1">▦</span>
        <span className="bsi-chip bsi-chip-gold bsi-chip-c2">▶</span>
        <span className="bsi-chip bsi-chip-deep bsi-chip-c3">✦</span>
        <div className="relative z-10 flex items-start gap-10">
          <div className="min-w-0 flex-1">
            <span className="bsi-pill">✦ Magang Bank BSI</span>
            <h1 className="mt-5 max-w-2xl text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-5xl">
              Logbook, Galeri, dan Daftar Hadir Magang dalam <span className="bsi-grad-text">Satu Portal</span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base">
              Portal ini mencatat kegiatan harian, dokumentasi media, dan kehadiran tim magang selama membantu operasional Bank BSI.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 sm:mt-8 sm:gap-3">
              <Link to="/logbook" className="inline-flex items-center gap-2 rounded-2xl bg-bsi-800 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-bsi-900 sm:px-6 sm:text-base">Lihat Logbook</Link>
              <Link to="/galeri" className="bsi-btn-glass">Lihat Galeri</Link>
              <Link to="/absen" className="bsi-btn-glass">Daftar Hadir</Link>
              {mahasiswa
                ? <Link to="/dashboard" className="bsi-btn-white">Buka Dashboard</Link>
                : <Link to="/login" className="bsi-btn-white">Masuk Akun</Link>}
            </div>
          </div>
          <div className="bsi-hero-art hidden shrink-0 items-start gap-4 xl:flex">
            <div className="bsi-mini-card bsi-mini-green">
              <p className="text-xs font-bold opacity-80">LOGBOOK PUBLIK</p>
              <p className="mt-1 text-3xl font-black">{loading ? '—' : stats.logbook}</p>
              <p className="mt-2 text-xs opacity-75">{loading ? 'Memuat data...' : stats.galeri + ' media di galeri'}</p>
            </div>
            <div className="bsi-mini-card bsi-mini-white">
              <p className="text-xs font-bold opacity-80">KEHADIRAN TIM</p>
              <p className="mt-1 text-3xl font-black">{loading ? '—' : persenMasuk + '%'}</p>
              <div className="bsi-stack">
                <i style={{ width: lebarMasuk + '%', background: '#10b981' }}></i>
                <i style={{ width: lebarIzin + '%', background: '#f59e0b' }}></i>
                <i style={{ width: lebarBolos + '%', background: '#ef4444' }}></i>
              </div>
              <p className="mt-2 text-xs opacity-75">Masuk {hadir.masuk} • Izin {hadir.izin} • Bolos {hadir.bolos}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading
          ? [0, 1, 2].map(function (i) {
              return (
                <div key={i} className="bsi-stat">
                  <div className="skeleton h-3 w-24 rounded-full"></div>
                  <div className="skeleton mt-2 h-8 w-16 rounded-full"></div>
                  <div className="skeleton mt-2 h-3 w-32 rounded-full"></div>
                </div>
              )
            })
          : [
              <div key="mahasiswa" className="bsi-stat">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Total Mahasiswa</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{stats.mahasiswa}</p>
                <p className="mt-1 text-xs text-slate-500">Mahasiswa terdaftar dalam tim</p>
              </div>,
              <div key="logbook" className="bsi-stat">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Logbook Publik</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{stats.logbook}</p>
                <p className="mt-1 text-xs text-slate-500">Catatan kegiatan harian</p>
              </div>,
              <div key="galeri" className="bsi-stat">
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Media Galeri</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{stats.galeri}</p>
                <p className="mt-1 text-xs text-slate-500">Foto dan video dokumentasi</p>
              </div>
            ]}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-600 dark:text-gold-400">Kegiatan terbaru</p>
            <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-black text-slate-900">Logbook Terbaru Tim</h2>
          </div>
          <Link to="/logbook" className="text-sm font-semibold text-bsi-800 hover:text-bsi-950">Lihat Semua Logbook</Link>
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
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum Ada Logbook Publik" desc="Logbook yang sudah dibagikan akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-xl bg-bsi-800 px-5 py-2.5 text-xs font-bold text-white hover:bg-bsi-900 sm:rounded-2xl sm:px-6 sm:py-3 sm:text-sm">Lihat Semua Logbook</Link>
        </div>
      </section>

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail ? <LogbookDetail log={detail} /> : null}
      </Modal>
    </div>
  )
}