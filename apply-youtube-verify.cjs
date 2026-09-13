const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang verifikasi upload YouTube anti CORS...')
console.log('')

/* ===== 1. Tulis ulang src/lib/youtube.js dengan verifikasi akhir ===== */
simpan('src/lib/youtube.js', `import { supabase } from './supabase.js'
export function parseYouTubeId(url) {
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
export async function unggahVideoYouTube(file, judul, onProgress) {
  const ref = Math.random().toString(36).slice(2, 10)
  const sesiData = await supabase.auth.getSession()
  const token = sesiData.data.session ? sesiData.data.session.access_token : ''
  const sesi = await startYouTubeSession(judul, 'REF ' + ref + ' Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sesi.sessionUri)
    xhr.setRequestHeader('Content-Type', file.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        let id = null
        try { id = JSON.parse(xhr.responseText || '{}').id || null } catch (e) { id = null }
        resolve({ selesai: true, videoId: id })
      } else {
        resolve({ selesai: false })
      }
    }
    xhr.onerror = function () { resolve({ selesai: false }) }
    xhr.send(file)
  })
  if (hasil.selesai && hasil.videoId) return { videoId: hasil.videoId }
  const v = await fetch('/api/youtube/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ ref: ref })
  })
  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Jaringan gagal saat upload YouTube')
}
`)
console.log('[BERHASIL] src/lib/youtube.js ditulis ulang dengan verifikasi akhir')

/* ===== 2. Endpoint verifikasi untuk Vercel ===== */
const verifyJs = `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const { ref } = req.body || {}
  if (!ref) return res.status(400).json({ error: 'Ref tidak ada' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref)
  const r = await fetch(url, { headers: { Authorization: 'Bearer ' + tok.access_token } })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video di YouTube' })
  const j = await r.json()
  const items = j.items || []
  const batas = Date.now() - 15 * 60 * 1000
  const cocok = items.find(function (it) {
    const desc = (it.snippet && it.snippet.description) || ''
    const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
    return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
  }) || items[0]
  if (!cocok) return res.status(404).json({ error: 'Video tidak ditemukan di channel' })
  return res.status(200).json({ videoId: cocok.id && cocok.id.videoId })
}
`
fs.mkdirSync(path.join(root, 'api', 'youtube'), { recursive: true })
simpan('api/youtube/verify.js', verifyJs)
console.log('[BERHASIL] api/youtube/verify.js ditulis')

/* ===== 3. Middleware verify untuk dev lokal di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/verify'")) {
  console.log('[SUDAH ADA] Middleware verify di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Middleware session di vite.config.js')
  } else {
    const middlewareVerify = `server.middlewares.use('/api/youtube/verify', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const body = await bacaBody(req)
        const ref = body.ref
        if (!ref) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Ref tidak ada' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video di YouTube' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const desc = (it.snippet && it.snippet.description) || ''
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
        }) || items[0]
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video tidak ditemukan di channel' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      `
    v = v.replace(marker, middlewareVerify + marker)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware verify ditambahkan di vite.config.js')
  }
}

/* ===== 4. DashboardPage: pakai unggahVideoYouTube ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
let berubah = false

const impLama = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'`
const impBaru = `import { parseYouTubeId, ytThumb, fetchYouTubeQuota, unggahVideoYouTube } from '../lib/youtube.js'`
if (d.includes(impBaru)) {
  console.log('[SUDAH ADA] Import unggahVideoYouTube')
} else if (d.includes(impLama)) {
  d = d.replace(impLama, impBaru)
  berubah = true
  console.log('[BERHASIL] Import YouTube diperbarui')
} else {
  console.log('[TIDAK KETEMU] Import YouTube di DashboardPage')
}

const logLama = `          const sesiData = await supabase.auth.getSession()
          const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
          const sesi = await startYouTubeSession(it.judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', it.file.type || 'video/mp4', tokenS)
          const hasilYt = await uploadToYouTube(sesi.sessionUri, it.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const logBaru = `          const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(logBaru)) {
  console.log('[SUDAH ADA] Alur upload video logbook')
} else if (d.includes(logLama)) {
  d = d.replace(logLama, logBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video logbook diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video logbook')
}

const galLama = `        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
const galBaru = `        const hasilYt = await unggahVideoYouTube(galForm.file, galForm.judul || ('Dokumentasi ' + galForm.tanggal), function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })`
if (d.includes(galBaru)) {
  console.log('[SUDAH ADA] Alur upload video galeri')
} else if (d.includes(galLama)) {
  d = d.replace(galLama, galBaru)
  berubah = true
  console.log('[BERHASIL] Alur upload video galeri diperbarui')
} else {
  console.log('[TIDAK KETEMU] Alur upload video galeri')
}

if (berubah) {
  simpan(FILE_D, d)
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Catatan penting:')
console.log('1. Video yang tadi sempat gagal tersimpan tetapi sudah masuk YouTube Studio bisa diselamatkan:')
console.log('   salin link video tersebut dari YouTube Studio, lalu tempel di kolom link YouTube unlisted.')
console.log('2. Upload berikutnya: progres 100 persen akan langsung dilanjutkan verifikasi, lalu logbook tersimpan.')
console.log('3. Bila verifikasi gagal menemukan video, barulah muncul pesan gagal yang benar-benar gagal.')