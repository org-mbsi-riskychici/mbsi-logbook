import { createClient } from '@supabase/supabase-js'
import { LIMIT_PER_PROJECT, ptToday, daftarKredensial, getAccessToken } from '../_lib/youtube.js'
import { cekSesi } from '../_lib/sesi.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const chkUser = await cekSesi(process.env, authHeader)
  if (!chkUser) return res.status(401).json({ error: 'Sesi tidak valid' })
  const kredensial = daftarKredensial(process.env)
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
