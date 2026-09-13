import { supabase } from './supabase.js'

export function parseYouTubeId(url) {
  if (!url) return null
  const s = String(url).trim()
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '').replace('m.', '')
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0]
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = u.searchParams.get('v')
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v
      const parts = u.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live') {
        const id = parts[1]
        return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch (e) {}
  return null
}
export function ytThumb(id) {
  return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
}
export function ytEmbedUrl(id) {
  return 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1'
}
export async function fetchYouTubeQuota() {
  try {
    const r = await fetch('/api/youtube/quota', { cache: 'no-store' })
    if (!r.ok) return { limit: 5, used: 0, remaining: 5 }
    return await r.json()
  } catch (e) {
    return { limit: 5, used: 0, remaining: 5 }
  }
}
export async function startYouTubeSession(title, description, contentType, token) {
  if (!token) throw new Error('Sesi login tidak terbaca. Silakan masuk ulang lalu coba lagi.')
  const r = await fetch('/api/youtube/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({ title: title, description: description, contentType: contentType })
  })
  if (!r.ok) {
    const j = await r.json().catch(function () { return { error: 'Gagal memulai sesi upload video' } })
    throw new Error(j.error || 'Gagal memulai sesi upload video')
  }
  return await r.json()
}
export async function uploadToYouTube(sessionUri, blob, onProgress) {
  const hasil = await new Promise(function (resolve) {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', sessionUri)
    xhr.setRequestHeader('Content-Type', blob.type || 'video/mp4')
    if (onProgress) {
      xhr.upload.onprogress = function (e) {
        if (e.lengthComputable) onProgress(e.loaded / e.total)
      }
    }
    xhr.onload = function () { resolve({ status: xhr.status, body: xhr.responseText }) }
    xhr.onerror = function () { resolve({ status: 0, body: '' }) }
    xhr.send(blob)
  })
  if (hasil.status >= 200 && hasil.status < 300) {
    try {
      const j = JSON.parse(hasil.body || '{}')
      if (j && j.id) return { videoId: j.id }
    } catch (e) { /* respons tidak terbaca, pulihkan lewat server */ }
  } else if (hasil.status !== 0) {
    throw new Error('Upload video gagal (status ' + hasil.status + ')')
  }
  const sesi = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const r = await fetch('/api/youtube/latest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify({})
  })
  if (r.ok) {
    try {
      const j = await r.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati:', e.message)
    }
  }
  throw new Error('Upload selesai tetapi id video tidak terbaca. Video kemungkinan sudah tersimpan; tempel link video secara manual.')
}

export async function unggahVideoYouTube(file, judul, onProgress) {
  const sesiData = await supabase.auth.getSession()
  const token = await ambilTokenSesi()
  const sesi = await startYouTubeSession(judul || 'Dokumentasi Magang', 'Diunggah dari portal logbook magang BSI.', file.type || 'video/mp4', token)
  return await uploadToYouTube(sesi.sessionUri, file, onProgress)
}

export async function ambilTokenSesi() {
  try {
    const r = await supabase.auth.getSession()
    const ssn = r && r.data ? r.data.session : null
    return ssn && ssn.access_token ? ssn.access_token : ''
  } catch (e) {
    return ''
  }
}
