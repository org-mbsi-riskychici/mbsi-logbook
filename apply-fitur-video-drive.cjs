const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

function ganti(teks, lama, baru) {
  const i = teks.indexOf(lama)
  if (i === -1) return null
  return teks.slice(0, i) + baru + teks.slice(i + lama.length)
}
function gantiSemua(teks, lama, baru) {
  return teks.split(lama).join(baru)
}

console.log('Mulai memasang fitur video Google Drive (download resolusi asli + bypass peringatan virus)...')
console.log('')

/* ============================================================
   1. Buat file baru src/lib/drive.js
   ============================================================ */
const FILE_DRIVE = 'src/lib/drive.js'
const ISI_DRIVE = String.raw`export function parseDriveId(url) {
  if (!url) return null
  const s = String(url).trim()

  if (/^[a-zA-Z0-9_-]{20,}$/.test(s) && s.indexOf('/') === -1 && s.indexOf('.') === -1) return s

  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '')

    if (host === 'drive.google.com' || host === 'drive.usercontent.google.com') {
      const m = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      if (m) return m[1]
      const id = u.searchParams.get('id')
      if (id) return id
    }
  } catch (e) {}

  return null
}

export function drivePreviewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/preview'
}

export function driveThumbUrl(id) {
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1280'
}

export function driveDownloadUrl(id) {
  return 'https://drive.usercontent.google.com/download?id=' + id + '&export=download&confirm=t'
}

export function driveViewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/view'
}
`
simpan(FILE_DRIVE, ISI_DRIVE)
console.log('[BERHASIL] src/lib/drive.js dibuat (parseDriveId, preview, thumbnail, download bypass, view)')

/* ============================================================
   2. src/components/ui.jsx  (import + MediaDrive + Lightbox)
   ============================================================ */
const FILE_UI = 'src/components/ui.jsx'
if (!ada(FILE_UI)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
} else {
  let u = baca(FILE_UI)
  let berubahUi = false

  if (u.indexOf("from '../lib/drive.js'") === -1) {
    const anchor = "import PemutarVideo from './PemutarVideo.jsx'"
    const hasil = ganti(u, anchor, anchor + "\nimport { drivePreviewUrl, driveDownloadUrl, driveThumbUrl } from '../lib/drive.js'")
    if (hasil) { u = hasil; berubahUi = true; console.log('[BERHASIL] Import helper Drive ditambahkan di ui.jsx') }
    else console.log('[TIDAK KETEMU] Anchor import PemutarVideo di ui.jsx')
  } else {
    console.log('[SUDAH ADA] Import helper Drive di ui.jsx')
  }

  if (u.indexOf('export function MediaDrive') === -1) {
    const mulaiLightbox = u.indexOf('export function Lightbox(props) {')
    const mulaiZoom = u.indexOf('export function ZoomableMedia(props) {')
    if (mulaiLightbox !== -1 && mulaiZoom !== -1 && mulaiZoom > mulaiLightbox) {
      const BLOK = String.raw`export function MediaDrive(props) {
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
      onError={function () { setGagal(true) }}
      className={(props.className || 'absolute inset-0 h-full w-full object-cover') + (props.onClick ? ' cursor-zoom-in' : '')}
    />
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
  return createPortal(
    <div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>
      <div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.driveId ? (
          <iframe
            key={props.driveId}
            src={drivePreviewUrl(props.driveId)}
            title={props.title || 'Video Google Drive'}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className="mx-auto aspect-video w-full rounded-2xl border-0 bg-black"
          />
        ) : props.youtubeId ? (
          <PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />
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
          title={busyUnduh ? 'Menyiapkan unduhan...' : (props.driveId ? 'Unduh video resolusi asli dari Google Drive' : 'Unduh media')}
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
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">
        {props.driveId ? 'Klik tombol unduh untuk menyimpan video resolusi asli dari Google Drive' : 'Klik media atau tekan Esc untuk menutup'}
      </p>
    </div>
  , document.body)
}
`
      u = u.slice(0, mulaiLightbox) + BLOK + u.slice(mulaiZoom)
      berubahUi = true
      console.log('[BERHASIL] Komponen MediaDrive dan Lightbox versi Drive dipasang di ui.jsx')
    } else {
      console.log('[TIDAK KETEMU] Blok Lightbox atau ZoomableMedia di ui.jsx')
    }
  } else {
    console.log('[SUDAH ADA] MediaDrive di ui.jsx')
  }

  if (berubahUi) simpan(FILE_UI, u)
}

