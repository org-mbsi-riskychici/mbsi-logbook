const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}

const KEPALA = `import { createClient } from '@supabase/supabase-js'
const LIMIT_PER_PROJECT = 5
function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}
function daftarKredensial() {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = process.env['YOUTUBE_CLIENT_ID_' + n]
    const secret = process.env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = process.env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET && process.env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: process.env.YOUTUBE_CLIENT_ID, secret: process.env.YOUTUBE_CLIENT_SECRET, refresh: process.env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}
const cacheToken = {}
async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
`

/* ===== 1. api/youtube/quota.js ===== */
simpan('api/youtube/quota.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let usedTotal = 0
  const perProject = []
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    const used = hit.count || 0
    usedTotal += used
    perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
  }
  const limit = kredensial.length * LIMIT_PER_PROJECT
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
}
`)

/* ===== 2. api/youtube/session.js ===== */
simpan('api/youtube/session.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  const body = req.body || {}
  if (!body.title) return res.status(400).json({ error: 'Judul video wajib diisi' })
  let terakhir = ''
  for (const kred of kredensial) {
    const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
    if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const meta = {
      snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
      status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
    }
    const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
      body: JSON.stringify(meta)
    })
    if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
    const sessionUri = init.headers.get('location')
    if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
    await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id, project_id: kred.n })
    return res.status(200).json({ sessionUri: sessionUri, project: kred.n })
  }
  return res.status(429).json({ error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
}
`)

/* ===== 3. api/youtube/latest.js ===== */
simpan('api/youtube/latest.js', KEPALA + `export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const authClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
  const chk = await authClient.auth.getUser()
  if (chk.error || !chk.data.user) return res.status(401).json({ error: 'Sesi tidak valid' })
  const kredensial = daftarKredensial()
  if (!kredensial.length) return res.status(500).json({ error: 'Kredensial YouTube belum dikonfigurasi di environment' })
  let terakhir = ''
  for (const kred of kredensial) {
    let access
    try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
    const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
    if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
    const j = await r.json()
    const items = j.items || []
    const batas = Date.now() - 15 * 60 * 1000
    const cocok = items.find(function (it) {
      const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
      return isNaN(t) ? false : t >= batas
    })
    if (!cocok) return res.status(404).json({ error: 'Video terbaru tidak ditemukan' })
    return res.status(200).json({ videoId: cocok.id && cocok.id.videoId, project: kred.n })
  }
  return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + terakhir })
}
`)

/* ===== 4. vite.config.js: ganti seluruh plugin YouTube ===== */
const FILE_V = 'vite.config.js'
let v = fs.readFileSync(path.join(root, FILE_V), 'utf8').replace(/\r\n/g, '\n')
const mulai = v.indexOf('function pluginApiYoutube(env) {')
const akhir = v.indexOf('export default defineConfig')
if (mulai === -1 || akhir === -1) {
  console.log('[TIDAK KETEMU] Blok pluginApiYoutube di vite.config.js')
} else if (v.includes('LIMIT_PER_PROJECT')) {
  console.log('[SUDAH ADA] Plugin YouTube multi-project di vite.config.js')
} else {
  const pluginBaru = `function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  const LIMIT_PER_PROJECT = 5
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  function daftarKredensial() {
    const list = []
    for (let n = 1; n <= 6; n++) {
      const id = env['YOUTUBE_CLIENT_ID_' + n]
      const secret = env['YOUTUBE_CLIENT_SECRET_' + n]
      const refresh = env['YOUTUBE_REFRESH_TOKEN_' + n]
      if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
    }
    if (!list.length && env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REFRESH_TOKEN) {
      list.push({ n: 1, id: env.YOUTUBE_CLIENT_ID, secret: env.YOUTUBE_CLIENT_SECRET, refresh: env.YOUTUBE_REFRESH_TOKEN })
    }
    return list
  }
  const cacheToken = {}
  async function getAccessToken(kred) {
    const now = Date.now()
    const c = cacheToken[kred.n]
    if (c && c.expire > now + 60000) return c.token
    const params = new URLSearchParams()
    params.set('client_id', kred.id)
    params.set('client_secret', kred.secret)
    params.set('refresh_token', kred.refresh)
    params.set('grant_type', 'refresh_token')
    const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
    if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
    const j = await r.json()
    cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
    return j.access_token
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let usedTotal = 0
        const perProject = []
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          const used = hit.count || 0
          usedTotal += used
          perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
        }
        const limit = kredensial.length * LIMIT_PER_PROJECT
        res.setHeader('Cache-Control', 'no-store')
        kirim(res, 200, { limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const today = ptToday()
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        const body = await bacaBody(req)
        if (!body.title) { kirim(res, 400, { error: 'Judul video wajib diisi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
          if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const meta = {
            snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
            status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
          }
          const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
            body: JSON.stringify(meta)
          })
          if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
          const sessionUri = init.headers.get('location')
          if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
          await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id, project_id: kred.n })
          kirim(res, 200, { sessionUri: sessionUri, project: kred.n })
          return
        }
        kirim(res, 429, { error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
      })
      server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
        const user = await cekSesi(req)
        if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
        const kredensial = daftarKredensial()
        if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
        let terakhir = ''
        for (const kred of kredensial) {
          let access
          try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
          const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
          if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
          const j = await r.json()
          const items = j.items || []
          const batas = Date.now() - 15 * 60 * 1000
          const cocok = items.find(function (it) {
            const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
            return isNaN(t) ? false : t >= batas
          })
          if (!cocok) { kirim(res, 404, { error: 'Video terbaru tidak ditemukan' }); return }
          kirim(res, 200, { videoId: cocok.id && cocok.id.videoId, project: kred.n })
          return
        }
        kirim(res, 502, { error: 'Gagal memeriksa video terbaru: ' + terakhir })
      })
    }
  }
}

`
  v = v.slice(0, mulai) + pluginBaru + v.slice(akhir)
  fs.writeFileSync(path.join(root, FILE_V), v, 'utf8')
  console.log('[BERHASIL] Plugin YouTube multi-project dipasang di vite.config.js')
}

console.log('')
console.log('Selesai. Restart dev server sekali: Ctrl+C lalu npm run dev -- --host')
console.log('Setelah itu rotasi project berjalan otomatis tanpa restart lagi.')