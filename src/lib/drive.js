export function parseDriveId(url) {
  if (!url) return null
  const s = String(url).trim()

  if (/^[a-zA-Z0-9_-]{20,}$/.test(s) && s.indexOf('/') === -1 && s.indexOf('.') === -1) return s

  try {
    const u = new URL(s)
    const host = u.hostname.replace('www.', '')

    if (host === 'drive.google.com' || host === 'drive.usercontent.google.com') {
      const m = u.pathname.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
      if (m) return m[1]
      const id = u.searchParams.get('id')
      if (id) return id
    }
  } catch (e) {}

  return null
}

export function drivePreviewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/preview'
}

export function driveThumbUrl(id) {
  return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w1280'
}

export function driveDownloadUrl(id) {
  return 'https://drive.usercontent.google.com/download?id=' + id + '&export=download&confirm=t'
}

export function driveViewUrl(id) {
  return 'https://drive.google.com/file/d/' + id + '/view'
}
