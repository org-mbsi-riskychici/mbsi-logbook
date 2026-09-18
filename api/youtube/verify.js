import { cekSesi } from '../_lib/sesi.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const chkUser = await cekSesi(process.env, authHeader)
  if (!chkUser) return res.status(401).json({ error: 'Sesi tidak valid' })
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
