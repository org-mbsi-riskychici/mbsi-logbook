import { createPortal } from 'react-dom'
import PemutarVideo from './PemutarVideo.jsx'
import { drivePreviewUrl, driveDownloadUrl, driveThumbUrl } from '../lib/drive.js'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { SizedIcon } from './icons.jsx'
function useBodyScrollLock(active) {
  useEffect(function () {
    if (!active) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return function () {
      document.body.style.overflow = previous
    }
  }, [active])
}


export const inputCls = 'mt-1.5 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-bsi-500'
export const labelCls = 'text-sm font-semibold text-slate-700'
export const btnPrimary = 'w-full rounded-xl bg-bsi-800 px-5 py-3 text-sm sm:rounded-2xl sm:px-6 sm:py-4 sm:text-base text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-3.5 py-2 rounded-lg text-xs sm:px-4 sm:py-2 sm:rounded-xl sm:text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  const rapat = props.rapat
  const clsWadah = rapat ? ' p-3 sm:p-6' : ' p-4 sm:p-6'
  const clsLabel = (rapat ? 'text-[11px] leading-snug sm:text-sm' : 'text-xs sm:text-sm') + ' text-slate-600'
  const clsLabelRapat = 'text-[11px] leading-snug font-semibold text-slate-600 sm:hidden'
  const clsValue = (rapat ? 'mt-1 text-xl sm:text-3xl' : 'mt-2 text-2xl sm:text-3xl') + ' font-black text-bsi-900'
  const clsSub = (rapat ? 'hidden sm:block ' : '') + 'mt-1 text-[11px] leading-snug sm:text-xs text-slate-600'
  return (
    <div className={cardCls + clsWadah}>
      {props.labelRapat ? <p className={clsLabelRapat}>{props.labelRapat}</p> : null}
      <p className={clsLabel + (props.labelRapat ? ' hidden sm:block' : '')}>{props.label}</p>
      <p className={clsValue}>{props.value}</p>
      {props.sub ? <p className={clsSub}>{props.sub}</p> : null}
    </div>
  )
}
export function EmptyState(props) {
  return (
    <div className={cardCls + ' border-dashed p-10 text-center'}>
      <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
        <SizedIcon name={props.icon || 'file'} size={24} />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-800">{props.title}</h3>
      <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Published' : 'Draft'}
    </span>
  )
}

export function CategoryBadge(props) {
  return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bsi-100 text-bsi-900">{props.value || 'Lainnya'}</span>
}

export function AttendanceBadge(props) {
  const map = {
    Masuk: 'bg-emerald-100 text-emerald-800',
    Izin: 'bg-amber-100 text-amber-800',
    Bolos: 'bg-red-100 text-red-700'
  }
  return <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (map[props.status] || 'bg-slate-100 text-slate-700')}>{props.status}</span>
}

export function Modal(props) {
  const [tampil, setTampil] = useState(props.open)
  const [tutup, setTutup] = useState(false)
  const isiSimpan = useRef(null)
  if (props.open) isiSimpan.current = props.children
  useBodyScrollLock(!!props.open)
  useEffect(function () {
    if (props.open) {
      setTampil(true)
      setTutup(false)
      return undefined
    }
    if (!tampil) return undefined
    setTutup(true)
    const t = setTimeout(function () {
      setTampil(false)
      setTutup(false)
    }, 200)
    return function () { clearTimeout(t) }
  }, [props.open])
  if (!tampil) return null
  return (
    <div className={'anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4' + (tutup ? ' modal-tutup' : '')} onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl max-h-[88vh] overflow-y-auto overscroll-contain" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} aria-label="Tutup detail" className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.open ? props.children : isiSimpan.current}</div>
        </div>
      </div>
    </div>
  )
}

