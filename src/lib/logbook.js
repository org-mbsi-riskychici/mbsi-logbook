import { supabase } from './supabase.js'

const EMPTY = '00000000-0000-0000-0000-000000000000'

export async function syncGaleriFromLogbook(pesertaId, items, meta) {
  const itemIds = items.map(function (i) { return i.id }).filter(Boolean)
  const all = await supabase
    .from('galeri')
    .select('id, logbook_item_id')
    .in('logbook_item_id', itemIds.length ? itemIds : [EMPTY])
  const existing = new Map((all.data || []).map(function (g) { return [g.logbook_item_id, g.id] }))

  for (const item of items) {
    if (!item.id) continue
    if (item.show_in_gallery && item.media_path) {
      const payload = {
        peserta_id: pesertaId,
        logbook_item_id: item.id,
        judul: item.judul,
        deskripsi: item.deskripsi || 'Dokumentasi kegiatan dari logbook harian.',
        tanggal: meta.tanggal,
        kegiatan: meta.kategori,
        media_path: item.media_path,
        media_type: item.media_type || 'foto'
      }
      if (existing.has(item.id)) {
        await supabase.from('galeri').update(payload).eq('id', existing.get(item.id))
      } else {
        await supabase.from('galeri').insert(payload)
      }
    } else if (existing.has(item.id)) {
      await supabase.from('galeri').delete().eq('id', existing.get(item.id))
    }
  }
}
