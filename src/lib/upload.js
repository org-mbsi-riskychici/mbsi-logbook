import { supabase } from './supabase.js'
import { iniVideo, ekstensiFile, siapkanFoto } from './konversi.js'

const MAKS_FOTO = 15 * 1024 * 1024
const MAKS_VIDEO = 50 * 1024 * 1024

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

function namaDasar(nama) {
  return String(nama || 'media').replace(/\.[^.]+$/, '')
}

function kirimDenganProgres(uploadUrl, blob, contentType, onProgres) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadUrl)
    xhr.setRequestHeader('Content-Type', contentType)
    if (onProgres) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgres(e.loaded / e.total)
      }
    }
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error('Gagal upload file ke R2 (status ' + xhr.status + ')'))
    }
    xhr.onerror = function () { reject(new Error('Gagal jaringan saat upload ke R2')) }
    xhr.send(blob)
  })
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

export async function uploadMedia(file, kind, onInfo) {
  const video = iniVideo(file)
  if (video && file.size > MAKS_VIDEO) {
    throw new Error('Video melebihi 50 MB. Potong dulu durasinya supaya upload cepat dan kuota aman.')
  }
  if (!video && file.size > MAKS_FOTO) {
    throw new Error('Foto melebihi 15 MB. Pilih file dengan ukuran lebih kecil.')
  }
  let fullBlob = file
  let fullType = file.type
  let thumbBlob = null
  if (!video) {
    try {
      const hasil = await siapkanFoto(file, onInfo)
      fullBlob = hasil.fullBlob
      fullType = hasil.fullType
      thumbBlob = hasil.thumbBlob
    } catch (e) {
      throw new Error('Foto format .' + ekstensiFile(file) + ' tidak bisa diproses browser. Ubah dulu ke JPG atau PNG. Di iPhone: Settings, Camera, Formats, pilih Most Compatible.')
    }
  }
  if (onInfo) onInfo('')
  const token = await getToken()
  const extFull = fullType === 'image/webp' ? 'webp' : (fullType === 'image/jpeg' ? 'jpg' : ekstensiFile(file))
  const infoFull = await mintaIzin(token, namaDasar(file.name) + '.' + extFull, fullType, kind)
  await kirimDenganProgres(infoFull.uploadUrl, fullBlob, fullType, function (p) {
    if (onInfo) onInfo('Mengunggah... ' + Math.round(p * 100) + '%')
  })
  let thumbUrl = null
  if (thumbBlob) {
    try {
      const namaThumb = namaDasar(infoFull.key.split('/').pop()) + '.webp'
      const infoThumb = await mintaIzin(token, namaThumb, 'image/webp', 'thumb/' + kind)
      await kirimDenganProgres(infoThumb.uploadUrl, thumbBlob, 'image/webp', null)
      thumbUrl = infoThumb.publicUrl
    } catch (e) {
      thumbUrl = null
    }
  }
  console.log('[UPLOAD] File penuh: ' + infoFull.key + ' | Thumbnail: ' + (thumbUrl || 'tidak dibuat'))
  return { path: infoFull.key, publicUrl: infoFull.publicUrl, thumbUrl: thumbUrl }
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
