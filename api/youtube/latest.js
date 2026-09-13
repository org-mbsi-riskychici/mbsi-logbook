import { createClient } from '@supabase/supabase-js'
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
export default async function handler(req, res) {
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