/* ============================================================
   3. src/components/cards.jsx
   ============================================================ */
const FILE_CARDS = 'src/components/cards.jsx'
if (!ada(FILE_CARDS)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
} else {
  let c = baca(FILE_CARDS)
  let berubahCards = false

  if (c.indexOf('MediaDrive') === -1) {
    let h = ganti(c, 'SmartFit , MediaYouTube } from \'./ui.jsx\'', 'SmartFit , MediaYouTube, MediaDrive } from \'./ui.jsx\'')
    if (h) { c = h; berubahCards = true }
    else console.log('[TIDAK KETEMU] Import ui.jsx di cards.jsx')
  }
  if (c.indexOf('drivePreviewUrl') === -1) {
    const anchor = "from '../lib/format.js'"
    const h = ganti(c, anchor, anchor + "\nimport { drivePreviewUrl, driveThumbUrl } from '../lib/drive.js'")
    if (h) { c = h; berubahCards = true }
    else console.log('[TIDAK KETEMU] Import format.js di cards.jsx')
  } else {
    console.log('[SUDAH ADA] Import helper Drive di cards.jsx')
  }

  const SLIDES_LAMA = "export function slidesFromItems(items) {\n  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {\n    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }\n  })\n}"
  const SLIDES_BARU = "export function slidesFromItems(items) {\n  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {\n    const drive = i.media_source === 'drive' ? i.media_path : null\n    return { src: drive ? driveThumbUrl(i.media_path) : (i.media_thumb || i.media_path), full: i.media_path, type: (i.media_source === 'youtube' || i.media_source === 'drive') ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null, drive: drive }\n  })\n}"
  if (c.indexOf('driveThumbUrl(i.media_path)') === -1) {
    const h = ganti(c, SLIDES_LAMA, SLIDES_BARU)
    if (h) { c = h; berubahCards = true; console.log('[BERHASIL] slidesFromItems mendukung media Drive') }
    else console.log('[TIDAK KETEMU] Pola slidesFromItems di cards.jsx')
  } else {
    console.log('[SUDAH ADA] slidesFromItems mendukung Drive')
  }

  const GC_LAMA = "{item.media_source === 'youtube' ? (\n        <MediaYouTube src={item.media_path} alt={item.judul} />\n      ) : (\n        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />\n      )}"
  const GC_BARU = "{item.media_source === 'youtube' ? (\n        <MediaYouTube src={item.media_path} alt={item.judul} />\n      ) : item.media_source === 'drive' ? (\n        <MediaDrive driveId={item.media_path} alt={item.judul} />\n      ) : (\n        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />\n      )}"
  if (c.indexOf('<MediaDrive driveId={item.media_path}') === -1) {
    const h = ganti(c, GC_LAMA, GC_BARU)
    if (h) { c = h; berubahCards = true; console.log('[BERHASIL] GalleryCard mendukung thumbnail Drive') }
    else console.log('[TIDAK KETEMU] Pola media GalleryCard di cards.jsx')
  } else {
    console.log('[SUDAH ADA] GalleryCard mendukung Drive')
  }

  const GD_LAMA = "{item.media_source === 'youtube' ? (\n        <PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className=\"aspect-video w-full rounded-2xl\" />\n      ) : (\n        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900\" />\n      )}"
  const GD_BARU = "{item.media_source === 'youtube' ? (\n        <PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className=\"aspect-video w-full rounded-2xl\" />\n      ) : item.media_source === 'drive' ? (\n        <iframe src={drivePreviewUrl(item.media_path)} title={item.judul} allow=\"autoplay; encrypted-media; fullscreen\" allowFullScreen className=\"aspect-video w-full rounded-2xl border-0 bg-black\" />\n      ) : (\n        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900\" />\n      )}"
  if (c.indexOf('drivePreviewUrl(item.media_path)') === -1) {
    const h = ganti(c, GD_LAMA, GD_BARU)
    if (h) { c = h; berubahCards = true; console.log('[BERHASIL] GalleryDetail mendukung pemutar Drive') }
    else console.log('[TIDAK KETEMU] Pola media GalleryDetail di cards.jsx')
  } else {
    console.log('[SUDAH ADA] GalleryDetail mendukung Drive')
  }

  const LD_LAMA = "{it.media_path ? (\n                      it.media_source === 'youtube' ? (\n                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                      ) : (\n                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                      )\n                    ) : null}"
  const LD_BARU = "{it.media_path ? (\n                      it.media_source === 'youtube' ? (\n                        <PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className=\"aspect-video w-full rounded-2xl mb-3\" />\n                      ) : it.media_source === 'drive' ? (\n                        <iframe key={it.media_path} src={drivePreviewUrl(it.media_path)} title={it.judul} allow=\"autoplay; encrypted-media; fullscreen\" allowFullScreen className=\"aspect-video w-full rounded-2xl border-0 bg-black mb-3\" />\n                      ) : (\n                        <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className=\"rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3\" />\n                      )\n                    ) : null}"
  if (c.indexOf('drivePreviewUrl(it.media_path)') === -1) {
    const h = ganti(c, LD_LAMA, LD_BARU)
    if (h) { c = h; berubahCards = true; console.log('[BERHASIL] LogbookDetail mendukung pemutar Drive') }
    else console.log('[TIDAK KETEMU] Pola media LogbookDetail di cards.jsx')
  } else {
    console.log('[SUDAH ADA] LogbookDetail mendukung Drive')
  }

  if (berubahCards) simpan(FILE_CARDS, c)
}