export function AutoTextArea(props) {
  const ref = useRef(null)

  useEffect(function () {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [props.value])

  return (
    <textarea
      ref={ref}
      className={props.className}
      rows={props.rows || 2}
      value={props.value}
      placeholder={props.placeholder}
      onChange={props.onChange}
      disabled={props.disabled || false}
    />
  )
}

export function ConfirmModal(props) {
const [tampil, setTampil] = useState(props.open)
const propsSimpan = useRef(null)
if (props.open) propsSimpan.current = props
const p = props.open ? props : (propsSimpan.current || props)
const tutup = tampil && !props.open
useBodyScrollLock(!!props.open)
useEffect(function () {
if (props.open) { setTampil(true); return undefined }
if (!tampil) return undefined
const t = setTimeout(function () { setTampil(false) }, 200)
return function () { clearTimeout(t) }
}, [props.open, tampil])
if (!tampil) return null
return (
<div className={'anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4' + (tutup ? ' modal-tutup' : '')} onClick={p.onCancel}>
<div className="min-h-full flex items-center justify-center py-8">
<div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
<div className="p-6 space-y-4">
<div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
<SizedIcon name="trash" size={24} />
</div>
<div className="text-center">
<h3 className="text-xl font-black text-slate-900">{p.title || 'Hapus data ini?'}</h3>
<p className="mt-2 text-sm text-slate-600">{p.message}</p>
</div>
<div className="grid grid-cols-2 gap-3">
<button type="button" onClick={p.onCancel} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
Batal
</button>
<button type="button" onClick={p.onConfirm} className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
{p.confirmLabel || 'Ya, Hapus'}
</button>
</div>
</div>
</div>
</div>
</div>
)
}


export function MediaDrive(props) {
  const [gagal, setGagal] = useState(false)
  useEffect(function () {
    setGagal(false)
  }, [props.driveId])
  if (gagal) {
    return (
      <div className={'grid place-items-center bg-gradient-to-br from-slate-800 to-slate-900 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-300">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
            <SizedIcon name="image" size={22} />
          </span>
          <p className="px-2 text-center text-[11px] font-semibold">Video Google Drive</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={driveThumbUrl(props.driveId)}
      alt={props.alt || 'Video Google Drive'}
      onClick={props.onClick || undefined}
      onError={function () { setGagal(true) }} loading="lazy" decoding="async"
      className={(props.className || 'absolute inset-0 h-full w-full object-cover') + (props.onClick ? ' cursor-zoom-in' : '')}
    />
  )
}
export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  const [tutup, setTutup] = useState(false)
  const sedangTutup = useRef(false)
  function mintaTutup() {
    if (sedangTutup.current) return
    sedangTutup.current = true
    setTutup(true)
    setTimeout(function () { props.onClose() }, 200)
  }
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') mintaTutup()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    if (props.driveId) {
      try {
        const nama = (props.title ? props.title.replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '-').substring(0, 60) : 'video-' + props.driveId) + '.mp4'
        const a = document.createElement('a')
        a.href = driveDownloadUrl(props.driveId)
        a.download = nama
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.style.display = 'none'
        document.body.appendChild(a)
        a.click()
        setTimeout(function () { a.remove() }, 1000)
      } catch (err) {
        window.open(driveDownloadUrl(props.driveId), '_blank')
      }
      setBusyUnduh(false)
      return
    }
    let nama = 'media'
    try {
      const urlAsli = new URL(props.src)
      const ekstensi = urlAsli.pathname.split('.').pop().split('?')[0] || 'jpg'
      if (props.title && props.title.trim()) {
        const judulAman = props.title.trim().replace(/[\/\\:*?"<>|]/g, '').replace(/\s+/g, '-').substring(0, 60)
        nama = judulAman + '.' + ekstensi
      } else {
        nama = urlAsli.pathname.split('/').pop() || ('media.' + ekstensi)
      }
    } catch (e) {
      nama = (props.title || 'media') + '.jpg'
    }
    try {
      const urlUnduh = props.src + (props.src.includes('?') ? '&' : '?') + 'unduh=1'
      const res = await fetch(urlUnduh, { cache: 'no-store' })
      if (!res.ok) throw new Error('status ' + res.status)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nama
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(function () { URL.revokeObjectURL(url) }, 2000)
    } catch (err) {
      window.open(props.src, '_blank')
    }
    setBusyUnduh(false)
  }
  const tombolUnduhTerlihat = !!props.driveId || !props.youtubeId
  return createPortal(
    <div className={'anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4' + (tutup ? ' lightbox-tutup' : '')} onClick={mintaTutup}>
      <div className="lightbox-isi relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
          <PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (
          <img
            src={props.src}
            alt={props.title || 'Media'}
            onClick={mintaTutup}
            className="mx-auto max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-2xl object-contain"
          />
        )}
        {props.title ? <p className="mt-3 truncate text-center text-sm text-slate-300">{props.title}</p> : null}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : (props.driveId ? 'Unduh video dari Google Drive' : 'Unduh media')}
          onClick={unduh}
          disabled={busyUnduh}
          style={tombolUnduhTerlihat ? undefined : { display: 'none' }}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={mintaTutup}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">
        {props.driveId ? 'Video diputar dari YouTube, unduhan diambil dari Google Drive' : 'Klik media atau tekan Esc untuk menutup'}
      </p>
    </div>
  , document.body)
}
export function ZoomableMedia(props) {
  const [open, setOpen] = useState(false)
  const isVideo = props.type === 'video'
  return (
    <div className={'relative group ' + (props.className || '')}>
      <SmartFit
        src={props.src}
        type={props.type}
        alt={props.title || 'Media'}
        full={props.full || props.src}
         controls={isVideo}
        onClick={isVideo ? null : function (e) { e.stopPropagation(); setOpen(true) }}
      />
      <button
        type="button"
        title="Perbesar media"
        onClick={function (e) { e.stopPropagation(); setOpen(true) }}
        className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70 opacity-100 xl:opacity-0 xl:group-hover:opacity-100"
      >
        <SizedIcon name="expand" size={15} />
      </button>
      {open ? <Lightbox src={props.full || props.src} type={props.type} title={props.title} onClose={function () { setOpen(false) }} /> : null}
    </div>
  )
}


