const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.log('[LEWATI] File tidak ditemukan: ' + rel)
    return
  }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + rel)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

if (!fs.existsSync(path.join(root, 'src/lib/upload.js')) || !baca('src/lib/upload.js').includes('buatThumbnail')) {
  console.log('[PERINGATAN] Fitur thumbnail belum terpasang di upload.js.')
  console.log('Jalankan dulu SQL kolom media_thumb lalu node apply-thumbnail.cjs sebelum script ini.')
  process.exit(1)
}

console.log('Mulai memperluas pembersihan R2 supaya thumbnail ikut terhapus...')
console.log('')

/* ===== 1. Hapus logbook ikut menghapus thumbnail ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `      const urls = (target.data.logbook_items || []).map(function (it) { return it.media_path }).filter(Boolean)
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)`,
  `      const urls = []
      ;(target.data.logbook_items || []).forEach(function (it) {
        if (it.media_path) urls.push(it.media_path)
        if (it.media_thumb) urls.push(it.media_thumb)
      })
      await supabase.from('logbooks').delete().eq('id', target.data.id)
      for (const u of urls) await hapusMediaR2(u)`,
  'Hapus logbook ikut menghapus thumbnail'
)

/* ===== 2. Hapus galeri manual ikut menghapus thumbnail ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `      const url = target.data.logbook_item_id ? '' : target.data.media_path
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      if (url) await hapusMediaR2(url)`,
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)
      await supabase.from('galeri').delete().eq('id', target.data.id)
      if (target.data.logbook_item_id) {
        await supabase.from('logbook_items').update({ show_in_gallery: false }).eq('id', target.data.logbook_item_id)
      }
      for (const u of urls) await hapusMediaR2(u)`,
  'Hapus galeri manual ikut menghapus thumbnail'
)

/* ===== 3. Edit logbook mencatat thumbnail lama ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `        const oldItems = await supabase.from('logbook_items').select('media_path').eq('logbook_id', editLogId)
        oldUrls = (oldItems.data || []).map(function (it) { return it.media_path }).filter(Boolean)`,
  `        const oldItems = await supabase.from('logbook_items').select('media_path, media_thumb').eq('logbook_id', editLogId)
        oldUrls = []
        ;(oldItems.data || []).forEach(function (it) {
          if (it.media_path) oldUrls.push(it.media_path)
          if (it.media_thumb) oldUrls.push(it.media_thumb)
        })`,
  'Edit logbook mencatat thumbnail lama'
)

/* ===== 4. Pembersihan edit logbook membandingkan thumbnail juga ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `      const newUrls = clean.map(function (c) { return c.media_path }).filter(Boolean)`,
  `      const newUrls = []
      clean.forEach(function (c) {
        if (c.media_path) newUrls.push(c.media_path)
        if (c.media_thumb) newUrls.push(c.media_thumb)
      })`,
  'Pembersihan edit logbook membandingkan thumbnail juga'
)

/* ===== 5. Edit galeri ikut menghapus thumbnail lama ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `      let oldGalUrl = ''
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        oldGalUrl = existing && !existing.logbook_item_id && existing.media_path !== payload.media_path ? existing.media_path : ''
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      if (oldGalUrl) await hapusMediaR2(oldGalUrl)`,
  `      let oldGalUrls = []
      if (editGalId) {
        const existing = galeri.find(function (g) { return g.id === editGalId })
        if (existing && !existing.logbook_item_id && existing.media_path !== payload.media_path) {
          oldGalUrls = [existing.media_path, existing.media_thumb].filter(Boolean)
        }
        await supabase.from('galeri').update(payload).eq('id', editGalId)
      } else {
        await supabase.from('galeri').insert(payload)
      }
      for (const u of oldGalUrls) await hapusMediaR2(u)`,
  'Edit galeri ikut menghapus thumbnail lama'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Unggah logbook baru dengan satu foto beresolusi besar.')
console.log('2. Buka bucket R2: harus ada file asli di folder logbook dan file kecil di folder thumb/logbook.')
console.log('3. Buka dashboard: kartu dan carousel memakai thumbnail sehingga tampilan kecil terlihat mulus.')
console.log('4. Perbesar foto lewat lightbox: yang terbuka adalah file asli yang tajam.')
console.log('5. Hapus logbook tersebut: kedua file di bucket harus hilang bersamaan.')
console.log('6. Edit logbook berfoto lalu ganti fotonya: file asli lama dan thumbnail lama harus terhapus.')