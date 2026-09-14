import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

export async function uploadFotoProfil(file, userId) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0) throw new Error('File harus berupa gambar')
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')
  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'
  const { error } = await supabase.storage
    .from('foto-profil')
    .upload(namaFile, siap, { upsert: true, contentType: siap.type })
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('foto-profil').getPublicUrl(namaFile)
  return data.publicUrl
}

export async function updateFotoProfilMahasiswa(mahasiswaId, fotoUrl) {
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: fotoUrl }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}

export async function hapusFotoProfil(mahasiswaId, fotoUrl) {
  if (fotoUrl) {
    const bagian = String(fotoUrl).split('/foto-profil/')
    if (bagian[1]) {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    }
  }
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
