import { supabase } from './supabase.js'

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
      const namaThumb = file.name.replace(/\.[^.]+$/, '') + '-thumb.jpg'
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
