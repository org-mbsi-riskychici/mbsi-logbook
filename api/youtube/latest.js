import { createClient } from '@supabase/supabase-js'
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
  if (!r.ok) { const t = await r.text(); return res.status(502).json({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t }) }
  const j = await r.json()
  const item = (j.items || [])[0]
  if (!item) return res.status(404).json({ error: 'Tidak ada video ditemukan' })
  const published = Date.parse(item.snippet.publishedAt)
  if (Date.now() - published > 15 * 60 * 1000) return res.status(404).json({ error: 'Video terbaru terlalu lama' })
  return res.status(200).json({ videoId: item.id.videoId })
}
