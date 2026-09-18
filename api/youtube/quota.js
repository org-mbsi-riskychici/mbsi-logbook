import { createClient } from '@supabase/supabase-js'
import { LIMIT_PER_PROJECT, ptToday, daftarKredensial, getAccessToken } from '../_lib/youtube.js'
import { cekSesi } from '../_lib/sesi.js'
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const admin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const today = ptToday()
  const kredensial = daftarKredensial(process.env)
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
