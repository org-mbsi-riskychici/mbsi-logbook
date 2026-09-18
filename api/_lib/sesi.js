import { createClient } from '@supabase/supabase-js'

export async function cekSesi(env, authHeader) {
  const header = authHeader || ''
  const token = header.replace('Bearer ', '')
  if (!token) return null
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: header } }
  })
  const r = await supabase.auth.getUser(token)
  return r.error || !r.data.user ? null : r.data.user
}

export function bacaBody(req) {
  return new Promise(function (resolve) {
    let data = ''
    req.on('data', function (c) { data += c })
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) }
    })
  })
}