/* ============================================================
   4. src/components/Carousel.jsx
   ============================================================ */
const FILE_CAROUSEL = 'src/components/Carousel.jsx'
if (!ada(FILE_CAROUSEL)) {
  console.log('[GAGAL] Carousel.jsx tidak ditemukan')
} else {
  let r = baca(FILE_CAROUSEL)
  let berubahCar = false

  if (r.indexOf('MediaDrive') === -1) {
    const h = ganti(r, "import { Lightbox, SmartFit } from './ui.jsx'", "import { Lightbox, SmartFit, MediaDrive } from './ui.jsx'")
    if (h) { r = h; berubahCar = true; console.log('[BERHASIL] Import MediaDrive di Carousel.jsx') }
    else console.log('[TIDAK KETEMU] Import ui.jsx di Carousel.jsx')
  } else {
    console.log('[SUDAH ADA] Import MediaDrive di Carousel.jsx')
  }

  if (r.indexOf('s.drive') === -1) {
    const SINGLE_LAMA = "<SmartFit src={s.src} full={s.full} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />"
    const SINGLE_BARU = "{s.drive ? (\n            <MediaDrive driveId={s.drive} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} className=\"absolute inset-0 h-full w-full object-cover cursor-zoom-in\" />\n          ) : (\n            <SmartFit src={s.src} full={s.full} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />\n          )}"
    const h1 = ganti(r, SINGLE_LAMA, SINGLE_BARU)
    if (h1) { r = h1; berubahCar = true; console.log('[BERHASIL] Carousel single slide mendukung Drive') }
    else console.log('[TIDAK KETEMU] Pola single slide di Carousel.jsx')

    const MULTI_LAMA = "<SmartFit\n                  src={s.src}\n                  full={s.full}\n                   type={s.type}\n                  alt={s.title || 'Media'}\n                  onClick={function () {\n                    if (moved.current) { moved.current = false; return }\n                    setZoom(s)\n                  }}\n                />"
    const MULTI_BARU = "{s.drive ? (\n                  <MediaDrive driveId={s.drive} alt={s.title || 'Media'} onClick={function () { if (moved.current) { moved.current = false; return } setZoom(s) }} className=\"absolute inset-0 h-full w-full object-cover cursor-zoom-in\" />\n                ) : (\n                <SmartFit\n                  src={s.src}\n                  full={s.full}\n                   type={s.type}\n                  alt={s.title || 'Media'}\n                  onClick={function () {\n                    if (moved.current) { moved.current = false; return }\n                    setZoom(s)\n                  }}\n                />\n                )}"
    const h2 = ganti(r, MULTI_LAMA, MULTI_BARU)
    if (h2) { r = h2; berubahCar = true; console.log('[BERHASIL] Carousel multi slide mendukung Drive') }
    else console.log('[TIDAK KETEMU] Pola multi slide di Carousel.jsx')
  } else {
    console.log('[SUDAH ADA] Carousel mendukung Drive')
  }

  if (r.indexOf('driveId={zoom.drive || null}') === -1) {
    r = gantiSemua(r,
      "<Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} />",
      "<Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} driveId={zoom.drive || null} onClose={function () { setZoom(null) }} />")
    berubahCar = true
    console.log('[BERHASIL] Lightbox di Carousel menerima prop driveId')
  } else {
    console.log('[SUDAH ADA] Lightbox Carousel menerima driveId')
  }

  if (berubahCar) simpan(FILE_CAROUSEL, r)
}

