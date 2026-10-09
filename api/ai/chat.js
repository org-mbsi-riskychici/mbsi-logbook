import { createClient } from '@supabase/supabase-js'
import { jawabPertanyaanDospem } from '../_lib/dospem-chat.js'

const MAKS_PERTANYAAN = 500
const MAKS_RIWAYAT = 10

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method tidak diizinkan' })

  const body = req.body || {}
  const pertanyaan = String(body.pertanyaan || '').trim()
  const riwayat = Array.isArray(body.riwayat) ? body.riwayat.slice(-MAKS_RIWAYAT) : []

  if (!pertanyaan) return res.status(400).json({ error: 'Pertanyaan tidak boleh kosong.' })
  if (pertanyaan.length > MAKS_PERTANYAAN) {
    return res.status(400).json({ error: 'Pertanyaan terlalu panjang (maks ' + MAKS_PERTANYAAN + ' karakter).' })
  }

  try {
    const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

    const [l, p, g, h] = await Promise.all([
      sb.from('logbooks').select('id, mahasiswa_id, tanggal, kategori, judul, logbook_items(judul)')
        .eq('status', 'publik').order('tanggal', { ascending: false }).limit(200),
      sb.from('mahasiswa').select('id, nama, nim, prodi').order('nama').limit(50),
      sb.from('galeri').select('id, mahasiswa_id').limit(500),
      sb.from('daftar_hadir').select('id, mahasiswa_id, tanggal, status, alasan')
        .order('tanggal', { ascending: false }).limit(1000)
    ])

    const jawaban = await jawabPertanyaanDospem(process.env, {
      pertanyaan: pertanyaan,
      riwayat: riwayat,
      data: {
        logs: l.data || [],
        people: p.data || [],
        gal: g.data || [],
        hadir: h.data || []
      }
    })

    return res.status(200).json({ jawaban: jawaban })
  } catch (err) {
    console.error('[ai/chat]', err)
    return res.status(500).json({ error: err.message || 'Gagal memanggil AI' })
  }
}
