import { useEffect, useRef, useState } from 'react'
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
export const btnPrimary = 'w-full rounded-2xl bg-bsi-800 px-6 py-4 text-white font-bold hover:bg-bsi-900'
export const btnSmall = 'px-4 py-2 rounded-xl text-sm font-semibold'
export const cardCls = 'card-hover bg-white rounded-3xl border border-slate-200 shadow-sm'

export function StatCard(props) {
  return (
    <div className={cardCls + ' p-6'}>
      <p className="text-sm text-slate-500">{props.label}</p>
      <p className="mt-2 text-3xl font-black text-bsi-900">{props.value}</p>
      {props.sub ? <p className="mt-1 text-xs text-slate-500">{props.sub}</p> : null}
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
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">{props.desc}</p>
    </div>
  )
}

export function StatusBadge(props) {
  const publik = props.status === 'publik'
  return (
    <span className={'px-3 py-1 rounded-full text-xs font-semibold ' + (publik ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
      {publik ? 'Siap dilihat' : 'Draft'}
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
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[60] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onClose}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-3xl rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <p className="font-bold text-slate-900">{props.title || 'Detail'}</p>
            <button onClick={props.onClose} className="h-9 w-9 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 grid place-items-center">
              <SizedIcon name="close" size={16} />
            </button>
          </div>
          <div className="p-6">{props.children}</div>
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
  useBodyScrollLock(props.open)
  if (!props.open) return null
  return (
    <div className="anim-overlay fixed inset-0 z-[70] overflow-y-auto overscroll-contain bg-slate-900/60 p-4" onClick={props.onCancel}>
      <div className="min-h-full flex items-center justify-center py-8">
        <div className="anim-modal w-full max-w-md rounded-[2rem] bg-white shadow-2xl" onClick={function (e) { e.stopPropagation() }}>
          <div className="p-6 space-y-4">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-red-100 text-red-600 grid place-items-center">
              <SizedIcon name="trash" size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-black text-slate-900">{props.title || 'Hapus data ini?'}</h3>
              <p className="mt-2 text-sm text-slate-500">{props.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={props.onCancel}
                className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Batal
              </button>
              <button type="button" onClick={props.onConfirm}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-600">
                {props.confirmLabel || 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
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
  return (
    <div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>
      <div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
          <iframe src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId + '?rel=0&modestbranding=1'} title={props.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mx-auto aspect-video w-full rounded-2xl bg-slate-900" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (
          <img
            src={props.src}
            alt={props.title || 'Media'}
            onClick={props.onClose}
            className="mx-auto max-h-[85vh] w-auto max-w-full cursor-zoom-out rounded-2xl object-contain"
          />
        )}
        {props.title ? <p className="mt-3 truncate text-center text-sm text-slate-300">{props.title}</p> : null}
      </div>
      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : 'Unduh media'}
          onClick={unduh}
          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={props.onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">Klik media atau tekan Esc untuk menutup</p>
    </div>
  )
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