/* ============================================================
   5. src/pages/DashboardPage.jsx
   ============================================================ */
const FILE_DASH = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_DASH)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
} else {
  let d = baca(FILE_DASH)
  let berubahDash = false
  function pasang(lama, baru, label) {
    if (d.indexOf(baru) !== -1) { console.log('[SUDAH ADA] ' + label); return }
    const h = ganti(d, lama, baru)
    if (h) { d = h; berubahDash = true; console.log('[BERHASIL] ' + label) }
    else console.log('[TIDAK KETEMU] ' + label)
  }

  pasang(
    "import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'",
    "import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'\nimport { parseDriveId, driveThumbUrl, driveViewUrl } from '../lib/drive.js'",
    'Import helper Drive di DashboardPage'
  )

  pasang(
    "ytLink: '', oldYtId: null, oldSource: 'r2' }",
    "ytLink: '', oldYtId: null, oldSource: 'r2', driveLink: '' }",
    'Field driveLink pada newItem'
  )

  pasang(
    "const [galYtLink, setGalYtLink] = useState('')",
    "const [galYtLink, setGalYtLink] = useState('')\n   const [galDriveLink, setGalDriveLink] = useState('')",
    'State galDriveLink'
  )

  pasang(
    '<input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal" />',
    '<input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal" />\n                          <input className={inputCls} value={it.driveLink} onChange={function (e) { patchItem(i, { driveLink: e.target.value }) }} placeholder="Atau tempel link Google Drive (opsional)" />',
    'Input Google Drive pada form kegiatan logbook'
  )

  pasang(
    '<input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal" />',
    '<input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal" />\n                       <input className={inputCls} value={galDriveLink} onChange={function (e) { setGalDriveLink(e.target.value) }} placeholder="Atau tempel link Google Drive (opsional)" />',
    'Input Google Drive pada form galeri'
  )

  pasang(
    "} else if (it.mode === 'video' && it.file) {",
    "} else if (it.mode === 'video' && it.driveLink && !it.file && !it.ytLink) {\n           const driveId = parseDriveId(it.driveLink)\n           if (!driveId) { toast.gagal('Link Google Drive tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }\n           mediaSource = 'drive'\n           youtubeId = null\n           mediaPath = driveId\n           mediaThumb = driveThumbUrl(driveId)\n           mediaType = 'video'\n         } else if (it.mode === 'video' && it.file) {",
    'Branch Drive pada submitLogbook'
  )

  pasang(
    "} else if (galMode === 'video' && galForm.file) {",
    "} else if (galMode === 'video' && galDriveLink && !galForm.file && !galYtLink) {\n         const driveId = parseDriveId(galDriveLink)\n         if (!driveId) { toast.gagal('Link Google Drive tidak valid.'); setBusy(false); return }\n         mediaSource = 'drive'\n         youtubeId = null\n         mediaPath = driveId\n         mediaThumb = driveThumbUrl(driveId)\n         mediaType = 'video'\n       } else if (galMode === 'video' && galForm.file) {",
    'Branch Drive pada submitGaleri'
  )

  pasang(
    "preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }",
    "preview: it.media_source === 'drive' ? driveThumbUrl(it.media_path) : (it.media_path || ''), oldPath: (it.media_source === 'youtube' || it.media_source === 'drive') ? '' : (it.media_path || ''), oldThumb: (it.media_source === 'youtube' || it.media_source === 'drive') ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: (it.media_source === 'youtube' || it.media_source === 'drive') ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', driveLink: it.media_source === 'drive' ? driveViewUrl(it.media_path) : '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }",
    'startEditLog memuat kembali link Drive'
  )

  pasang(
    "setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })",
    "setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_source === 'drive' ? driveThumbUrl(g.media_path) : (g.media_path || ''), oldPath: (g.media_source === 'youtube' || g.media_source === 'drive') ? '' : (g.media_path || ''), oldThumb: (g.media_source === 'youtube' || g.media_source === 'drive') ? '' : (g.media_thumb || ''), previewLoading: false })",
    'startEditGal memuat thumbnail Drive'
  )

  pasang(
    "setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))",
    "setGalMode((g.media_source === 'youtube' || g.media_source === 'drive') ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))",
    'startEditGal mengatur mode video untuk Drive'
  )

  pasang(
    "setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')",
    "setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')\n     setGalDriveLink(g.media_source === 'drive' ? driveViewUrl(g.media_path) : '')",
    'startEditGal memuat kembali link Drive'
  )

  if (d.indexOf("setGalDriveLink('')") === -1) {
    d = gantiSemua(d,
      "setGalYtLink('')\n      setGalOldYt(null)",
      "setGalYtLink('')\n      setGalDriveLink('')\n      setGalOldYt(null)")
    berubahDash = true
    console.log('[BERHASIL] Reset galDriveLink pada submitGaleri dan cancelEditGal')
  } else {
    console.log('[SUDAH ADA] Reset galDriveLink')
  }

  pasang(
    "if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return",
    "if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return\n     if (String(url || '').indexOf('drive.google.com') !== -1 || String(url || '').indexOf('drive.usercontent.google.com') !== -1) return\n     if (!/^https?:\\/\\//.test(String(url || ''))) return",
    'Penjaga hapusMediaR2 agar media Drive tidak ikut terhapus dari R2'
  )

  if (berubahDash) simpan(FILE_DASH, d)
}

