const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label, semua) {
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
  isi = semua ? isi.split(cari).join(gantiDengan) : isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai memasang thumbnail otomatis untuk tampilan kecil...')
console.log('')

/* ===== 1. upload.js ditulis ulang dengan pembuat thumbnail ===== */
const uploadBaru = `import { supabase } from './supabase.js'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

async function mintaIzin(token, filename, contentType, kind) {
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: filename, contentType: contentType, kind: kind })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal membuat izin upload (status ' + res.status + '): ' + text)
  }
  return res.json()
}

async function kirimFile(uploadUrl, blob, contentType) {
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob
  })
  if (!put.ok) {
    const text = await put.text()
    throw new Error('Gagal upload file ke R2 (status ' + put.status + '): ' + text)
  }
}

async function buatThumbnail(file, maxSisi) {
  if (!file.type.startsWith('image/')) return null
  try {
    const bitmap = await createImageBitmap(file)
    const skala = Math.min(1, maxSisi / Math.max(bitmap.width, bitmap.height))
    if (skala >= 1) {
      bitmap.close()
      return null
    }
    const w = Math.max(1, Math.round(bitmap.width * skala))
    const h = Math.max(1, Math.round(bitmap.height * skala))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()
    const blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/jpeg', 0.82)
    })
    return blob
  } catch (e) {
    return null
  }
}

export async function uploadMedia(file, kind) {
  const token = await getToken()
  const info = await mintaIzin(token, file.name, file.type, kind)
  await kirimFile(info.uploadUrl, file, file.type)
  let thumbUrl = null
  try {
    const thumbBlob = await buatThumbnail(file, 900)
    if (thumbBlob) {
      const namaThumb = file.name.replace(/\\.[^.]+$/, '') + '-thumb.jpg'
      const t = await mintaIzin(token, namaThumb, 'image/jpeg', 'thumb/' + kind)
      await kirimFile(t.uploadUrl, thumbBlob, 'image/jpeg')
      thumbUrl = t.publicUrl
    }
  } catch (e) {
    thumbUrl = null
  }
  return { path: info.key, publicUrl: info.publicUrl, thumbUrl: thumbUrl }
}

export async function deleteMedia(key) {
  const token = await getToken()
  const res = await fetch('/api/r2/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ key: key })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal hapus media di R2 (status ' + res.status + '): ' + text)
  }
  return res.json()
}
`
simpan('src/lib/upload.js', uploadBaru)
console.log('[BERHASIL] upload.js kini membuat thumbnail otomatis')

/* ===== 2. DashboardPage: state dan payload thumbnail ===== */
ganti(
  'src/pages/DashboardPage.jsx',
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', show: false }`,
  `return { key: Math.random().toString(36).slice(2), judul: '', deskripsi: '', hasil: '', file: null, preview: '', oldPath: '', oldThumb: '', show: false }`,
  'newItem menyimpan oldThumb'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `        let mediaPath = null
        let mediaType = null
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook')
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
        }`,
  `        let mediaPath = null
        let mediaType = null
        let mediaThumb = null
        if (it.file) {
          const up = await uploadMedia(it.file, 'logbook')
          mediaPath = up.publicUrl
          mediaType = it.file.type.indexOf('video') === 0 ? 'video' : 'foto'
          mediaThumb = up.thumbUrl || null
        } else if (it.oldPath) {
          mediaPath = it.oldPath
          mediaType = detectMediaType(it.oldPath)
          mediaThumb = it.oldThumb || null
        }`,
  'submitLogbook mengambil thumbUrl'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, show_in_gallery: it.show && !!mediaPath })`,
  `clean.push({ judul: it.judul.trim(), deskripsi: it.deskripsi.trim(), hasil: it.hasil.trim(), media_path: mediaPath, media_type: mediaType, media_thumb: mediaThumb, show_in_gallery: it.show && !!mediaPath })`,
  'clean logbook menyimpan media_thumb'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, show_in_gallery: c.show_in_gallery }`,
  `return { logbook_id: logId, urutan: idx + 1, judul: c.judul, deskripsi: c.deskripsi, hasil: c.hasil, media_path: c.media_path, media_type: c.media_type, media_thumb: c.media_thumb, show_in_gallery: c.show_in_gallery }`,
  'rows logbook menyimpan media_thumb'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', show: it.show_in_gallery }`,
  `return { key: it.id, judul: it.judul, deskripsi: it.deskripsi || '', hasil: it.hasil || '', file: null, preview: it.media_path || '', oldPath: it.media_path || '', oldThumb: it.media_thumb || '', show: it.show_in_gallery }`,
  'startEditLog membawa oldThumb'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `      let mediaPath = ''
      let mediaType = ''
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri')
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
      }`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {
        const up = await uploadMedia(galForm.file, 'galeri')
        mediaPath = up.publicUrl
        mediaType = galForm.file.type.indexOf('video') === 0 ? 'video' : 'foto'
        mediaThumb = up.thumbUrl || null
      } else if (galForm.oldPath) {
        mediaPath = galForm.oldPath
        mediaType = detectMediaType(galForm.oldPath)
        mediaThumb = galForm.oldThumb || null
      }`,
  'submitGaleri mengambil thumbUrl'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType
      }`,
  `        kegiatan: galForm.kegiatan || 'Lainnya',
        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  'payload galeri menyimpan media_thumb'
)
ganti(
  'src/pages/DashboardPage.jsx',
  `{ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '' }`,
  `{ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '' }`,
  'Reset galForm menyertakan oldThumb',
  true
)
ganti(
  'src/pages/DashboardPage.jsx',
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path })`,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '' })`,
  'startEditGal membawa oldThumb'
)

/* ===== 3. logbook.js: sinkronisasi ikut membawa thumbnail ===== */
ganti(
  'src/lib/logbook.js',
  `        await supabase.from('galeri').update({
          media_path: item.media_path,
          media_type: item.media_type || 'foto'
        }).eq('id', existing.get(item.id))`,
  `        await supabase.from('galeri').update({
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null
        }).eq('id', existing.get(item.id))`,
  'Sync galeri update membawa media_thumb'
)
ganti(
  'src/lib/logbook.js',
  `          kegiatan: meta.kategori,
          media_path: item.media_path,
          media_type: item.media_type || 'foto'
        })`,
  `          kegiatan: meta.kategori,
          media_path: item.media_path,
          media_type: item.media_type || 'foto',
          media_thumb: item.media_thumb || null
        })`,
  'Sync galeri insert membawa media_thumb'
)

/* ===== 4. cards.jsx: tampilan kecil memakai thumbnail ===== */
ganti(
  'src/components/cards.jsx',
  `return { src: i.media_path, type: i.media_type, title: i.judul }`,
  `return { src: i.media_thumb || i.media_path, full: i.media_path, type: i.media_type, title: i.judul }`,
  'slidesFromItems memakai thumbnail dan menyimpan file asli'
)
ganti(
  'src/components/cards.jsx',
  `<SmartFit src={item.media_path} type={item.media_type} alt={item.judul} />`,
  `<SmartFit src={item.media_thumb || item.media_path} type={item.media_type} alt={item.judul} />`,
  'Kartu galeri memakai thumbnail'
)
ganti(
  'src/components/cards.jsx',
  `<ZoomableMedia src={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />`,
  `<ZoomableMedia src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} title={item.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900" />`,
  'Detail galeri memakai thumbnail dengan fallback asli'
)
ganti(
  'src/components/cards.jsx',
  `<ZoomableMedia src={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />`,
  `<ZoomableMedia src={it.media_thumb || it.media_path} full={it.media_path} type={it.media_type} title={it.judul} className="rounded-2xl overflow-hidden aspect-video bg-slate-900 mb-3" />`,
  'Rincian logbook memakai thumbnail dengan fallback asli'
)

