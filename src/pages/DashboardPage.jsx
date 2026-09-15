import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia, deleteMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'
import { uploadFotoProfil, updateFotoProfilMahasiswa, hapusFotoProfil } from '../lib/profil.js'
import { Avatar } from '../components/ui.jsx'
import { supabase as sbClient } from '../lib/supabase.js'
import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'
import { todayInput, detectMediaType, matchesDateFilters, urutkanTanggal } from '../lib/format.js'
import { KATEGORI, UNIT, GALERI_KEGIATAN } from '../lib/constants.js'
import { EmptyState, Modal, ConfirmModal, inputCls, labelCls, btnPrimary, btnSmall, AutoTextArea, Pagination, useToast } from '../components/ui.jsx'
import { LogbookCard, LogbookDetail, GalleryCard, GalleryDetail, AttendanceCard, AttendanceDetail } from '../components/cards.jsx'
import { CustomSelect, CustomDateInput, FileInput } from '../components/controls.jsx'
import { SizedIcon, ICONS } from '../components/icons.jsx'
import { FilterBar, FilterSelect, TimeFilter, countActiveFilters, SortSelect } from '../components/FilterBar.jsx'

function newItem() {
  return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }
}

const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const GAL_INITIAL = { kegiatan: '', tipe: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const HADIR_INITIAL = { status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }
const PER_PAGE_DASH = 6

function ModeIndicator(props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ' + (props.edit ? 'bg-gold-500/15 text-gold-600' : 'bg-bsi-100 text-bsi-900')}>
        <span className={'h-2 w-2 rounded-full ' + (props.edit ? 'bg-gold-500' : 'bg-bsi-500')}></span>
        {props.edit ? 'Mode Edit' : 'Mode Tambah'}
      </span>
      {props.edit ? (
        <button type="button" onClick={props.onCancel}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100">
          <SizedIcon name="close" size={12} />
          Batal Edit
        </button>
      ) : null}
    </div>
  )
}

