const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}
function ganti(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}
function gantiSemua(rel, cari, gantiDengan, label) {
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.split(cari).join(gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memperbaiki pemulihan respons final upload YouTube...')
console.log('')

/* ===== 1. youtube.js: pulihkan id video bila respons final diblokir CORS ===== */
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
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
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
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload YouTube gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = sesi.data.session ? sesi.data.session.access_token : ''
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    const j = await r.json()
    if (j.videoId) return { videoId: j.videoId }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.')
}
`)

/* ===== 2. Endpoint pemulihan id video terbaru ===== */
simpan('api/youtube/latest.js', `import { createClient } from '@supabase/supabase-js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const params = new URLSearchParams()
  params.set('client_id', process.env.YOUTUBE_CLIENT_ID || '')
  params.set('client_secret', process.env.YOUTUBE_CLIENT_SECRET || '')
  params.set('refresh_token', process.env.YOUTUBE_REFRESH_TOKEN || '')
  params.set('grant_type', 'refresh_token')
  const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!tr.ok) return res.status(500).json({ error: 'Gagal refresh token YouTube' })
  const tok = await tr.json()
  const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', {
    headers: { Authorization: 'Bearer ' + tok.access_token }
  })
  if (!r.ok) return res.status(502).json({ error: 'Gagal memeriksa video terbaru' })
  const j = await r.json()
  const item = (j.items || [])[0]
  if (!item) return res.status(404).json({ error: 'Tidak ada video ditemukan' })
  const published = Date.parse(item.snippet.publishedAt)
  if (Date.now() - published > 15 * 60 * 1000) return res.status(404).json({ error: 'Video terbaru terlalu lama' })
  return res.status(200).json({ videoId: item.id.videoId })
}
`)

/* ===== 3. Kuota harian menjadi 5 di endpoint Vercel ===== */
simpan('api/youtube/quota.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
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
`)
simpan('api/youtube/session.js', `import { createClient } from '@supabase/supabase-js'
const LIMIT = 5
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
`)

/* ===== 4. Middleware dev lokal: endpoint latest dan kuota 5 ===== */
ganti('vite.config.js',
  `        server.middlewares.use('/api/youtube/session'`,
  `        server.middlewares.use('/api/youtube/latest', async function (req, res) {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
          const user = await cekSesi(req)
          if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
          const params = new URLSearchParams()
          params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
          params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
          params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
          params.set('grant_type', 'refresh_token')
          const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
          if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
          const tok = await tr.json()
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=1', { headers: { Authorization: 'Bearer ' + tok.access_token } })
          if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
          const j = await r.json()
          const item = (j.items || [])[0]
          if (!item) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Tidak ada video ditemukan' })); return }
          const published = Date.parse(item.snippet.publishedAt)
          if (Date.now() - published > 15 * 60 * 1000) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru terlalu lama' })); return }
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ videoId: item.id.videoId }))
        })
        server.middlewares.use('/api/youtube/session'`,
  'Middleware /api/youtube/latest untuk dev lokal')
gantiSemua('vite.config.js', 'used >= 6', 'used >= 5', 'Batas kuota middleware session menjadi 5')
gantiSemua('vite.config.js', '6 - used', '5 - used', 'Sisa kuota middleware menjadi 5')

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil lagi dari form logbook atau galeri.')
console.log('2. Progres mencapai 100 persen lalu aplikasi otomatis memulihkan id video dari channel.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian kini tampil sebagai X dari 5 karena setiap upload memakai 1600 unit')
console.log('   ditambah 100 unit untuk pemulihan id video, total 8500 dari 10000 unit harian.')