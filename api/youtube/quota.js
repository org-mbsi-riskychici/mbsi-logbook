import { createClient } from '@supabase/supabase-js'
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
