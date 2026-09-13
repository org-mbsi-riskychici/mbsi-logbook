const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis')
}

const LIMIT_PER_DAY = 6

const quotaJs = `import { createClient } from '@supabase/supabase-js'
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
`

const sessionJs = `import { createClient } from '@supabase/supabase-js'
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
    headers: {
      Authorization: 'Bearer ' + access,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': body.contentType || 'video/mp4'
    },
    body: JSON.stringify(meta)
  })
  if (!init.ok) { const t = await init.text(); return res.status(502).json({ error: 'Gagal memulai sesi YouTube: ' + t }) }
  const sessionUri = init.headers.get('location')
  if (!sessionUri) return res.status(502).json({ error: 'Sesi upload tidak mengembalikan lokasi' })
  await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chk.data.user.id })
  return res.status(200).json({ sessionUri, remaining: Math.max(0, LIMIT - used - 1) })
}
`

simpan('api/youtube/quota.js', quotaJs)
simpan('api/youtube/session.js', sessionJs)

console.log('\nSelesai. Push ke GitHub untuk deploy endpoint di Vercel.')