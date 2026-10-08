import { cekSesi } from '../_lib/sesi.js'
import { susunLogbookAi } from '../_lib/ai-provider.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })
  const user = await cekSesi(process.env, req.headers.authorization)
  if (!user) return res.status(401).json({ error: 'Sesi tidak valid' })

  const { draft, kategori, unit } = req.body || {}
  if (!draft || !String(draft).trim()) {
    return res.status(400).json({ error: 'Tuliskan dulu catatan kasar kegiatanmu.' })
  }

  try {
    const hasil = await susunLogbookAi(process.env, {
      draft: draft,
      kategoriList: Array.isArray(kategori) ? kategori : [],
      unitList: Array.isArray(unit) ? unit : []
    })
    return res.status(200).json(hasil)
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Gagal memanggil AI' })
  }
}