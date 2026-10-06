import { supabase } from './supabase.js'
import { MULAI_MAGANG } from './constants.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(mahasiswaId, items, meta) {
  const itemIds = items.map(function (i) { return i.id }).filter(Boolean)
  const all = await supabase
    .from('galeri')
    .select('id, logbook_item_id')
    .in('logbook_item_id', itemIds.length ? itemIds : [EMPTY])
  const existing = new Map((all.data || []).map(function (g) { return [g.logbook_item_id, g.id] }))

  for (const item of items) {
    if (!item.id) continue
    if (item.show_in_gallery && item.media_path) {
      if (existing.has(item.id)) {
        await supabase.from('galeri').update({
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null,
          media_source: item.media_source || 'r2',
          youtube_id: item.youtube_id || null
        }).eq('id', existing.get(item.id))
      } else {
        await supabase.from('galeri').insert({
          mahasiswa_id: mahasiswaId,
          logbook_item_id: item.id,
          judul: item.judul,
          deskripsi: item.deskripsi || 'Dokumentasi kegiatan dari logbook harian.',
          tanggal: meta.tanggal,
          kegiatan: meta.kategori,
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null,
          media_source: item.media_source || 'r2',
          youtube_id: item.youtube_id || null
        })
      }
    } else if (existing.has(item.id)) {
      await supabase.from('galeri').delete().eq('id', existing.get(item.id))
    }
  }
}

/* ===== AUTO-BOLOS =====
   Untuk setiap hari kerja (Sen-Jum) dari MULAI_MAGANG s/d KEMARIN yang belum
   ada catatan hadir, otomatis isi sebagai "Bolos".
   Hari ini TIDAK di-auto-Bolos supaya user masih punya kesempatan isi absen.

   Dipanggil di refresh() DashboardPage. Aman dijalankan berulang karena
   unique constraint (mahasiswa_id, tanggal) di DB mencegah duplikat.

   Return: array tanggal ISO yang baru di-auto-Bolos (buat re-fetch di caller). */
function pad2(n) { return (n < 10 ? '0' : '') + n }
function isoDari(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()) }

export async function autoIsiBolos(mahasiswaId, tanggalSudahAda) {
  const sudahAda = new Set(tanggalSudahAda || [])
  const d = new Date(MULAI_MAGANG + 'T00:00:00')
  const batas = new Date()
  batas.setDate(batas.getDate() - 1) // kemarin

  const rows = []
  while (d <= batas) {
    const iso = isoDari(d)
    const hari = d.getDay()
    if (hari !== 0 && hari !== 6 && !sudahAda.has(iso)) {
      rows.push({
        mahasiswa_id: mahasiswaId,
        tanggal: iso,
        status: 'Bolos',
        alasan: 'Terisi otomatis: Tidak ada keterangan pada tanggal ini.'
      })
    }
    d.setDate(d.getDate() + 1)
  }

  if (!rows.length) return []

  const res = await supabase.from('daftar_hadir').insert(rows)
  if (res.error) {
    // Bisa terjadi race condition dengan tab lain yang sedang jalan auto-bolos.
    // Unique constraint (mahasiswa_id, tanggal) mencegah duplikat, jadi error ini aman diabaikan.
    console.warn('Auto-Bolos dilewati:', res.error.message)
    return []
  }
  return rows.map(function (r) { return r.tanggal })
}