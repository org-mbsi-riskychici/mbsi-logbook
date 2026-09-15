const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang fitur: YouTube untuk tampilan, Google Drive untuk download...')
console.log('')

/* ============================================================
   1. Buat file SQL migrasi sebagai pengingat
   ============================================================ */
const SQL_MIGRASI = `-- Migrasi fitur download Google Drive
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- jika kolom drive_id belum ada.

alter table public.logbook_items add column if not exists drive_id text;
alter table public.galeri add column if not exists drive_id text;
`
simpan('supabase/migrasi-drive-download.sql', SQL_MIGRASI)
console.log('[BERHASIL] File supabase/migrasi-drive-download.sql dibuat')
console.log('[PENTING] Jalankan SQL tersebut di Supabase SQL Editor untuk menambah kolom drive_id')
console.log('')

/* ============================================================
   2. Pastikan src/lib/drive.js tersedia
   ============================================================ */
const FILE_DRIVE = 'src/lib/drive.js'
if (!ada(FILE_DRIVE)) {
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

export function driveDownloadUrl(id) {
  return 'https://drive.usercontent.google.com/download?id=' + id + '&export=download&confirm=t'
}

export function driveViewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/view'
}
`
  simpan(FILE_DRIVE, ISI_DRIVE)
  console.log('[BERHASIL] src/lib/drive.js dibuat')
} else {
  console.log('[SUDAH ADA] src/lib/drive.js')
}

/* ============================================================
   3. cards.jsx: slidesFromItems meneruskan drive_id
   ============================================================ */
const FILE_CARDS = 'src/components/cards.jsx'
if (ada(FILE_CARDS)) {
  let c = baca(FILE_CARDS)
  let berubah = false

  // Cari fungsi slidesFromItems dan ganti seluruhnya
  const mulaiFn = c.indexOf('export function slidesFromItems(items) {')
  if (mulaiFn !== -1) {
    // Cari akhir fungsi (tanda } yang menutup fungsi)
    let brace = 0
    let akhir = -1
    let mulaiBrace = false
    for (let i = mulaiFn; i < c.length; i++) {
      if (c[i] === '{') { brace++; mulaiBrace = true }
      if (c[i] === '}') { brace--; if (mulaiBrace && brace === 0) { akhir = i + 1; break } }
    }
    if (akhir !== -1) {
      const baru = `export function slidesFromItems(items) {
  return (items || []).filter(function (i) { return i.media_path }).map(function (i) {
    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null, drive: i.drive_id || null }
  })
}`
      c = c.slice(0, mulaiFn) + baru + c.slice(akhir)
      berubah = true
      console.log('[BERHASIL] slidesFromItems meneruskan drive_id dari database')
    } else {
      console.log('[TIDAK KETEMU] Akhir fungsi slidesFromItems')
    }
  } else {
    console.log('[TIDAK KETEMU] Fungsi slidesFromItems')
  }

  if (berubah) simpan(FILE_CARDS, c)
} else {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
}

/* ============================================================
   4. ui.jsx: Lightbox memakai driveId untuk download
   ============================================================ */
const FILE_UI = 'src/components/ui.jsx'
if (ada(FILE_UI)) {
  let u = baca(FILE_UI)
  let berubah = false

  // Pastikan import drive ada
  if (u.indexOf("from '../lib/drive.js'") === -1) {
    const anchor = "import PemutarVideo from './PemutarVideo.jsx'"
    const idx = u.indexOf(anchor)
    if (idx !== -1) {
      u = u.slice(0, idx) + anchor + "\nimport { driveDownloadUrl } from '../lib/drive.js'" + u.slice(idx + anchor.length)
      berubah = true
      console.log('[BERHASIL] Import driveDownloadUrl ditambahkan di ui.jsx')
    }
  } else {
    console.log('[SUDAH ADA] Import helper Drive di ui.jsx')
  }

  // Ganti Lightbox agar driveId dipakai untuk download, bukan preview
  const mulaiLightbox = u.indexOf('export function Lightbox(props) {')
  const mulaiZoom = u.indexOf('export function ZoomableMedia(props) {')
  if (mulaiLightbox !== -1 && mulaiZoom !== -1 && mulaiZoom > mulaiLightbox) {
    const LIGHTBOX_BARU = String.raw`export function Lightbox(props) {
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
  const tombolUnduhTerlihat = !!props.driveId || !props.youtubeId
  return createPortal(
    <div className="anim-overlay fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/95 p-4" onClick={props.onClose}>
      <div className="relative w-full max-w-5xl" onClick={function (e) { e.stopPropagation() }}>
        {props.youtubeId ? (
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
          onClick={props.onClose}
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
`
    u = u.slice(0, mulaiLightbox) + LIGHTBOX_BARU + u.slice(mulaiZoom)
    berubah = true
    console.log('[BERHASIL] Lightbox memakai driveId untuk download, preview tetap YouTube')
  } else {
    console.log('[TIDAK KETEMU] Blok Lightbox di ui.jsx')
  }

  if (berubah) simpan(FILE_UI, u)
} else {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
}

/* ============================================================
   5. DashboardPage.jsx: simpan dan muat drive_id
   ============================================================ */
const FILE_DASH = 'src/pages/DashboardPage.jsx'
if (ada(FILE_DASH)) {
  let d = baca(FILE_DASH)
  let berubah = false

  // 5a. Hapus branch drive lama di submitLogbook yang mengubah mediaSource
  const branchDriveLog = "} else if (it.mode === 'video' && it.driveLink && !it.file && !it.ytLink) {\n           const driveId = parseDriveId(it.driveLink)\n           if (!driveId) { toast.gagal('Link Google Drive tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }\n           mediaSource = 'drive'\n           youtubeId = null\n           mediaPath = driveId\n           mediaThumb = driveThumbUrl(driveId)\n           mediaType = 'video'\n         } else if (it.mode === 'video' && it.file) {"
  if (d.indexOf(branchDriveLog) !== -1) {
    d = d.replace(branchDriveLog, "} else if (it.mode === 'video' && it.file) {")
    berubah = true
    console.log('[BERHASIL] Branch drive lama di submitLogbook dihapus')
  } else {
    console.log('[INFO] Branch drive lama submitLogbook tidak ditemukan atau sudah dihapus')
  }

  // 5b. Hapus branch drive lama di submitGaleri
  const branchDriveGal = "} else if (galMode === 'video' && galDriveLink && !galForm.file && !galYtLink) {\n         const driveId = parseDriveId(galDriveLink)\n         if (!driveId) { toast.gagal('Link Google Drive tidak valid.'); setBusy(false); return }\n         mediaSource = 'drive'\n         youtubeId = null\n         mediaPath = driveId\n         mediaThumb = driveThumbUrl(driveId)\n         mediaType = 'video'\n       } else if (galMode === 'video' && galForm.file) {"
  if (d.indexOf(branchDriveGal) !== -1) {
    d = d.replace(branchDriveGal, "} else if (galMode === 'video' && galForm.file) {")
    berubah = true
    console.log('[BERHASIL] Branch drive lama di submitGaleri dihapus')
  } else {
    console.log('[INFO] Branch drive lama submitGaleri tidak ditemukan atau sudah dihapus')
  }

  // 5c. Tambahkan logika drive_id di submitLogbook (sebelum clean.push)
  const anchorPushLog = "clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })"
  if (d.indexOf(anchorPushLog) !== -1 && d.indexOf('drive_id: driveIdLog') === -1) {
    const baruPushLog = "let driveIdLog = null\n         if (it.mode === 'video' && it.driveLink) {\n           driveIdLog = parseDriveId(it.driveLink)\n           if (!driveIdLog) { toast.gagal('Link Google Drive tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }\n         }\n         clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, drive_id: driveIdLog, show_in_gallery: it.show && !!mediaPath })"
    d = d.replace(anchorPushLog, baruPushLog)
    berubah = true
    console.log('[BERHASIL] submitLogbook menyimpan drive_id')
  } else {
    console.log('[INFO] clean.push submitLogbook sudah ada atau tidak ditemukan')
  }

  // 5d. Tambahkan drive_id di rows insert logbook_items
  const anchorRowsLog = "return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }"
  if (d.indexOf(anchorRowsLog) !== -1 && d.indexOf('drive_id: c.drive_id') === -1) {
    d = d.replace(anchorRowsLog, "return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, drive_id: c.drive_id, show_in_gallery: c.show_in_gallery }")
    berubah = true
    console.log('[BERHASIL] Insert logbook_items menyertakan drive_id')
  }

  // 5e. Tambahkan logika drive_id di submitGaleri (sebelum payload)
  const anchorPayloadGal = "const payload = {\n         mahasiswa_id: mahasiswa.id,"
  if (d.indexOf(anchorPayloadGal) !== -1 && d.indexOf('drive_id: driveIdGal') === -1) {
    const baruPayloadGal = "let driveIdGal = null\n       if (galMode === 'video' && galDriveLink) {\n         driveIdGal = parseDriveId(galDriveLink)\n         if (!driveIdGal) { toast.gagal('Link Google Drive tidak valid.'); setBusy(false); return }\n       }\n       const payload = {\n         mahasiswa_id: mahasiswa.id,"
    d = d.replace(anchorPayloadGal, baruPayloadGal)
    berubah = true
    console.log('[BERHASIL] submitGaleri memproses drive_id')
  }

  // 5f. Tambahkan drive_id di payload galeri
  const anchorPayloadField = "media_source: mediaSource,\n         youtube_id: youtubeId\n       }"
  if (d.indexOf(anchorPayloadField) !== -1 && d.indexOf('drive_id: driveIdGal') === -1) {
    d = d.replace(anchorPayloadField, "media_source: mediaSource,\n         youtube_id: youtubeId,\n         drive_id: driveIdGal\n       }")
    berubah = true
    console.log('[BERHASIL] Payload galeri menyertakan drive_id')
  }

  // 5g. Update startEditLog agar memuat driveLink dari drive_id
  const anchorEditLogDrive = "driveLink: it.media_source === 'drive' ? driveViewUrl(it.media_path) : ''"
  if (d.indexOf(anchorEditLogDrive) !== -1) {
    d = d.replace(anchorEditLogDrive, "driveLink: it.drive_id ? driveViewUrl(it.drive_id) : ''")
    berubah = true
    console.log('[BERHASIL] startEditLog memuat driveLink dari drive_id')
  } else {
    console.log('[INFO] Pola driveLink startEditLog tidak ditemukan atau sudah diubah')
  }

  // 5h. Update startEditGal agar memuat driveLink dari drive_id
  const anchorEditGalDrive = "setGalDriveLink(g.media_source === 'drive' ? driveViewUrl(g.media_path) : '')"
  if (d.indexOf(anchorEditGalDrive) !== -1) {
    d = d.replace(anchorEditGalDrive, "setGalDriveLink(g.drive_id ? driveViewUrl(g.drive_id) : '')")
    berubah = true
    console.log('[BERHASIL] startEditGal memuat driveLink dari drive_id')
  } else {
    console.log('[INFO] Pola driveLink startEditGal tidak ditemukan atau sudah diubah')
  }

  if (berubah) simpan(FILE_DASH, d)
} else {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
}

/* ============================================================
   6. Verifikasi
   ============================================================ */
console.log('')
console.log('Verifikasi:')
const vCards = ada(FILE_CARDS) ? baca(FILE_CARDS) : ''
const vUi = ada(FILE_UI) ? baca(FILE_UI) : ''
const vDash = ada(FILE_DASH) ? baca(FILE_DASH) : ''
console.log((vCards.indexOf('drive: i.drive_id || null') !== -1 ? '[OK] ' : '[BELUM] ') + 'slidesFromItems meneruskan drive_id')
console.log((vUi.indexOf('props.driveId') !== -1 && vUi.indexOf('driveDownloadUrl(props.driveId)') !== -1 ? '[OK] ' : '[BELUM] ') + 'Lightbox memakai driveId untuk download')
console.log((vDash.indexOf('drive_id: driveIdLog') !== -1 ? '[OK] ' : '[BELUM] ') + 'submitLogbook menyimpan drive_id')
console.log((vDash.indexOf('drive_id: driveIdGal') !== -1 ? '[OK] ' : '[BELUM] ') + 'submitGaleri menyimpan drive_id')
console.log((vDash.indexOf('it.drive_id ? driveViewUrl(it.drive_id)') !== -1 ? '[OK] ' : '[BELUM] ') + 'startEditLog memuat dari drive_id')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja fitur ini:')
console.log('1. Tampilan video di web sepenuhnya dari YouTube embed, tidak berubah.')
console.log('2. Google Drive hanya sebagai sumber tombol download file asli.')
console.log('3. Di dashboard, pilih mode Video, isi link YouTube untuk tampilan, lalu isi link Google Drive pada field opsional untuk unduhan.')
console.log('4. Di halaman publik, video diputar lewat YouTube. Saat lightbox dibuka, tombol download muncul jika ada link Drive.')
console.log('5. Klik tombol download: file diunduh dari Google Drive dengan bypass peringatan virus untuk file di atas 100 MB.')
console.log('')
console.log('Langkah uji:')
console.log('1. Jalankan SQL migrasi di Supabase SQL Editor untuk menambah kolom drive_id.')
console.log('2. Buka dashboard, buat kegiatan dengan mode Video, isi link YouTube dan link Google Drive.')
console.log('3. Simpan, buka halaman publik: video tampil sebagai YouTube player.')
console.log('4. Klik video hingga masuk lightbox, lalu klik tombol unduh: file asli terunduh dari Google Drive.')