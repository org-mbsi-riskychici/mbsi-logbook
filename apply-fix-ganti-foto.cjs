const fs = require('fs')
const path = require('path')
const root = process.cwd()

console.log('Mulai memperbaiki agar file lama terhapus saat ganti foto profil...')
console.log('')

fs.writeFileSync(path.join(root, 'src/lib/profil.js'), `import { supabase } from './supabase.js'
import { siapkanFotoProfil } from './konversi.js'

const MAKS_FOTO_PROFIL = 5 * 1024 * 1024

async function hapusFileLama(fotoUrlLama) {
  if (!fotoUrlLama) return
  const bagian = String(fotoUrlLama).split('/foto-profil/')
  if (bagian[1]) {
    try {
      await supabase.storage.from('foto-profil').remove([decodeURIComponent(bagian[1])])
    } catch (e) {
      console.warn('Gagal menghapus foto lama dari storage:', e.message)
    }
  }
}

export async function uploadFotoProfil(file, userId, fotoUrlLama) {
  if (!file) throw new Error('File foto tidak ditemukan')
  const tipe = String(file.type || '').toLowerCase()
  if (tipe.indexOf('image/') !== 0 && tipe.indexOf('heic') === -1 && tipe.indexOf('heif') === -1) {
    throw new Error('File harus berupa gambar')
  }
  if (file.size > MAKS_FOTO_PROFIL) throw new Error('Ukuran foto maksimal 5 MB')

  const siap = await siapkanFotoProfil(file, 640, 0.85)
  const namaFile = userId + '/profil-' + Date.now() + '.webp'

  // Hapus file lama dari storage sebelum upload file baru
  await hapusFileLama(fotoUrlLama)

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
  await hapusFileLama(fotoUrl)
  const { error } = await supabase.from('mahasiswa').update({ foto_profil: null }).eq('id', mahasiswaId)
  if (error) throw new Error(error.message)
}
`, 'utf8')
console.log('[BERHASIL] src/lib/profil.js ditulis ulang dengan penghapusan file lama saat ganti foto')

/* ===== 2. DashboardPage: kirim fotoUrlLama ke uploadFotoProfil ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (fs.existsSync(path.join(root, FILE_D))) {
  let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
  let berubah = false

  // Cari pemanggilan uploadFotoProfil(fotoFile, mahasiswa.id) dan tambahkan parameter ketiga
  const cari = 'uploadFotoProfil(fotoFile, mahasiswa.id)'
  const ganti = 'uploadFotoProfil(fotoFile, mahasiswa.id, mahasiswa.foto_profil)'
  if (d.includes(cari) && !d.includes(ganti)) {
    d = d.split(cari).join(ganti)
    berubah = true
    console.log('[BERHASIL] Parameter fotoUrlLama ditambahkan ke pemanggilan uploadFotoProfil')
  } else if (d.includes(ganti)) {
    console.log('[SUDAH ADA] Parameter fotoUrlLama sudah ada')
  } else {
    console.log('[TIDAK KETEMU] Pemanggilan uploadFotoProfil di DashboardPage')
  }

  if (berubah) {
    fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Alur baru saat ganti foto profil:')
console.log('1. User memilih foto baru dan klik Simpan.')
console.log('2. Foto baru dikonversi ke WebP 640px seperti biasa.')
console.log('3. SEBELUM upload file baru, file lama dihapus dari Supabase Storage.')
console.log('4. File baru diunggah dengan nama unik baru.')
console.log('5. URL baru disimpan ke kolom foto_profil di database.')
console.log('6. Hasilnya: hanya ada SATU file per user di storage, tidak ada sampah menumpuk.')
console.log('')
console.log('Alur saat hapus foto profil:')
console.log('1. User klik Hapus Foto.')
console.log('2. File dihapus dari storage.')
console.log('3. Kolom foto_profil di database dikosongkan.')
console.log('4. Avatar kembali ke inisial berwarna tema.')
console.log('')
console.log('Pembersihan file lama yang sudah terlanjur menumpuk (opsional):')
console.log('Buka Supabase Dashboard > Storage > bucket foto-profil > folder UUID user')
console.log('Hapus manual file-file profil-xxxxx.webp yang lama (sisakan yang terbaru saja).')