/* ============================================================
   6. Verifikasi
   ============================================================ */
console.log('')
console.log('Verifikasi:')
const vDrive = ada(FILE_DRIVE) ? baca(FILE_DRIVE) : ''
const vUi = ada(FILE_UI) ? baca(FILE_UI) : ''
const vCards = ada(FILE_CARDS) ? baca(FILE_CARDS) : ''
const vCar = ada(FILE_CAROUSEL) ? baca(FILE_CAROUSEL) : ''
const vDash = ada(FILE_DASH) ? baca(FILE_DASH) : ''

console.log((vDrive.indexOf('driveDownloadUrl') !== -1 ? '[OK] ' : '[BELUM] ') + 'src/lib/drive.js tersedia dengan endpoint bypass')
console.log((vUi.indexOf('export function MediaDrive') !== -1 ? '[OK] ' : '[BELUM] ') + 'Komponen MediaDrive di ui.jsx')
console.log((vUi.indexOf('props.driveId') !== -1 ? '[OK] ' : '[BELUM] ') + 'Lightbox mendukung video Drive dan tombol unduh')
console.log((vCards.indexOf('drivePreviewUrl') !== -1 ? '[OK] ' : '[BELUM] ') + 'cards.jsx menampilkan media Drive')
console.log((vCar.indexOf('driveId={zoom.drive || null}') !== -1 ? '[OK] ' : '[BELUM] ') + 'Carousel meneruskan driveId ke Lightbox')
console.log((vDash.indexOf('parseDriveId') !== -1 ? '[OK] ' : '[BELUM] ') + 'DashboardPage memproses link Google Drive')
console.log((vDash.indexOf('Atau tempel link Google Drive (opsional)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Form opsional paste link Google Drive tersedia')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang dipasang oleh script ini:')
console.log('1. File baru src/lib/drive.js berisi parseDriveId, drivePreviewUrl, driveThumbUrl, driveDownloadUrl, dan driveViewUrl.')
console.log('2. Lightbox kini mengenali prop driveId, menampilkan iframe preview Google Drive, dan tombol unduh langsung memakai endpoint drive.usercontent.google.com dengan parameter confirm=t sehingga file di atas 100 MB terunduh tanpa peringatan virus.')
console.log('3. Komponen MediaDrive menampilkan thumbnail Drive dengan fallback rapi bila thumbnail gagal dimuat.')
console.log('4. Kartu galeri, detail galeri, dan detail logbook mendukung media bersumber Drive.')
console.log('5. Carousel meneruskan driveId ke Lightbox sehingga zoom media Drive bekerja.')
console.log('6. Dashboard mendapat input opsional untuk menempel link Google Drive pada form kegiatan logbook dan form galeri, lengkap dengan logika simpan, edit, dan reset.')
console.log('7. Media Drive disimpan dengan media_source = drive dan media_path berisi File ID, tanpa perlu migrasi database.')
console.log('8. Fungsi hapusMediaR2 diberi penjaga agar File ID Drive tidak dianggap key R2 dan tidak ikut terhapus.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, pilih mode Video pada kegiatan logbook atau galeri, lalu tempel link Google Drive pada field opsional.')
console.log('2. Simpan, lalu buka halaman publik: thumbnail Drive tampil di kartu dan iframe preview tampil di detail.')
console.log('3. Klik media hingga masuk lightbox, lalu klik tombol unduh: video Drive langsung terunduh dalam resolusi asli tanpa halaman peringatan virus.')
console.log('4. Pastikan file di Google Drive sudah dibagikan dengan akses Anyone with the link agar preview dan unduhan berfungsi.')