import { supabase } from './supabase.js'

async function getToken() {
  const { data } = await supabase.auth.getSession()
  return data.session ? data.session.access_token : ''
}

export async function uploadMedia(file, kind) {
  const token = await getToken()
  const res = await fetch('/api/r2/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ filename: file.name, contentType: file.type, kind: kind })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error('Gagal membuat izin upload (status ' + res.status + '): ' + text)
  }
  const info = await res.json()

  const put = await fetch(info.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file
  })
  if (!put.ok) {
    const text = await put.text()
    throw new Error('Gagal upload file ke R2 (status ' + put.status + '): ' + text)
  }

  return { path: info.key, publicUrl: info.publicUrl }
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
