const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ganti(rel, cari, gantiDengan, label, semua) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = semua ? isi.split(cari).join(gantiDengan) : isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function tulis(rel, isi, label) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang fitur media YouTube menyeluruh...')
console.log('')

/* ===== 1. api/youtube/quota.js ===== */
tulis('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count, error } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = error ? 0 : (count || 0)
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: LIMIT, used: used, remaining: Math.max(0, LIMIT - used), ptDate: today })
}
`, 'api/youtube/quota.js ditulis')

/* ===== 2. api/youtube/session.js ===== */
tulis('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 6
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
async function getAccessToken() {
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('Gagal refresh token YouTube')
  const j = await r.json()
  if (!j.access_token) throw new Error('Token akses YouTube tidak diterima')
  return j.access_token
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
  const used = count || 0
  if (used >= LIMIT) return res.status(429).json({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed atau coba lagi setelah reset kuota.', remaining: 0 })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let access
  try { access = await getAccessToken() } catch (e) { return res.status(500).json({ error: e.message }) }
  const meta = {
    snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
    status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
  }
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri: sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`, 'api/youtube/session.js ditulis')

/* ===== 3. src/lib/youtube.js ===== */
tulis('src/lib/youtube.js', `export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 6, used: 0, remaining: 6 }
    return await r.json()
  } catch (e) {
    return { limit: 6, used: 0, remaining: 6 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal membuat sesi YouTube' } })
    throw new Error(j.error || 'Gagal membuat sesi YouTube')
  }
  return await r.json()
}
export function uploadToYouTube(sessionUri, blob, onProgress) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const j = JSON.parse(xhr.responseText || '{}')
          resolve({ videoId: j.id })
        } catch (e) { reject(new Error('Respons YouTube tidak valid')) }
      } else {
        reject(new Error('Upload YouTube gagal (status ' + xhr.status + ')'))
      }
    }
    xhr.onerror = function () { reject(new Error('Jaringan gagal saat upload YouTube')) }
    xhr.send(blob)
  })
}
`, 'src/lib/youtube.js ditulis')

/* ===== 4. DashboardPage: import dan state ===== */
ganti('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`,
  'Import helper YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  const [infoProses, setInfoProses] = useState('')`,
  `  const [infoProses, setInfoProses] = useState('')
  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })
  const [galMode, setGalMode] = useState('foto')
  const [galYtLink, setGalYtLink] = useState('')
  const [galOldYt, setGalOldYt] = useState(null)`,
  'State YouTube di DashboardPage')
ganti('src/pages/DashboardPage.jsx',
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')
ganti('src/pages/DashboardPage.jsx',
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false }`,
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false, show: false, mode: 'foto', ytLink: '', oldYtId: null, oldSource: 'r2' }`,
  'newItem menyimpan mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 5. DashboardPage: logika simpan logbook ===== */
ganti('src/pages/DashboardPage.jsx',
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, show_in_gallery: it.show && !!mediaPath })`,
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        let mediaSource = it.oldSource || 'r2'
        let youtubeId = it.oldYtId || null
        if (it.mode === 'video' && it.ytLink && !it.file) {
          const id = parseYouTubeId(it.ytLink)
          if (!id) { alert('Link YouTube tidak valid pada kegiatan ' + (i + 1) + '.'); setBusy(false); return }
          mediaSource = 'youtube'
          youtubeId = id
          mediaPath = ytThumb(id)
          mediaThumb = ytThumb(id)
          mediaType = 'video'
        } else if (it.mode === 'video' && it.file) {
          if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
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
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
          mediaSource = 'r2'
          youtubeId = null
        }
        clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, media_source: mediaSource, youtube_id: youtubeId, show_in_gallery: it.show && !!mediaPath })`,
  'Cabang YouTube pada submitLogbook')