export function SmartFit(props) {
  const [ratio, setRatio] = useState(null)
  const [near, setNear] = useState(false)
  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }
  useEffect(function () {
    const el = mediaRef.current
    if (!el) return undefined
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true)
      return undefined
    }
    const io = new IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          setNear(true)
          io.disconnect()
          break
        }
      }
    }, { rootMargin: '400px' })
    io.observe(el)
    return function () { io.disconnect() }
  }, [])
  function bacaUkuran(e) {
    const el = e.target
    const w = isVideo ? el.videoWidth : el.naturalWidth
    const h = isVideo ? el.videoHeight : el.naturalHeight
    if (w && h) setRatio(w / h)
  }
  function cadangkan(e) {
    const el = e.currentTarget
    const cad = props.full && props.full !== props.src ? props.full : props.src
    if (cad && el.src !== cad) el.src = cad
  }
  const cover = ratio !== null && ratio > 1
  const potret = ratio !== null && ratio <= 1
  return (
    <>
      {potret && !isVideo ? (
        <img src={props.src} alt="" aria-hidden="true" loading="lazy" decoding="async" onError={cadangkan} className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      ) : null}
      {isVideo ? (
        <video
          ref={mediaRef}
          src={near ? props.src : undefined}
          muted={props.controls ? false : true}
          preload="metadata"
          controls={props.controls || false}
          onLoadedMetadata={bacaUkuran}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain')}
        />
      ) : (
        <img
          ref={mediaRef}
          src={near ? props.src : undefined}
          alt={props.alt || 'Media'}
          loading="lazy"
          decoding="async"
          onLoad={bacaUkuran}
          onError={cadangkan}
          onClick={props.onClick || undefined}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain') + (props.onClick ? ' cursor-zoom-in' : '')}
        />
      )}
    </>
  )
}

export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="video" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Pratinjau video belum siap' : 'Menyiapkan pratinjau video'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Pratinjau video'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}

export function TitikAnim() {

  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\.{3}/g, '').replace(/\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}

export function Avatar(props) {
  const ukuran = { sm: 36, md: 44, lg: 56, xl: 96, '2xl': 160 }
  const px = ukuran[props.size] || 44
  const radius = Math.round(px * 0.28) + 'px'
  const nama = props.nama || ''
  const kata = nama.trim().split(/\s+/)
  const inisial = nama ? ((kata[0] ? kata[0].charAt(0) : '') + (kata[1] ? kata[1].charAt(0) : '')).toUpperCase() : '?'
  const palet = ['#166534', '#15803d', '#a16207', '#ca8a04', '#334155', '#047857']
  let hash = 0
  for (let i = 0; i < nama.length; i++) hash = (hash * 31 + nama.charCodeAt(i)) >>> 0
  const warna = palet[hash % palet.length]
  const bisaKlik = typeof props.onClick === 'function'
  const gaya = {
    boxSizing: 'content-box',
    display: 'inline-block',
    width: px + 'px',
    height: px + 'px',
    padding: 0,
    margin: 0,
    borderRadius: radius,
    overflow: 'hidden',
    position: 'relative',
    verticalAlign: 'middle',
    flexShrink: 0,
    background: props.src ? '#ffffff' : warna,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 10px 28px rgba(15, 23, 42, 0.22)',
    cursor: bisaKlik ? 'pointer' : 'default',
    outline: 'none',
    lineHeight: 0
  }
  const gayaFoto = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    display: 'block',
    borderRadius: radius
  }
  const gayaTeks = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: Math.round(px * 0.36) + 'px'
  }
  if (bisaKlik) {
    return (
      <button type="button" onClick={props.onClick} title={props.title} style={gaya}>
        {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} loading="lazy" decoding="async" /> : <span style={gayaTeks}>{inisial}</span>}
      </button>
    )
  }
  return (
    <span style={gaya}>
      {props.src ? <img src={props.src} alt={nama || 'Foto profil'} style={gayaFoto} loading="lazy" decoding="async" /> : <span style={gayaTeks}>{inisial}</span>}
    </span>
  )
}

