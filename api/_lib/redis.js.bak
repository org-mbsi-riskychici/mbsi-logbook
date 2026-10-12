import { Redis } from '@upstash/redis'

/* Klien Redis untuk caching di serverless functions dan Vite dev middleware.
   Redis.fromEnv() otomatis baca UPSTASH_REDIS_REST_URL dan
   UPSTASH_REDIS_REST_TOKEN dari environment. */
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

/* Cache-aside pattern: cek cache dulu, kalau miss panggil fetcher
   lalu simpan hasilnya ke cache dengan TTL. Kalau Redis down
   atau env tidak ada, langsung panggil fetcher tanpa error. */
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
