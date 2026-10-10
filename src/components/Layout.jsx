import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../lib/theme.jsx'
import { useAuth, logoutMahasiswa } from '../lib/auth.js'
import { SizedIcon } from './icons.jsx'
import { ConfirmModal } from './ui.jsx'
import { useEffect, useRef, useState } from 'react'
import ChatWidget from './ChatWidget.jsx'

const LINKS = [
  { to: '/', label: 'Beranda' },
  { to: '/logbook', label: 'Logbook' },
  { to: '/galeri', label: 'Galeri' },
  { to: '/absen', label: 'Daftar Hadir' },
  { to: '/dospem', label: 'Tim & Dospem' }
]

function MenuMobile(props) {
  return (
    <div ref={props.menuRef} className={'menu-mobile-wrap xl:hidden' + (props.open ? ' menu-mobile-buka' : '')}>
      <div className="menu-mobile-dalam">
        <div className="menu-mobile-isi border-t border-slate-200 px-4 py-4 space-y-2">
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
  const refMenu = useRef(null)
  const refBtnHamburger = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const isAreaIntern = location.pathname.indexOf('/dashboard') === 0 ||
    location.pathname.indexOf('/qr') === 0

  /* Chat widget tampil di halaman publik saja (bukan area intern) */
  const HALAMAN_PUBLIK = ["/logbook", "/galeri", "/absen", "/dospem", "/tim"]
  const isHalamanPublik = location.pathname === "/" ||
    HALAMAN_PUBLIK.some(function (p) { return location.pathname === p || location.pathname.indexOf(p + "/") === 0 })

  /* menu-auto-close-v1: tutup menu mobile saat user berinteraksi di luar
     area menu atau tombol hamburger. Escape juga menutup menu. */
  useEffect(function () {
    if (!open) return undefined
    function onDocPointer(e) {
      const t = e.target
      if (!t || !t.nodeType) return
      if (refMenu.current && refMenu.current.contains(t)) return
      if (refBtnHamburger.current && refBtnHamburger.current.contains(t)) return
      if (t.closest && t.closest('.theme-toggle-btn')) return
      setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointer, true)
    document.addEventListener('keydown', onKeyDown)
    return function () {
      document.removeEventListener('pointerdown', onDocPointer, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  /* safety net: tutup menu saat rute berubah (misal back/forward browser) */
  useEffect(function () {
    setOpen(false)
  }, [location.pathname])
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
    return 'px-3 py-2 rounded-xl text-sm font-semibold ' + (active ? 'bg-[rgba(39,192,109,.12)] text-[#177c48] dark:bg-[rgba(39,192,109,.18)] dark:text-[#86ecb0]' : 'text-[#5f6f64] hover:bg-[rgba(15,42,29,.06)] dark:text-[#9db4a6] dark:hover:bg-[rgba(234,244,238,.07)]')
  }

  const themeBtn = function (extra) {
    return (
      <button onClick={theme.toggle} className={'theme-toggle-btn rounded-xl border border-slate-300 grid place-items-center hover:bg-slate-100 text-slate-700 ' + (extra || 'h-10 w-10')} title="Ganti Tema">
        <SizedIcon name={theme.dark ? 'sun' : 'moon'} size={18} />
      </button>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-[rgba(255,255,255,.65)] backdrop-blur-[14px] border-b border-slate-200 dark:bg-[rgba(16,42,29,.6)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
<div className="h-10 w-10 rounded-2xl grid place-items-center shadow-md" style={{ background: '#16623c' }}>
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7V17C4 18.1 4.9 19 6 19H18C19.1 19 20 18.1 20 17V7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 7L12 12L20 7" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 12V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</div>
              <div>
                <p className="font-bold leading-none text-slate-900">Portal Magang</p>
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
                  {isAreaIntern ? (
                    <button type="button" onClick={mintaKeluar} className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-100">Keluar</button>
                  ) : null}
                </>
              ) : (
                <Link to="/login" className="px-4 py-2 rounded-xl bg-bsi-800 text-white text-sm font-semibold hover:bg-bsi-900">Masuk</Link>
              )}
            </div>
            <div className="flex xl:hidden items-center gap-2">
              {themeBtn()}
              <button ref={refBtnHamburger} onClick={function () { setOpen(function (o) { return !o }) }} aria-label="Buka Menu" aria-expanded={open} title="Buka Menu" className="h-10 w-10 rounded-xl border border-slate-300 grid place-items-center text-slate-700 hover:bg-slate-100"><SizedIcon name="menu" size={20} /></button>
            </div>
          </div>
        </div>
        <MenuMobile open={open} menuRef={refMenu}>
            {LINKS.map(function (l) {
              return <NavLink key={l.to} to={l.to} end={l.to === '/'} onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm ' + (s.isActive ? 'bg-[rgba(39,192,109,.12)] text-[#177c48] font-bold dark:bg-[rgba(39,192,109,.18)] dark:text-[#86ecb0]' : 'font-semibold text-[#5f6f64] hover:bg-[rgba(15,42,29,.06)] dark:text-[#9db4a6] dark:hover:bg-[rgba(234,244,238,.07)]') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-current" /> : null}<span className="truncate">{l.label}</span></> }}</NavLink>
            })}
            {mahasiswa ? (
              <>
                <NavLink to="/dashboard" onClick={function () { setOpen(false) }} className={function (s) { return 'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold bg-bsi-800 text-white ' + (s.isActive ? 'ring-2 ring-gold-400' : '') }}>{function (s) { return <>{s.isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-gold-400" /> : null}<span className="truncate">Dashboard</span></> }}</NavLink>
                {isAreaIntern ? (
                  <button type="button" onClick={mintaKeluar} className="block w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700">Keluar</button>
                ) : null}
              </>
            ) : (
              <Link to="/login" onClick={function () { setOpen(false) }} className="block px-4 py-3 rounded-xl bg-bsi-800 text-white text-sm font-semibold">Masuk</Link>
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
  confirmLabel="Keluar"
  icon="user"
  tone="netral"
  onCancel={function () { setKonfirmasiKeluar(false) }}
  onConfirm={benarKeluar}
/>
      {isHalamanPublik ? <ChatWidget /> : null}
    </div>
  )
}