export function Pagination(props) {
  /* pagination-v2: tombol nomor halaman sesuai tema BSI */
  const totalItems = props.totalItems || 0
  const perPage = props.perPage || 10
  const page = props.page || 1
  const onPageChange = props.onPageChange || function () {}
  const totalPages = Math.ceil(totalItems / perPage)
  if (!totalItems) return null
  const halaman = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) halaman.push(i)
  } else {
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        halaman.push(i)
      } else if (halaman[halaman.length - 1] !== '...') {
        halaman.push('...')
      }
    }
  }
  const clsAngka = 'grid h-10 min-w-10 place-items-center rounded-xl px-3 text-sm font-bold transition '
  const clsNav = 'flex h-10 items-center rounded-xl px-4 text-sm font-semibold transition '
  const clsNetral = 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-bsi-800'
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page <= 1}
          onClick={function () { onPageChange(page - 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Sebelumnya
        </button>
      ) : null}
      {halaman.map(function (h, idx) {
        if (h === '...') {
          return <span key={'lompat' + idx} className="px-1 text-sm font-bold text-slate-600">...</span>
        }
        const aktif = h === page
        return (
          <button
            key={'hal' + h}
            type="button"
            onClick={function () { onPageChange(h) }}
            className={clsAngka + (aktif
              ? 'bg-bsi-800 text-white shadow-lg shadow-bsi-900/25'
              : clsNetral)}
          >
            {h}
          </button>
        )
      })}
      {totalPages > 1 ? (
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={function () { onPageChange(page + 1) }}
          className={clsNav + clsNetral + ' disabled:cursor-not-allowed disabled:opacity-40'}
        >
          Berikutnya
        </button>
      ) : null}
    </div>
  )
}

const ToastContext = createContext(null)
 export function ToastProvider(props) {
  const [toasts, setToasts] = useState([])
  function tutupToast(id) {
    setToasts(function (prev) { return prev.map(function (t) { return t.id === id ? Object.assign({}, t, { tutup: true }) : t }) })
    setTimeout(function () {
      setToasts(function (prev) { return prev.filter(function (t) { return t.id !== id }) })
    }, 240)
  }
  function tambahToast(tipe, pesan) {
    const id = Date.now() + Math.random()
    setToasts(function (prev) { return prev.concat([{ id: id, tipe: tipe, pesan: pesan, tutup: false }]) })
    setTimeout(function () { tutupToast(id) }, 4000)
  }
  function toastSukses(pesan) { tambahToast('sukses', pesan) }
  function toastGagal(pesan) { tambahToast('gagal', pesan) }
  return (
    <ToastContext.Provider value={{ sukses: toastSukses, gagal: toastGagal }}>
      {props.children}
      <div className="toast-wadah fixed z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(function (t) {
          const sukses = t.tipe === 'sukses'
          return (
            <div key={t.id} className={'toast-kartu pointer-events-auto flex items-center gap-3 ' + (sukses ? 'toast-sukses' : 'toast-gagal') + (t.tutup ? ' toast-keluar' : '')}>
              <span className={'toast-ikon ' + (sukses ? 'toast-ikon-sukses' : 'toast-ikon-gagal')}>
                <SizedIcon name={sukses ? 'check' : 'close'} size={15} />
              </span>
              <p className="toast-teks flex-1 text-sm font-semibold">{t.pesan}</p>
              <button type="button" onClick={function () { tutupToast(t.id) }} title="Tutup notifikasi"
                className="toast-tutup grid h-7 w-7 shrink-0 place-items-center rounded-lg">
                <SizedIcon name="close" size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
export function useToast() {
   return useContext(ToastContext)
 }

export function SelubungPanel(props) {
  const [tampil, setTampil] = useState(props.open)
  const tutup = tampil && !props.open
  useEffect(function () {
    if (props.open) { setTampil(true); return undefined }
    if (!tampil) return undefined
    const t = setTimeout(function () { setTampil(false) }, 180)
    return function () { clearTimeout(t) }
  }, [props.open, tampil])
  if (!tampil) return null
  return <div className={'selubung-panel' + (tutup ? ' panel-tutup' : '')}>{props.children}</div>
}
