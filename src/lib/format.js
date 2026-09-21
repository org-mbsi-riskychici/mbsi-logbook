export function formatTanggal(s) {
  if (!s) return 'Tanggal belum diisi'
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function formatTanggalShort(s) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function todayInput() {
  const d = new Date()
  const m = ('0' + (d.getMonth() + 1)).slice(-2)
  const day = ('0' + d.getDate()).slice(-2)
  return d.getFullYear() + '-' + m + '-' + day
}

export function detectMediaType(u) {
  let s = String(u || '')
  const iK = s.indexOf('key=')
  if (iK !== -1) s = decodeURIComponent(s.slice(iK + 4).split('&')[0])
  const ext = s.split('?')[0].split('.').pop().toLowerCase()
  return ['mp4', 'webm', 'ogg', 'mov', 'm4v'].indexOf(ext) !== -1 ? 'video' : 'foto'
}

export function matchesDateFilters(dateString, f) {
  if (!dateString) return false
  if (f.timeMode === 'bulan') {
    if (f.bulan) {
      if (f.bulan.length === 7) return dateString.slice(0, 7) === f.bulan
      const p = dateString.split('-')
      if (p.length < 2 || p[1] !== f.bulan) return false
    }
  } else if (f.timeMode === 'rentang') {
    if (f.dari && dateString < f.dari) return false
    if (f.sampai && dateString > f.sampai) return false
  }
  return true
}
export function waktuUrut(x) {
  if (!x) return 0
  const src = x.created_at || x.updated_at || ''
  if (!src) return 0
  const t = new Date(src).getTime()
  return isNaN(t) ? 0 : t
}
export function urutkanTanggal(list, mode) {
  const arr = (list || []).slice()
  arr.sort(function (a, b) {
    const ta = new Date(a.tanggal + 'T00:00:00').getTime()
    const tb = new Date(b.tanggal + 'T00:00:00').getTime()
    if (ta !== tb) return mode === 'terlama' ? ta - tb : tb - ta
    const ca = waktuUrut(a)
    const cb = waktuUrut(b)
    if (ca !== cb) return mode === 'terlama' ? ca - cb : cb - ca
    const ia = a.id || ''
    const ib = b.id || ''
    if (ia !== ib) return ia < ib ? (mode === 'terlama' ? -1 : 1) : (mode === 'terlama' ? 1 : -1)
    return 0
  })
  return arr
}