ganti('src/pages/DashboardPage.jsx',
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, show_in_gallery: c.show_in_gallery }`,
  `        return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, media_source: c.media_source, youtube_id: c.youtube_id, show_in_gallery: c.show_in_gallery }`,
  'rows logbook membawa kolom YouTube')
ganti('src/pages/DashboardPage.jsx',
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb, media_source').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_source === 'youtube') return
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  'oldUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_source === 'youtube') return
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  'newUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', oldThumb: it.media_thumb || '', previewLoading: false, show: it.show_in_gallery }`,
  `      return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_source === 'youtube' ? '' : (it.media_path || ''), oldThumb: it.media_source === 'youtube' ? '' : (it.media_thumb || ''), previewLoading: false, show: it.show_in_gallery, mode: it.media_source === 'youtube' ? 'video' : (it.media_type === 'video' ? 'video' : 'foto'), ytLink: '', oldYtId: it.youtube_id || null, oldSource: it.media_source || 'r2' }`,
  'startEditLog membawa mode dan YouTube')

/* ===== 6. DashboardPage: logika simpan galeri ===== */
ganti('src/pages/DashboardPage.jsx',
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri', function (pesan) { setInfoProses(pesan) })
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
      const payload = {
        mahasiswa_id: mahasiswa.id,
        judul: galForm.judul || ('Dokumentasi ' + galForm.tanggal),
        deskripsi: galForm.deskripsi,
        tanggal: galForm.tanggal,
        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
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
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
        mediaSource = 'r2'
        youtubeId = null
      }
      if (!mediaPath) { alert('Galeri wajib memiliki media. Pilih file foto atau video terlebih dahulu.'); setBusy(false); return }
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
      }`,
  'Cabang YouTube pada submitGaleri')
ganti('src/pages/DashboardPage.jsx',
  `        if (existing && !existing.logbook_item_id && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  `        if (existing && !existing.logbook_item_id && existing.media_source !== 'youtube' && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }`,
  'oldGalUrls melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`,
  `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })
     setGalMode('foto')
     setGalYtLink('')
     setGalOldYt(null)`,
  'Reset mode galeri setelah simpan dan batal', true)
ganti('src/pages/DashboardPage.jsx',
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `    setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')
ganti('src/pages/DashboardPage.jsx',
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  `      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_source === 'youtube') return
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })`,
  'Hapus logbook melewatkan media YouTube')

/* ===== 7. DashboardPage: UI pemilih jenis media ===== */
ganti('src/pages/DashboardPage.jsx',
  `                      <FileInput accept="image/*,video/*" fileName={it.file ? it.file.name : ''}
                        onChange={function (e) { onItemFile(i, e.target.files[0]) }} />`,
  `                      <div className="flex gap-2">
                        <button type="button" onClick={function () { patchItem(i, { mode: 'foto' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                        <button type="button" onClick={function () { patchItem(i, { mode: 'video' }) }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (it.mode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                      </div>
                      {it.mode === 'video' ? (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                          <div className={ytQuota.remaining <= 0 && !it.file ? 'opacity-50 pointer-events-none' : ''}>
                            <FileInput accept="video/*" fileName={it.file ? it.file.name : ''}
                              onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                          </div>
                          {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                          <input className={inputCls} value={it.ytLink} onChange={function (e) { patchItem(i, { ytLink: e.target.value }) }} placeholder="Atau tempel link YouTube (unlisted)" />
                        </div>
                      ) : (
                        <FileInput accept="image/*" fileName={it.file ? it.file.name : ''}
                          onChange={function (e) { onItemFile(i, e.target.files[0]) }} />
                      )}`,
  'UI pemilih jenis media pada rincian kegiatan')
ganti('src/pages/DashboardPage.jsx',
  `              <div>
                <label className={labelCls}>Pilih foto atau video {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5">
                  <FileInput accept="image/*,video/*" fileName={galForm.file ? galForm.file.name : ''}
                    onChange={async function (e) {
                      const f = e.target.files[0]
                      if (!f) return
                      const blob = await pratinjauHeic(f)
                      const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                      setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                    }} />
                </div>
              </div>`,
  `              <div>
                <label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f) }) })
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        const blob = await pratinjauHeic(f)
                        const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                        setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: preview }) })
                      }} />
                  )}
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri')

