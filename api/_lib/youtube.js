export const LIMIT_PER_PROJECT = 5

export function ptToday() {
  const now = new Date()
  const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
  const y = pt.getFullYear()
  const m = String(pt.getMonth() + 1).padStart(2, '0')
  const d = String(pt.getDate()).padStart(2, '0')
  return y + '-' + m + '-' + d
}

export function daftarKredensial(env) {
  const list = []
  for (let n = 1; n <= 6; n++) {
    const id = env['YOUTUBE_CLIENT_ID_' + n]
    const secret = env['YOUTUBE_CLIENT_SECRET_' + n]
    const refresh = env['YOUTUBE_REFRESH_TOKEN_' + n]
    if (id && secret && refresh) list.push({ n: n, id: id, secret: secret, refresh: refresh })
  }
  if (!list.length && env.YOUTUBE_CLIENT_ID && env.YOUTUBE_CLIENT_SECRET && env.YOUTUBE_REFRESH_TOKEN) {
    list.push({ n: 1, id: env.YOUTUBE_CLIENT_ID, secret: env.YOUTUBE_CLIENT_SECRET, refresh: env.YOUTUBE_REFRESH_TOKEN })
  }
  return list
}

const cacheToken = {}
export async function getAccessToken(kred) {
  const now = Date.now()
  const c = cacheToken[kred.n]
  if (c && c.expire > now + 60000) return c.token
  const params = new URLSearchParams()
  params.set('client_id', kred.id)
  params.set('client_secret', kred.secret)
  params.set('refresh_token', kred.refresh)
  params.set('grant_type', 'refresh_token')
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
  if (!r.ok) throw new Error('refresh token project ' + kred.n + ' gagal (status ' + r.status + ')')
  const j = await r.json()
  cacheToken[kred.n] = { token: j.access_token, expire: now + (j.expires_in || 3600) * 1000 }
  return j.access_token
}