export default function DashboardPage() {
  const { mahasiswa, loading } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('logbook')
  const [logs, setLogs] = useState([])
  const [galeri, setGaleri] = useState([])
  const [hadir, setHadir] = useState([])
  const [detail, setDetail] = useState(null)

  const [form, setForm] = useState({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
  const [items, setItems] = useState([newItem()])
  const [editLogId, setEditLogId] = useState(null)

  const [galForm, setGalForm] = useState({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
  const [editGalId, setEditGalId] = useState(null)

  const [hadirForm, setHadirForm] = useState({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  const [editHadirId, setEditHadirId] = useState(null)

  const [busy, setBusy] = useState(false)
  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)
  const [showUploadFoto, setShowUploadFoto] = useState(false)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [fotoFile, setFotoFile] = useState(null)
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const [, setVersiFoto] = useState(0)
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)
  const [itemMode, setItemMode] = useState({})
  const [galYtTitle, setGalYtTitle] = useState('')
  const [pendingDelete, setPendingDelete] = useState(null)

  const [logFilter, setLogFilter] = useState(LOG_INITIAL)
  const [logFilterOpen, setLogFilterOpen] = useState(false)
  const [galFilter, setGalFilter] = useState(GAL_INITIAL)
  const [galFilterOpen, setGalFilterOpen] = useState(false)
  const [hadirFilter, setHadirFilter] = useState(HADIR_INITIAL)
  const [hadirFilterOpen, setHadirFilterOpen] = useState(false)
  const [sort, setSort] = useState('terbaru')
   const [logPage, setLogPage] = useState(1)
   const [galPage, setGalPage] = useState(1)
   const [hadirPage, setHadirPage] = useState(1)
   const refListLog = useRef(null)
   const refListGal = useRef(null)
   const refListHadir = useRef(null)

  async function refresh() {
    if (!mahasiswa) return
    const l = await supabase.from('logbooks').select('*, mahasiswa(*), logbook_items(*)')
      .eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
      .order('urutan', { ascending: true, referencedTable: 'logbook_items' })
    const g = await supabase.from('galeri').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    const h = await supabase.from('daftar_hadir').select('*, mahasiswa(*)').eq('mahasiswa_id', mahasiswa.id).order('tanggal', { ascending: false })
    setLogs(l.data || [])
    setGaleri(g.data || [])
    setHadir(h.data || [])
  }

  useEffect(function () {
    if (mahasiswa) refresh()
    setYtQuotaLoading(true)
    fetchYouTubeQuota().then(function (data) {
      setYtQuota(data)
      setYtQuotaLoading(false)
    })
    const iv = setInterval(function () { fetchYouTubeQuota().then(function (data) { setYtQuota(data); setYtQuotaLoading(false) }) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])

   useEffect(function () {
     setLogPage(1)
     setGalPage(1)
     setHadirPage(1)
   }, [logFilter, galFilter, hadirFilter, sort])

  if (loading || !mahasiswa) {
    return <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
<div className="space-y-6">
<div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-14 w-14 rounded-2xl"></div>
<div className="flex-1 space-y-2">
<div className="skeleton h-4 w-44 rounded-full"></div>
<div className="skeleton h-3 w-28 rounded-full"></div>
</div>
<div className="skeleton h-10 w-28 rounded-2xl"></div>
</div>
<div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
<div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-5 w-36 rounded-full"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-20 w-full rounded-2xl"></div>
<div className="skeleton h-11 w-44 rounded-2xl"></div>
</div>
<div className="grid gap-5 md:grid-cols-2">
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
</div>
</div>
</div>
</div>
  }

  function getItemMode(i) { return itemMode[i] || 'foto' }
  function setItemModeAt(i, mode) { setItemMode(function (p) { const n = Object.assign({}, p); n[i] = mode; return n }) }
  function patchItem(i, patch) {
    setItems(function (prev) {
      return prev.map(function (it, idx) { return idx === i ? Object.assign({}, it, patch) : it })
    })
  }

  async function onItemFile(i, file) {
    if (!file) return
    if (formatHeic(file)) {
      patchItem(i, { file: file, preview: '', previewLoading: true })
      const blob = await pratinjauHeic(file)
      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(file)
      patchItem(i, { preview: preview, previewLoading: false })
    } else {
      patchItem(i, { file: file, preview: URL.createObjectURL(file), previewLoading: false })
    }
  }

  function removeItemFile(i) {
    patchItem(i, { file: null, preview: '', oldPath: '', previewLoading: false, show: false })
  }

  function keyDariUrl(url) {
    try {
      return new URL(url).pathname.slice(1)
    } catch (e) {
      return ''
    }
  }

  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)
    if (!key) {
      console.warn('URL media tidak valid, dilewati:', url)
      return
    }
    try {
      await deleteMedia(key)
      console.log('Media R2 terhapus:', key)
    } catch (err) {
      console.error('Gagal hapus media R2:', key, err.message)
    }
  }

  async function submitLogbook(e) {
    e.preventDefault()
    setBusy(true)
     const menambahLog = !editLogId
    try {
      const clean = []
      for (let i = 0; i < items.length; i++) {
        const it = items[i]
        if (!it.judul.trim()) continue
        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { toast.gagal('Link video tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { toast.gagal('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
          mediaSource = 'youtube'
          youtubeId = hasilYt.videoId
          mediaPath = ytThumb(hasilYt.videoId)
          mediaThumb = ytThumb(hasilYt.videoId)
          mediaType = 'video'
          setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
          fetchYouTubeQuota().then(setYtQuota)
        } else if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
          mediaSource = 'r2'
          youtubeId = null
        } else if (it.mode === 'video' && !it.file && !it.ytLink && it.oldYtId) {
          mediaSource = 'youtube'
          youtubeId = it.oldYtId
          mediaPath = ytThumb(it.oldYtId)
          mediaThumb = ytThumb(it.oldYtId)
          mediaType = 'video'
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })
      }
      if (!clean.length) { toast.gagal('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }

      let logId = editLogId
      let oldUrls = []
      if (editLogId) {
        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })
        await supabase.from('logbooks').update({
          tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).eq('id', editLogId)
        await supabase.from('logbook_items').delete().eq('logbook_id', editLogId)
      } else {
        const ins = await supabase.from('logbooks').insert({
          mahasiswa_id: mahasiswa.id, tanggal: form.tanggal, unit: form.unit, kategori: form.kategori, judul: form.judul,
          kendala: form.kendala, solusi: form.solusi, pembelajaran: form.pembelajaran, status: form.status
        }).select().single()
        logId = ins.data.id
      }

      const rows = clean.map(function (c, idx) {
        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }
      })
      const insItems = await supabase.from('logbook_items').insert(rows).select()
      await syncGaleriFromLogbook(mahasiswa.id, insItems.data || [], { tanggal: form.tanggal, kategori: form.kategori })

      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })
      for (const u of oldUrls) {
        if (newUrls.indexOf(u) === -1) await hapusMediaR2(u)
      }

      setEditLogId(null)
      setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
      setItems([newItem()])
      await refresh()
       if (menambahLog) setLogPage(1)
       toast.sukses(menambahLog ? 'Logbook berhasil disimpan' : 'Logbook berhasil diperbarui')
    } catch (err) {
      toast.gagal('Gagal menyimpan logbook: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function startEditLog(log) {
    setEditLogId(log.id)
    setForm({
      tanggal: log.tanggal, unit: log.unit || '', kategori: log.kategori, judul: log.judul,
      kendala: log.kendala || '', solusi: log.solusi || '', pembelajaran: log.pembelajaran || '', status: log.status
    })
    const mapped = (log.logbook_items || []).map(function (it) {
      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: it.media_source === 'youtube' && it.youtube_id ? 'https://youtu.be/' + it.youtube_id : '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }
    })
    setItems(mapped.length ? mapped : [newItem()])
    setTab('logbook')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditLog() {
    setEditLogId(null)
    setForm({ tanggal: todayInput(), unit: '', kategori: '', judul: '', kendala: '', solusi: '', pembelajaran: '', status: 'draft' })
    setItems([newItem()])
  }

  function startEditGal(g) {
    setEditGalId(g.id)
    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink(g.media_source === 'youtube' && g.youtube_id ? 'https://youtu.be/' + g.youtube_id : '')
    setGalOldYt(g.youtube_id || null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditGal() {
    setEditGalId(null)
    setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
  }

  function startEditHadir(h) {
    setEditHadirId(h.id)
    setHadirForm({ tanggal: h.tanggal, status: h.status, alasan: h.alasan || '' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditHadir() {
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
  }

  function deleteLog(log) {
    setPendingDelete({ type: 'log', data: log })
  }

  async function submitGaleri(e) {
    e.preventDefault()
    setBusy(true)
     const menambahGal = !editGalId
    try {
      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { toast.gagal('Link video tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { toast.gagal('Kuota upload video hari ini sudah habis. Gunakan link video.'); setBusy(false); return }
        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
        mediaSource = 'r2'
        youtubeId = null
      } else if (galMode === 'video' && !galForm.file && !galYtLink && galOldYt) {
        mediaSource = 'youtube'
        youtubeId = galOldYt
        mediaPath = ytThumb(galOldYt)
        mediaThumb = ytThumb(galOldYt)
        mediaType = 'video'
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { toast.gagal('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }
      let oldGalUrls = []
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      for (const u of oldGalUrls) await hapusMediaR2(u)
      setEditGalId(null)
      setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)
      await refresh()
       if (menambahGal) setGalPage(1)
       toast.sukses(menambahGal ? 'Media galeri berhasil disimpan' : 'Media galeri berhasil diperbarui')
    } catch (err) {
      toast.gagal('Gagal menyimpan galeri: ' + err.message)
    }
    setInfoProses('')
    setBusy(false)
  }

  function deleteGaleri(item) {
    setPendingDelete({ type: 'gal', data: item })
  }

    function pilihFotoProfil(e) {
    const f = e.target.files[0]
    if (!f) return
    if (f.size > 5 * 1024 * 1024) { toast.gagal('Ukuran foto maksimal 5 MB.'); e.target.value = ''; return }
    setFotoFile(f)
    const reader = new FileReader()
    reader.onloadend = function () { setFotoPreview(reader.result) }
    reader.readAsDataURL(f)
  }
  async function simpanFotoProfil() {
    if (!fotoFile) { toast.gagal('Pilih file foto terlebih dahulu.'); return }
    setUploadingFoto(true)
    try {
      const url = await uploadFotoProfil(fotoFile, mahasiswa.id, mahasiswa.foto_profil)
      await updateFotoProfilMahasiswa(mahasiswa.id, url)
      mahasiswa.foto_profil = url
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
      setShowUploadFoto(false)
      setFotoPreview(null)
      setFotoFile(null)
      toast.sukses('Foto profil berhasil disimpan')
    } catch (err) {
      toast.gagal('Gagal upload foto profil: ' + err.message)
    }
    setUploadingFoto(false)
  }
  async function hapusFotoProfilKu() {
    if (!window.confirm('Hapus foto profil saat ini?')) return
    try {
      await hapusFotoProfil(mahasiswa.id, mahasiswa.foto_profil)
      mahasiswa.foto_profil = null
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })
      toast.sukses('Foto profil berhasil dihapus')
    } catch (err) {
      toast.gagal('Gagal menghapus foto profil: ' + err.message)
    }
  }
async function submitHadir(e) {
    e.preventDefault()
    setBusy(true)
     const menambahHadir = !editHadirId
    const payload = { mahasiswa_id: mahasiswa.id, tanggal: hadirForm.tanggal, status: hadirForm.status, alasan: hadirForm.status === 'Masuk' ? '' : hadirForm.alasan }
    if (editHadirId) {
      await supabase.from('daftar_hadir').update(payload).eq('id', editHadirId)
    } else {
      const res = await supabase.from('daftar_hadir').insert(payload)
      if (res.error) { toast.gagal('Kamu sudah punya catatan hadir di tanggal tersebut.'); setBusy(false); return }
    }
    setEditHadirId(null)
    setHadirForm({ tanggal: todayInput(), status: 'Masuk', alasan: '' })
    await refresh()
     if (menambahHadir) setHadirPage(1)
     toast.sukses(menambahHadir ? 'Daftar hadir berhasil disimpan' : 'Daftar hadir berhasil diperbarui')
    setInfoProses('')
    setBusy(false)
  }

  function deleteHadir(row) {
    setPendingDelete({ type: 'hadir', data: row })
  }

  function confirmInfo() {
    if (!pendingDelete) return null
    if (pendingDelete.type === 'media-item') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada kegiatan ini akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'media-gal') {
      return {
        title: 'Hapus gambar?',
        message: 'Lampiran gambar pada form galeri akan dibatalkan. Kamu bisa memilih file lain setelahnya.'
      }
    }
    if (pendingDelete.type === 'log') {
      return {
        title: 'Hapus logbook?',
        message: 'Logbook "' + pendingDelete.data.judul + '" beserta seluruh rincian kegiatannya akan dihapus permanen. Media galeri yang terhubung dari logbook ini juga ikut terhapus.'
      }
    }
    if (pendingDelete.type === 'gal') {
      const extra = pendingDelete.data.logbook_item_id
        ? ' Media ini berasal dari logbook, jadi logbook asalnya tidak ikut terhapus. Centang tampilan galeri pada kegiatan logbook akan dimatikan dan bisa dinyalakan lagi kapan saja.'
        : ''
      return {
        title: 'Hapus media galeri?',
        message: 'Media "' + pendingDelete.data.judul + '" akan dihapus permanen dari galeri kamu.' + extra
      }
    }
    return {
      title: 'Hapus catatan hadir?',
      message: 'Catatan kehadiran tanggal ' + pendingDelete.data.tanggal + ' dengan status ' + pendingDelete.data.status + ' akan dihapus permanen.'
    }
  }

  async function executeDelete() {
    if (!pendingDelete) return
    const target = pendingDelete
    setPendingDelete(null)
    if (target.type === 'media-item') {
      removeItemFile(target.data)
      return
    }
    if (target.type === 'media-gal') {
      setGalForm(function (g) { return Object.assign({}, g, { file: null, preview: '', oldPath: '' }) })
      return
    }
    if (target.type === 'log') {
      const urls = []
      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'gal') {
      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      for (const u of urls) await hapusMediaR2(u)
    } else if (target.type === 'hadir') {
      await supabase.from('daftar_hadir').delete().eq('id', target.data.id)
    }
    await refresh()
    toast.sukses('Data berhasil dihapus')
  }

  const filteredLogs = logs.filter(function (l) {
    if (logFilter.kategori && l.kategori !== logFilter.kategori) return false
    if (logFilter.status && l.status !== logFilter.status) return false
    return matchesDateFilters(l.tanggal, logFilter)
  })
  const sortedLogs = urutkanTanggal(filteredLogs, sort)
  const logFilterActive = countActiveFilters(logFilter)

  const filteredGaleri = galeri.filter(function (g) {
    if (galFilter.kegiatan && (g.kegiatan || 'Lainnya') !== galFilter.kegiatan) return false
    if (galFilter.tipe && g.media_type !== galFilter.tipe) return false
    return matchesDateFilters(g.tanggal, galFilter)
  })
  const sortedGaleri = urutkanTanggal(filteredGaleri, sort)
  const galFilterActive = countActiveFilters(galFilter)

  const filteredHadir = hadir.filter(function (h) {
    if (hadirFilter.status && h.status !== hadirFilter.status) return false
    return matchesDateFilters(h.tanggal, hadirFilter)
  })
  const sortedHadir = urutkanTanggal(filteredHadir, sort)
  const hadirFilterActive = countActiveFilters(hadirFilter)
   const logTotal = filteredLogs.length
   const logTotalPages = Math.max(1, Math.ceil(logTotal / PER_PAGE_DASH))
   const logPageAman = Math.min(logPage, logTotalPages)
   const paginatedLogs = sortedLogs.slice((logPageAman - 1) * PER_PAGE_DASH, logPageAman * PER_PAGE_DASH)
   const galTotal = filteredGaleri.length
   const galTotalPages = Math.max(1, Math.ceil(galTotal / PER_PAGE_DASH))
   const galPageAman = Math.min(galPage, galTotalPages)
   const paginatedGaleri = sortedGaleri.slice((galPageAman - 1) * PER_PAGE_DASH, galPageAman * PER_PAGE_DASH)
   const hadirTotal = filteredHadir.length
   const hadirTotalPages = Math.max(1, Math.ceil(hadirTotal / PER_PAGE_DASH))
   const hadirPageAman = Math.min(hadirPage, hadirTotalPages)
   const paginatedHadir = sortedHadir.slice((hadirPageAman - 1) * PER_PAGE_DASH, hadirPageAman * PER_PAGE_DASH)
   function gantiHalamanLog(p) {
     setLogPage(p)
     if (refListLog.current) refListLog.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanGal(p) {
     setGalPage(p)
     if (refListGal.current) refListGal.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }
   function gantiHalamanHadir(p) {
     setHadirPage(p)
     if (refListHadir.current) refListHadir.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
   }

  const editGalDerived = editGalId ? ((galeri.find(function (g) { return g.id === editGalId }) || {}).logbook_item_id || null) : null

  const tabCls = function (t) {
    return 'px-5 py-3 rounded-2xl text-sm font-bold ' + (tab === t ? 'bg-bsi-800 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
  }

  return (
    <div>
      <section className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 lg:p-10 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-6">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl"  onClick={function () { setTab('profil') }} title="Kelola foto profil" />
<div className="min-w-0 flex-1">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">{mahasiswa.nama}</h1>
            <p className="text-sm text-slate-500">NIM {mahasiswa.nim}</p>
{mahasiswa.prodi ? <p className="text-sm text-slate-500">{mahasiswa.prodi}</p> : null}
          </div>
        </div>
        </div>
<div className="mt-8 flex flex-wrap gap-2">
          <button onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button onClick={function () { setTab('galeri') }} className={tabCls('galeri')}>Galeri</button>
          <button onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
<button onClick={function () { setTab('profil') }} className={tabCls('profil')}>Profil</button>
        </div>
      
</div></section>

      {tab === 'profil' ? (
<section className="anim-tab mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm flex flex-col items-center text-center">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" />
<h2 className="mt-4 text-xl font-black text-slate-900">{mahasiswa.nama}</h2>
<p className="mt-1 text-sm text-slate-500">NIM {mahasiswa.nim}</p>
<div className="mt-5 flex flex-wrap justify-center gap-2">
<button type="button" onClick={function () { setShowUploadFoto(!showUploadFoto) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition">{mahasiswa.foto_profil ? 'Ganti Foto' : 'Upload Foto'}</button>
{mahasiswa.foto_profil ? <button type="button" onClick={hapusFotoProfilKu} className="px-4 py-2 rounded-xl text-sm font-bold bg-red-50 text-red-700 hover:bg-red-100 transition">Hapus Foto</button> : null}
</div>
{showUploadFoto ? (
<div className="mt-5 w-full border-t border-slate-200 pt-5 text-left">
<div className="flex flex-wrap items-start gap-4">
{fotoPreview ? <img src={fotoPreview} alt="Pratinjau foto profil" className="h-20 w-20 rounded-[28%] object-cover shadow-lg" /> : null}
<div className="min-w-0 flex-1">
<input type="file" accept="image/png,image/jpeg,image/webp,image/heic,image/heif" onChange={pilihFotoProfil} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100" />
<p className="mt-2 text-xs text-slate-500">Format JPG, PNG, WebP, atau HEIC iPhone. Otomatis dikonversi ke WebP ringan. Maksimal 5 MB.</p>
</div>
</div>
<div className="mt-4 flex gap-2">
<button type="button" onClick={simpanFotoProfil} disabled={uploadingFoto || !fotoFile} className="px-4 py-2 rounded-xl text-sm font-bold bg-bsi-800 text-white hover:bg-bsi-700 transition disabled:opacity-50">{uploadingFoto ? 'Mengunggah...' : 'Simpan Foto'}</button>
<button type="button" onClick={function () { setShowUploadFoto(false); setFotoPreview(null); setFotoFile(null) }} className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition">Batal</button>
</div>
</div>
) : null}
</div>
<div className="card-hover rounded-[2rem] bg-white border border-slate-200 p-8 shadow-sm">
<h2 className="text-lg font-black text-slate-900">Ringkasan aktivitas magang</h2>
<div className="mt-4 grid grid-cols-3 gap-4">
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof logs !== 'undefined' ? logs.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Logbook</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof galeri !== 'undefined' ? galeri.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Media Galeri</p></div>
<div className="rounded-2xl bg-slate-50 p-4 text-center"><p className="text-2xl font-black text-bsi-800">{typeof hadir !== 'undefined' ? hadir.length : 0}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Kehadiran</p></div>
</div>
<div className="mt-6 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
<p>Foto profil tampil otomatis di kartu kamu pada halaman publik, logbook, galeri, dan daftar hadir.</p>
<p>Gunakan foto dengan pencahayaan baik dan wajah terlihat jelas agar mudah dikenali dosen pembimbing.</p>
<p>Klik foto pada kartu header kapan saja untuk kembali ke halaman ini dan memperbarui foto.</p>
</div>
</div>
</section>
) : null}

{tab === 'logbook' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editLogId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editLogId} onCancel={cancelEditLog} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editLogId ? 'Ubah logbook harian' : 'Tambah logbook harian'}</h2>
            <form onSubmit={submitLogbook} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={form.tanggal} onChange={function (v) { setForm(Object.assign({}, form, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Unit utama</label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih unit" value={form.unit}
                      onChange={function (v) { setForm(Object.assign({}, form, { unit: v })) }}
                      options={UNIT.map(function (u) { return { value: u, label: u } })} />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Kategori utama <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect placeholder="Pilih kategori" value={form.kategori}
                      onChange={function (v) { setForm(Object.assign({}, form, { kategori: v })) }}
                      options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status tampil</label>
                  <div className="mt-1.5">
                    <CustomSelect value={form.status}
                      onChange={function (v) { setForm(Object.assign({}, form, { status: v })) }}
                      options={[{ value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Ringkasan hari ini <span className="text-red-500">*</span></label>
                <input required className={inputCls} value={form.judul} onChange={function (e) { setForm(Object.assign({}, form, { judul: e.target.value })) }} placeholder="Contoh: Kegiatan harian di divisi Back Office" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
                  <button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
                </div>
                {items.map(function (it, i) {
                  return (
                    <div key={it.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-bsi-800">Kegiatan {i + 1}</span>
                        {items.length > 1 ? <button type="button" onClick={function () { setItems(function (p) { return p.filter(function (x, idx) { return idx !== i }) }) }} className="text-xs text-red-600 hover:underline">Hapus</button> : null}
                      </div>
                      <input className={inputCls} value={it.judul} onChange={function (e) { patchItem(i, { judul: e.target.value }) }} placeholder="Judul kegiatan" />
                      <AutoTextArea className={inputCls} value={it.deskripsi} onChange={function (e) { patchItem(i, { deskripsi: e.target.value }) }} placeholder="Deskripsi singkat kegiatan" />
                      <input className={inputCls} value={it.hasil} onChange={function (e) { patchItem(i, { hasil: e.target.value }) }} placeholder="Hasil (opsional)" />
                      {it.previewLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                            <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                          </div>
                        </div>
                      ) : null}
                      {it.preview ? (
                        <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                          {it.file && it.file.type.indexOf('video') === 0
                            ? <video src={it.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                            : <img src={it.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                          <button type="button" onClick={function () { setPendingDelete({ type: 'media-item', data: i }) }} title="Hapus gambar"
                            className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                            <SizedIcon name="close" size={14} />
                          </button>
                        </div>
                      ) : null}
                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link video eksternal" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}
                      <label className={'flex items-start gap-3 rounded-2xl border p-3 cursor-pointer w-full ' + (it.preview ? (it.show ? 'border-gold-500 bg-gold-500/5' : 'border-slate-200') : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed')}>
                        <input type="checkbox" disabled={!it.preview} checked={it.show} onChange={function (e) { patchItem(i, { show: e.target.checked }) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                        <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                      </label>
                    </div>
                  )
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div><label className={labelCls}>Kendala</label><AutoTextArea className={inputCls} value={form.kendala} onChange={function (e) { setForm(Object.assign({}, form, { kendala: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Solusi</label><AutoTextArea className={inputCls} value={form.solusi} onChange={function (e) { setForm(Object.assign({}, form, { solusi: e.target.value })) }} placeholder="Opsional" /></div>
                <div><label className={labelCls}>Pembelajaran</label><AutoTextArea className={inputCls} value={form.pembelajaran} onChange={function (e) { setForm(Object.assign({}, form, { pembelajaran: e.target.value })) }} placeholder="Opsional" /></div>
              </div>

              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editLogId ? 'Simpan perubahan' : 'Simpan logbook')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListLog} className="text-2xl font-black text-slate-900 scroll-mt-24">Logbook kamu</h2>
            <FilterBar open={logFilterOpen} onToggle={function () { setLogFilterOpen(function (o) { return !o }) }} activeCount={logFilterActive}
              onReset={function () { setLogFilter(LOG_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={logFilter.kategori} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { kategori: v })) }}
                options={[{ value: '', label: 'Semua kategori' }].concat(KATEGORI.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.check} value={logFilter.status} onChange={function (v) { setLogFilter(Object.assign({}, logFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'draft', label: 'Draft' }, { value: 'publik', label: 'Siap dilihat' }]} />
              <TimeFilter filter={logFilter} set={setLogFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Total {filteredLogs.length} logbook{logTotalPages > 1 ? ' • Halaman ' + logPageAman + ' dari ' + logTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
              {paginatedLogs.map(function (l) {
                return <LogbookCard key={l.id} log={l} isOwner
                  onDetail={function () { setDetail({ type: 'log', data: l }) }}
                  onEdit={function () { startEditLog(l) }}
                  onDelete={function () { deleteLog(l) }} />
              })}
            </div>
            {!filteredLogs.length ? <EmptyState title={logs.length ? 'Logbook tidak ditemukan' : 'Belum ada logbook'} desc={logs.length ? 'Coba reset filter atau pilih filter lain.' : 'Tambahkan logbook harian pertama kamu.'} /> : null}
             <Pagination totalItems={logTotal} perPage={PER_PAGE_DASH} page={logPageAman} onPageChange={gantiHalamanLog} />
          </div>
        </section>
      ) : null}

      {tab === 'galeri' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editGalId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editGalId} onCancel={cancelEditGal} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editGalId ? 'Ubah media galeri' : 'Tambah media galeri'}</h2>
            <form onSubmit={submitGaleri} className="mt-6 space-y-4">
              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link video di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link video eksternal" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>
              </div>
              {galForm.previewLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-video grid place-items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-9 w-9 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div>
                    <p className="text-xs font-semibold text-slate-500">Mengonversi pratinjau</p>
                  </div>
                </div>
              ) : null}
              {galForm.preview ? (
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-slate-900">
                  {galForm.file && galForm.file.type.indexOf('video') === 0
                    ? <video src={galForm.preview} controls playsInline preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
                    : <img src={galForm.preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />}
                  <button type="button" onClick={function () { setPendingDelete({ type: 'media-gal' }) }} title="Hapus gambar"
                    className="absolute top-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className={labelCls}>Judul (opsional)</label><input className={inputCls} value={galForm.judul} onChange={function (e) { setGalForm(Object.assign({}, galForm, { judul: e.target.value })) }} placeholder="Kosongkan untuk judul otomatis" /></div>
                <div>
                  <label className={labelCls}>Tanggal (opsional)</label>
                  <div className="mt-1.5">
                    <CustomDateInput value={galForm.tanggal} onChange={function (v) { setGalForm(Object.assign({}, galForm, { tanggal: v })) }} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Kegiatan (opsional)</label>
                <div className="mt-1.5">
                  <CustomSelect placeholder="Pilih kegiatan" value={galForm.kegiatan}
                    onChange={function (v) { setGalForm(Object.assign({}, galForm, { kegiatan: v })) }}
                    options={GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } })} />
                </div>
                {editGalDerived ? <p className="mt-1 text-xs text-slate-400">Media ini berasal dari logbook. Perubahan judul, deskripsi, kegiatan, dan tanggal hanya memengaruhi galeri dan tidak akan ditimpa saat logbook disimpan.</p> : null}
              </div>
              <div><label className={labelCls}>Deskripsi (opsional)</label><AutoTextArea className={inputCls} value={galForm.deskripsi} onChange={function (e) { setGalForm(Object.assign({}, galForm, { deskripsi: e.target.value })) }} placeholder="Tambahkan keterangan media." /></div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> : (editGalId ? 'Simpan perubahan media' : 'Unggah media')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListGal} className="text-2xl font-black text-slate-900 scroll-mt-24">Galeri kamu</h2>
            <FilterBar open={galFilterOpen} onToggle={function () { setGalFilterOpen(function (o) { return !o }) }} activeCount={galFilterActive}
              onReset={function () { setGalFilter(GAL_INITIAL) }}>
              <FilterSelect icon={ICONS.tag} value={galFilter.kegiatan} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { kegiatan: v })) }}
                options={[{ value: '', label: 'Semua kegiatan' }].concat(GALERI_KEGIATAN.map(function (k) { return { value: k, label: k } }))} />
              <FilterSelect icon={ICONS.image} value={galFilter.tipe} onChange={function (v) { setGalFilter(Object.assign({}, galFilter, { tipe: v })) }}
                options={[{ value: '', label: 'Semua media' }, { value: 'foto', label: 'Foto' }, { value: 'video', label: 'Video' }]} />
              <TimeFilter filter={galFilter} set={setGalFilter} />
              <SortSelect value={sort} onChange={setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Total {filteredGaleri.length} media{galTotalPages > 1 ? ' • Halaman ' + galPageAman + ' dari ' + galTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
              {paginatedGaleri.map(function (g) {
                return <GalleryCard key={g.id} item={g} isOwner
                  onDetail={function () { setDetail({ type: 'gal', data: g }) }}
                  onEdit={function () { startEditGal(g) }}
                  onDelete={function () { deleteGaleri(g) }} />
              })}
              {!filteredGaleri.length ? <EmptyState icon="camera" title={galeri.length ? 'Media tidak ditemukan' : 'Belum ada media galeri'} desc={galeri.length ? 'Coba reset filter atau pilih filter lain.' : 'Unggah foto atau video pertama kamu.'} /> : null}
            </div>
            <Pagination totalItems={galTotal} perPage={PER_PAGE_DASH} page={galPageAman} onPageChange={gantiHalamanGal} />
          </div>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="anim-tab mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr] items-start">
          <div className={'card-hover bg-white rounded-[2rem] border shadow-sm p-8 min-w-0 ' + (editHadirId ? 'border-gold-500 ring-1 ring-gold-500' : 'border-slate-200')}>
            <ModeIndicator edit={!!editHadirId} onCancel={cancelEditHadir} />
            <h2 className="mt-3 text-2xl font-black text-slate-900">{editHadirId ? 'Ubah daftar hadir' : 'Isi daftar hadir'}</h2>
            <form onSubmit={submitHadir} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Tanggal <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomDateInput value={hadirForm.tanggal} onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { tanggal: v })) }} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Status kehadiran <span className="text-red-500">*</span></label>
                  <div className="mt-1.5">
                    <CustomSelect value={hadirForm.status}
                      onChange={function (v) { setHadirForm(Object.assign({}, hadirForm, { status: v, alasan: v === 'Masuk' ? '' : hadirForm.alasan })) }}
                      options={[{ value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelCls}>Alasan atau keterangan</label>
                <AutoTextArea
                  className={inputCls + (hadirForm.status === 'Masuk' ? ' opacity-60 cursor-not-allowed' : '')}
                  value={hadirForm.alasan}
                  onChange={function (e) { setHadirForm(Object.assign({}, hadirForm, { alasan: e.target.value })) }}
                  placeholder={hadirForm.status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                  disabled={hadirForm.status === 'Masuk'}
                />
                {hadirForm.status === 'Masuk' ? <p className="mt-1 text-xs text-slate-400">Field ini hanya terisi untuk status Izin atau Bolos.</p> : null}
              </div>
              <button type="submit" disabled={busy} className={btnPrimary}>{busy ? <LabelProses teks="Menyimpan" /> : (editHadirId ? 'Simpan perubahan' : 'Simpan daftar hadir')}</button>
            </form>
          </div>

          <div className="space-y-5 min-w-0">
            <h2 ref={refListHadir} className="text-2xl font-black text-slate-900 scroll-mt-24">Daftar hadir kamu</h2>
            <FilterBar open={hadirFilterOpen} onToggle={function () { setHadirFilterOpen(function (o) { return !o }) }} activeCount={hadirFilterActive}
              onReset={function () { setHadirFilter(HADIR_INITIAL) }}>
              <FilterSelect icon={ICONS.check} value={hadirFilter.status} onChange={function (v) { setHadirFilter(Object.assign({}, hadirFilter, { status: v })) }}
                options={[{ value: '', label: 'Semua status' }, { value: 'Masuk', label: 'Masuk' }, { value: 'Izin', label: 'Izin' }, { value: 'Bolos', label: 'Bolos' }]} />
              <TimeFilter filter={hadirFilter} set={setHadirFilter} />
              <SortSelect value={sort} onChange={setHadirFilterOpen && setSort ? setSort : setSort} />
            </FilterBar>
            <p className="text-sm text-slate-500">Total {filteredHadir.length} catatan{hadirTotalPages > 1 ? ' • Halaman ' + hadirPageAman + ' dari ' + hadirTotalPages : ''}</p>
            <div className="grid gap-5 md:grid-cols-2 kartu-grid">
            {paginatedHadir.map(function (h) {
              return <AttendanceCard key={h.id} row={h} isOwner
                onDetail={function () { setDetail({ type: 'hadir', data: h }) }}
                onEdit={function () { startEditHadir(h) }}
                onDelete={function () { deleteHadir(h) }} />
            })}
            </div>
            {!filteredHadir.length ? <EmptyState icon="clipboard" title={hadir.length ? 'Catatan tidak ditemukan' : 'Belum ada data kehadiran'} desc={hadir.length ? 'Coba reset filter atau pilih filter lain.' : 'Isi daftar hadir pertama kamu.'} /> : null}
             <Pagination totalItems={hadirTotal} perPage={PER_PAGE_DASH} page={hadirPageAman} onPageChange={gantiHalamanHadir} />
          </div>
        </section>
      ) : null}

      <Modal open={!!detail} onClose={function () { setDetail(null) }}>
        {detail && detail.type === 'log' ? <LogbookDetail log={detail.data} /> : null}
        {detail && detail.type === 'gal' ? <GalleryDetail item={detail.data} /> : null}
        {detail && detail.type === 'hadir' ? <AttendanceDetail row={detail.data} /> : null}
      </Modal>

      <ConfirmModal
open={!!pendingDelete}
title={pendingDelete && confirmInfo() ? confirmInfo().title : ''}
message={pendingDelete && confirmInfo() ? confirmInfo().message : ''}
onCancel={function () { setPendingDelete(null) }}
onConfirm={executeDelete}
/>
    </div>
  )
}