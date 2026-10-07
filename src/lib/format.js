import { MULAI_MAGANG } from './constants.js'

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

/* Batas pilihan tanggal form: tidak sebelum hari pertama magang, tidak setelah hari ini.
   Dinamis karena max diambil dari tanggal perangkat saat web dibuka. */
export function batasTanggalPilihan() {
  return { min: MULAI_MAGANG, max: todayInput() }
}

/* Mengembalikan pesan error bila tanggal di luar batas, atau null bila valid.
   Perbandingan string aman karena format tanggal ISO (YYYY-MM-DD). */
export function pesanTanggalTerlarang(value, min, max) {
  if (!value) return null
  if (max && value > max) {
    return 'Tanggal ini belum kamu lewati!'
  }
  if (min && value < min) {
    return 'Hari pertama magang tanggal (8 September 2026).'
  }
  return null
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

/* ===== TITLE CASE =====
   Aturan:
   - "ATM BSI"     → "ATM BSI"     (singkatan ALL CAPS dipertahankan)
   - "iPhone app"  → "iPhone App"  (mixed case disengaja dipertahankan)
   - "bsi"         → "BSI"         (whitelist singkatan umum)
   - "bank bsi"    → "Bank BSI"    (lowercase diformat + whitelist)
   - "kegiatan di bank" → "Kegiatan di Bank"  (kata sambung tetap lowercase)
   - "bank,"       → "Bank,"       (tanda baca di akhir dipertahankan) */

/* Kata sambung/kata depan/artikel yang tetap lowercase di tengah kalimat. */
const KATA_KECIL = new Set([
  // Indonesia
  'dan', 'atau', 'yang', 'untuk', 'dari', 'ke', 'di', 'pada', 'dengan',
  'dalam', 'oleh', 'serta', 'juga', 'sebagai', 'tentang', 'ini', 'itu',
  'agar', 'supaya', 'karena', 'kalau', 'jika', 'bila', 'saat', 'ketika',
  // Inggris (umum di judul campuran)
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by'
])

/* Singkatan umum yang otomatis di-UPPERCASE walau user ketik lowercase.
   Tambahkan sesuai kebutuhan tim/instansi. */
const SINGKATAN_PAKSA = new Set([
  // Perbankan & magang BSI
  'bsi', 'atm', 'ktp', 'nim', 'pin', 'otp', 'npwp', 'cif', 'rek', 'kpr', 'umkm', 'kpi', 'roi',
  'cs', 'crm', 'sdm', 'hrd',
  // Teknologi umum
  'it', 'api', 'ui', 'ux', 'url', 'pdf', 'gps', 'wifi', 'ip', 'id', 'hp', 'pc', 'ai', 'ml',
  // Administrasi & legal
  'pt', 'cv', 'ukm', 'siup', 'sk', 'surat',
])

export function toTitleCase(teks) {
  if (!teks) return ''
  const bersih = String(teks).trim().replace(/\s+/g, ' ')
  if (!bersih) return ''
  const kata = bersih.split(' ')

  const hasil = kata.map(function (token, i) {
    if (!token) return token

    /* Pisahkan tanda baca depan & belakang dari huruf inti
       supaya "bank," diproses sebagai "bank" + "," */
    const match = token.match(/^([^a-zA-Z0-9]*)(.*?)([^a-zA-Z0-9]*)$/)
    if (!match) return token
    const depan = match[1] || ''
    const inti = match[2] || ''
    const belakang = match[3] || ''
    if (!inti) return token

    let intiBaru

    /* 1. Singkatan ALL CAPS (2+ huruf): ATM, BSI, KTP → pertahankan */
    if (/^[A-Z]{2,}$/.test(inti)) {
      intiBaru = inti
    }
    /* 2. Mixed case disengaja: iPhone, mBanking, iOS → pertahankan.
       Deteksi: ada kombinasi lowercase diikuti uppercase di dalam kata. */
    else if (/[a-z][A-Z]/.test(inti)) {
      intiBaru = inti
    }
    /* 3. Whitelist singkatan: "bsi" → "BSI", "atm" → "ATM" */
    else if (SINGKATAN_PAKSA.has(inti.toLowerCase())) {
      intiBaru = inti.toUpperCase()
    }
    /* 4. Default: format Title Case dengan pengecualian kata sambung */
    else {
      const lower = inti.toLowerCase()
      const pertama = i === 0
      const terakhir = i === kata.length - 1
      if (!pertama && !terakhir && KATA_KECIL.has(lower)) {
        intiBaru = lower
      } else {
        intiBaru = lower.charAt(0).toUpperCase() + lower.slice(1)
      }
    }

    return depan + intiBaru + belakang
  })

  return hasil.join(' ')
}