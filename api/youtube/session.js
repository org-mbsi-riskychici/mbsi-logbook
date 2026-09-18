import { createClient } from '@supabase/supabase-js'
import { LIMIT_PER_PROJECT, ptToday, daftarKredensial, getAccessToken } from '../_lib/youtube.js'
import { cekSesi } from '../_lib/sesi.js'
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const authHeader = req.headers.authorization || ''
  if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'Belum login' })
  const chkUser = await cekSesi(process.env, authHeader)
  if (!chkUser) return res.status(401).json({ error: 'Sesi tidak valid' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial(process.env)
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
    await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: chkUser.id, project_id: kred.n })
    return res.status(200).json({ sessionUri: sessionUri, project: kred.n })
  }
  return res.status(429).json({ error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
}
