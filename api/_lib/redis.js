import { Redis } from '@upstash/redis'
import { createHash } from 'node:crypto'

let klien = null

export function ambilRedis(env) {
  if (klien) return klien
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  klien = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN
  })
  return klien
}

export async function denganCache(env, kunci, ttlDetik, fetcher) {
  const redis = ambilRedis(env)
  if (!redis) return { data: await fetcher(), dariCache: false }

  try {
    const cached = await redis.get(kunci)
    if (cached !== null && cached !== undefined) {
      return { data: cached, dariCache: true }
    }
  } catch (e) {
    console.warn('[redis] get gagal, fallback ke fetcher:', e.message)
  }

  const hasil = await fetcher()

  try {
    await redis.set(kunci, hasil, { ex: ttlDetik })
  } catch (e) {
    console.warn('[redis] set gagal, dilewati:', e.message)
  }

  return { data: hasil, dariCache: false }
}

/* Normalisasi pertanyaan jadi hash pendek untuk kunci cache jawaban.
   Lowercase + hapus tanda baca + rapikan spasi -> hash SHA-256 -> 16 char.
   Efeknya: "Risky prodi apa?" dan "risky prodi apa" dianggap sama. */
export function kunciJawaban(pertanyaan) {
  const bersih = String(pertanyaan || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const hash = createHash('sha256').update(bersih).digest('hex').slice(0, 16)
  return 'mbsi:chat:jawaban:v1:' + hash
}