/* ===== 8. cards.jsx: slide dan detail YouTube ===== */
ganti('src/components/cards.jsx',
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_type, title: i.judul }`,
  `    return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_source === 'youtube' ? 'foto' : i.media_type, title: i.judul, yt: i.youtube_id || null }`,
  'slidesFromItems membawa youtube_id')
ganti('src/components/cards.jsx',
  `                    <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />`,
  `                    {it.media_source === 'youtube' ? (
                      <iframe src={'https://www.youtube-nocookie.com/embed/' + it.youtube_id} title={it.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900 mb-3" />
                    ) : (
                      <ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />
                    )}`,
  'Detail logbook menampilkan embed YouTube')
ganti('src/components/cards.jsx',
  `      <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />`,
  `      {item.media_source === 'youtube' ? (
        <iframe src={'https://www.youtube-nocookie.com/embed/' + item.youtube_id} title={item.judul} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="rounded-2xl overflow-hidden aspect-video w-full bg-slate-900" />
      ) : (
        <ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />
      )}`,
  'Detail galeri menampilkan embed YouTube')

/* ===== 9. Carousel: teruskan youtubeId ke Lightbox ===== */
ganti('src/components/Carousel.jsx',
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} onClose={function () { setZoom(null) }} /> : null}`,
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} youtubeId={zoom.yt || null} onClose={function () { setZoom(null) }} /> : null}`,
  'Carousel meneruskan youtubeId ke Lightbox', true)

/* ===== 10. ui.jsx: Lightbox mendukung embed YouTube ===== */
ganti('src/components/ui.jsx',
  `        {props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  `        {props.youtubeId ? (
          <iframe src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId} title={props.title || 'Video'} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="mx-auto aspect-video w-full rounded-2xl bg-slate-900" />
        ) : props.type === 'video' ? (
          <video src={props.src} controls autoPlay className="mx-auto max-h-[85vh] w-full rounded-2xl bg-slate-900 object-contain" />
        ) : (`,
  'Lightbox menampilkan embed YouTube')
ganti('src/components/ui.jsx',
  `          disabled={busyUnduh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  `          disabled={busyUnduh}
          style={props.youtubeId ? { display: 'none' } : undefined}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"`,
  'Tombol unduh disembunyikan untuk media YouTube')

/* ===== 11. vite.config.js: middleware YouTube untuk dev lokal ===== */
ganti('vite.config.js',
  ` export default defineConfig(function ({ mode }) {`,
  ` function pluginApiYoutube(env) {
   const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY)
   function ptToday() {
     const now = new Date()
     const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
     const y = pt.getFullYear()
     const m = String(pt.getMonth() + 1).padStart(2, '0')
     const d = String(pt.getDate()).padStart(2, '0')
     return y + '-' + m + '-' + d
   }
   async function cekSesi(req) {
     const authHeader = req.headers.authorization || ''
     const token = authHeader.replace('Bearer ', '')
     if (!token) return null
     const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
     const r = await supabase.auth.getUser(token)
     return r.error ? null : r.data.user
   }
   return {
     name: 'api-youtube-dev',
     configureServer(server) {
       server.middlewares.use('/api/youtube/quota', async function (req, res) {
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         res.setHeader('Content-Type', 'application/json')
         res.setHeader('Cache-Control', 'no-store')
         res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
       })
       server.middlewares.use('/api/youtube/session', async function (req, res) {
         if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
         const user = await cekSesi(req)
         if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
         const today = ptToday()
         const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
         const used = count || 0
         if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
         const body = await bacaBody(req)
         const params = new URLSearchParams()
         params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
         params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
         params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
         params.set('grant_type', 'refresh_token')
         const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
         if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
         const tok = await tr.json()
         const meta = {
           snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
           status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
         }
         const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
           method: 'POST',
           headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
           body: JSON.stringify(meta)
         })
         if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
         const sessionUri = init.headers.get('location')
         if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
         await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
         res.setHeader('Content-Type', 'application/json')
         res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
       })
     }
   }
 }
 export default defineConfig(function ({ mode }) {`,
  'Middleware YouTube untuk dev lokal')
ganti('vite.config.js',
  `     plugins: [react(), pluginApiR2(env)]`,
  `     plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`,
  'Plugin YouTube didaftarkan di vite')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan variabel berikut ada di .env.local dan Environment Variables Vercel:')
console.log('  YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Logbook, tambah kegiatan, perhatikan tombol Foto dan Video.')
console.log('2. Pilih Video: terlihat sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link YouTube yang aktif.')
console.log('4. Simpan dengan link YouTube unlisted: kartu menampilkan thumbnail YouTube dan detail memutar embed.')
console.log('5. Uji juga upload file video kecil: progres Mengunggah ke YouTube terlihat dan video masuk sebagai unlisted.')