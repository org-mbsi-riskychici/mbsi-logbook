const MAKS_SISI_FULL = 2560
const KUALITAS_FULL = 0.92
const MAKS_SISI_THUMB = 1200
const KUALITAS_THUMB = 0.9
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
    fullBlob = await keWebP(sumber, MAKS_SISI_FULL, KUALITAS_FULL)
  } catch (e) {
    fullBlob = null
  }
  const pakaiWebp = !!fullBlob && (sumber.type !== 'image/jpeg' || fullBlob.size < sumber.size)
  const fullFinal = pakaiWebp ? fullBlob : sumber
  const fullType = pakaiWebp ? 'image/webp' : sumber.type
  let thumbBlob = null
  try {
    thumbBlob = await keWebP(fullFinal, MAKS_SISI_THUMB, KUALITAS_THUMB)
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
