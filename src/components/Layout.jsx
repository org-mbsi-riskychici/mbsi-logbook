import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { ConfirmModal } from './ui.jsx'
import { useEffect, useState } from 'react'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Tim & Dospem' }
]

function MenuMobile(props) {
  return (
    <div className={'menu-mobile-wrap xl:hidden' + (props.open ? ' menu-mobile-buka' : '')}>
      <div className="menu-mobile-dalam">
        <div className="menu-mobile-isi border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {props.children}
        </div>
      </div>
    </div>
  )
}
export default function Layout() {
  const theme = useTheme()
  const { mahasiswa } = useAuth()
  const [open, setOpen] = useState(false)
  const [konfirmasiKeluar, setKonfirmasiKeluar] = useState(false)
  const navigate = useNavigate()
  function mintaKeluar(e) {
    e.preventDefault()
    setOpen(false)
    setKonfirmasiKeluar(true)
  }
  async function benarKeluar() {
    setKonfirmasiKeluar(false)
    await logoutMahasiswa()
    navigate('/')
  }

  const linkCls = function (active) {
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-bsi-900 text-white' : 'text-slate-600 hover:bg-slate-100')
  }

  const themeBtn = function (extra) {
    return (
      <button onClick={theme.toggle} className={'rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100 text-slate-700 ' + (extra || 'h-10 w-10')} title="Ganti Tema">
        <SizedIcon name={theme.dark ? 'sun' : 'moon'} size={18} />
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-bsi-800 to-gold-500 text-white grid place-items-center font-black">BSI</div>
              <div>
                <p className="font-bold leading-none text-slate-900">Logbook Magang</p>
                <p className="text-xs text-slate-600 mt-1">Bank Syariah Indonesia</p>
              </div>
            </Link>
            <nav className="hidden xl:flex items-center gap-1">
              {LINKS.map(function (l) {
                return <NavLink key={l.to} to={l.to} end={l.to === '/'} className={function (s) { return linkCls(s.isActive) }}>{l.label}</NavLink>
              })}
            </nav>
            <div className="hidden xl:flex items-center gap-3">
              {themeBtn()}
              {mahasiswa ? (
                <>
                  <Link to="/dashboard" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Dashboard</Link>
                  <button type="button" onClick={mintaKeluar} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</button>
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700">Masuk Intern</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              {themeBtn()}
              <button onClick={function () { setOpen(function (o) { return !o }) }} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Menu</button>
            </div>
          </div>
        </div>
        <MenuMobile open={open}>
            {LINKS.map(function (l) {
              return <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ' + (s.isActive ? 'bg-bsi-100 text-bsi-900 font-bold ring-1 ring-bsi-200 dark:ring-bsi-500/40' : 'font-semibold text-slate-600 hover:bg-slate-100') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-current" /> : null}<span className="truncate">{l.label}</span></> }}</NavLink>
            })}
            {mahasiswa ? (
              <>
                <NavLink to="/dashboard" onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold bg-bsi-800 text-white ' + (s.isActive ? 'ring-2 ring-gold-400' : '') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" /> : null}<span className="truncate">Dashboard</span></> }}</NavLink>
                <button type="button" onClick={mintaKeluar} className="block w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</button>
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Masuk Intern</Link>
            )}
        </MenuMobile>
      </header>

      <main className="anim-page max-w-7xl mx-auto px-4 py-8 lg:py-10 flex-1 w-full">
        <Outlet />
      </main>

      <footer className="footer-ramping border-t border-slate-200 bg-white">
<div className="mx-auto max-w-7xl px-4 py-4 text-center">
<p className="text-xs text-slate-600">© 2026 Tim Magang BSI</p>
</div>
</footer>
<ConfirmModal
  open={konfirmasiKeluar}
  title="Keluar dari Akun?"
  message="Sesi login kamu akan berakhir dan area intern tidak bisa diakses sampai kamu masuk lagi. Data yang sudah disimpan tetap aman."
  confirmLabel="Ya, Keluar"
  icon="user"
  tone="netral"
  onCancel={function () { setKonfirmasiKeluar(false) }}
  onConfirm={benarKeluar}
/>
    </div>
  )
}