/* ===== 5. ui.jsx: lightbox tetap memakai file asli ===== */
ganti(
  'src/components/ui.jsx',
  `{open ? <Lightbox src={props.src} type={props.type} title={props.title} onClose={function () { setOpen(false) }} /> : null}`,
  `{open ? <Lightbox src={props.full || props.src} type={props.type} title={props.title} onClose={function () { setOpen(false) }} /> : null}`,
  'ZoomableMedia membuka file asli di lightbox'
)

/* ===== 6. Carousel.jsx: lightbox tetap memakai file asli ===== */
ganti(
  'src/components/Carousel.jsx',
  `{zoom ? <Lightbox src={zoom.src} type={zoom.type} title={zoom.title} onClose={function () { setZoom(null) }} /> : null}`,
  `{zoom ? <Lightbox src={zoom.full || zoom.src} type={zoom.type} title={zoom.title} onClose={function () { setZoom(null) }} /> : null}`,
  'Carousel membuka file asli di lightbox',
  true
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Catatan penting:')
console.log('1. Thumbnail hanya dibuat untuk upload BARU setelah script ini dijalankan.')
console.log('2. Media lama tetap tampil memakai file asli sampai diunggah ulang.')
console.log('3. Video tidak dibuatkan thumbnail karena butuh proses frame khusus, jadi tetap memakai metadata ringan.')
console.log('4. Uji dengan mengunggah foto baru beresolusi besar, lalu lihat kartunya: tepi objek harus terlihat mulus.')