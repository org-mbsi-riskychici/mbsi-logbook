const MAKS_SISI_FULL = 2048
const MAKS_BYTE_FULL = 500 * 1024
const TINGKAT_KUALITAS_FULL = [0.88, 0.84, 0.80]
const MAKS_SISI_THUMB = 900
const MAKS_BYTE_THUMB = 70 * 1024
const TINGKAT_KUALITAS_THUMB = [0.8, 0.72, 0.65]
const EXT_VIDEO = ['mp4', 'mov', 'm4v', 'webm', 'ogg', 'mkv', 'avi']

export function ekstensiFile(file) {
  return String(file.name || '').split('.').pop().toLowerCase()
}

export function iniVideo(file) {
  if (file.type && file.type.indexOf('video') === 0) return true
  return EXT_VIDEO.indexOf(ekstensiFile(file)) !== -1
}

export function formatHeic(file) {
  const e = ekstensiFile(file)
  return e === 'heic' || e === 'heif'
}

async function heicKeJpeg(file) {
  const mod = await import('heic2any')
  const heic = mod.default || mod
  const hasil = await heic({ blob: file, toType: 'image/jpeg', quality: 0.92 })
  return Array.isArray(hasil) ? hasil[0] : hasil
}

async function bitmapDari(berkas) {
  try {
    return await createImageBitmap(berkas, { imageOrientation: 'from-image' })
  } catch (e) {
    return await createImageBitmap(berkas)
  }
}

async function keWebP(berkas, maksSisi, kualitas) {
  const bitmap = await bitmapDari(berkas)
  const skala = Math.min(1, maksSisi / Math.max(bitmap.width, bitmap.height))
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
    canvas.toBlob(resolve, 'image/webp', kualitas)
  })
  canvas.width = 0
  canvas.height = 0
  if (!blob || blob.type !== 'image/webp') return null
  return blob
}

/* File penuh untuk Lightbox dan unduhan: coba kualitas tertinggi dulu, turunkan bertahap hanya bila melewati batas ukuran */
async function keWebPFull(berkas) {
  let blob = null
  for (let i = 0; i < TINGKAT_KUALITAS_FULL.length; i++) {
    blob = await keWebP(berkas, MAKS_SISI_FULL, TINGKAT_KUALITAS_FULL[i])
    if (!blob || blob.size <= MAKS_BYTE_FULL) break
  }
  return blob
}

/* Thumbnail kartu: coba kualitas tertinggi dulu, turunkan hanya bila masih di atas batas ukuran */
async function keWebPThumb(berkas) {
  let blob = null
  for (let i = 0; i < TINGKAT_KUALITAS_THUMB.length; i++) {
    blob = await keWebP(berkas, MAKS_SISI_THUMB, TINGKAT_KUALITAS_THUMB[i])
    if (!blob || blob.size <= MAKS_BYTE_THUMB) break
  }
  return blob
}

export async function siapkanFoto(file, onInfo) {
  let sumber = file
  if (formatHeic(file)) {
    if (onInfo) onInfo('Mengonversi HEIC ke JPG')
    const jpeg = await heicKeJpeg(file)
    if (!jpeg) throw new Error('File HEIC tidak bisa dibaca')
    sumber = new File([jpeg], 'sumber.jpg', { type: 'image/jpeg' })
  }
  if (onInfo) onInfo('Menyiapkan WebP')
  let fullBlob = null
  try {
    fullBlob = await keWebPFull(sumber)
  } catch (e) {
    fullBlob = null
  }
  const pakaiWebp = !!fullBlob && (sumber.type !== 'image/jpeg' || fullBlob.size < sumber.size)
  const fullFinal = pakaiWebp ? fullBlob : sumber
  const fullType = pakaiWebp ? 'image/webp' : sumber.type
  let thumbBlob = null
  try {
    thumbBlob = await keWebPThumb(fullFinal)
  } catch (e) {
    thumbBlob = null
  }
  return { fullBlob: fullFinal, fullType: fullType, thumbBlob: thumbBlob }
}

export async function pratinjauHeic(file) {
  if (!formatHeic(file)) return null
  try {
    const jpeg = await heicKeJpeg(file)
    return jpeg || null
  } catch (e) {
    return null
  }
}

export async function urlPratinjau(file) {
  if (formatHeic(file)) {
    const blob = await pratinjauHeic(file)
    return URL.createObjectURL(blob || file)
  }
  return URL.createObjectURL(file)
}

/* foto-profil-webp: pipeline konversi foto profil, pola sama dengan alur media R2 */
function muatGambarProfil(sumber) {
  return new Promise(function (resolve, reject) {
    const url = URL.createObjectURL(sumber)
    const img = new Image()
    img.onload = function () { resolve({ img: img, url: url }) }
    img.onerror = function () { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca')) }
    img.src = url
  })
}

export async function siapkanFotoProfil(file, maksSisi, kualitas) {
  const sisi = maksSisi || 640
  const mutu = kualitas || 0.85
  let kerja = file
  if (formatHeic(file)) {
    const jpeg = await heicKeJpeg(file)
    if (!jpeg) throw new Error('File HEIC tidak bisa dibaca')
    kerja = new File([jpeg], (file.name || 'foto').replace(/\.(heic|heif)$/i, '.jpg'), { type: 'image/jpeg' })
  }
  const muat = await muatGambarProfil(kerja)
  try {
    const rasio = Math.min(1, sisi / Math.max(muat.img.width, muat.img.height))
    const w = Math.max(1, Math.round(muat.img.width * rasio))
    const h = Math.max(1, Math.round(muat.img.height * rasio))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(muat.img, 0, 0, w, h)
    const blob = await new Promise(function (resolve) { canvas.toBlob(resolve, 'image/webp', mutu) })
    if (!blob) throw new Error('Gagal mengonversi foto ke WebP')
    return new File([blob], 'profil-' + Date.now() + '.webp', { type: 'image/webp' })
  } finally {
    URL.revokeObjectURL(muat.url)
  }
}