import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'

function bacaBody(req) {
  return new Promise(function (resolve) {
    let data = ''
    req.on('data', function (c) { data += c })
    req.on('end', function () {
      try { resolve(JSON.parse(data || '{}')) } catch (e) { resolve({}) }
    })
  })
}

function pluginApiR2(env) {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })

  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return false
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    })
    const r = await supabase.auth.getUser(token)
    return !r.error && !!r.data.user
  }

  return {
    name: 'api-r2-dev',
    configureServer(server) {
      server.middlewares.use('/api/r2/presign', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        const ext = String(body.filename || 'bin').split('.').pop().toLowerCase()
        const key = body.kind + '/' + new Date().getFullYear() + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext
        const uploadUrl = await getSignedUrl(
          s3,
          new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key, ContentType: body.contentType }),
          { expiresIn: 300 }
        )
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
          uploadUrl: uploadUrl,
          publicUrl: env.R2_PUBLIC_BASE_URL + '/' + key,
          key: key
        }))
      })

      server.middlewares.use('/api/r2/delete', async function (req, res) {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
          return
        }
        const ok = await cekSesi(req)
        if (!ok) {
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Sesi tidak valid' }))
          return
        }
        const body = await bacaBody(req)
        await s3.send(new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: body.key }))
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ ok: true }))
      })
    }
  }
}

function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  function ptToday() {
    const now = new Date()
    const pt = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }))
    const y = pt.getFullYear()
    const m = String(pt.getMonth() + 1).padStart(2, '0')
    const d = String(pt.getDate()).padStart(2, '0')
    return y + '-' + m + '-' + d
  }
  async function cekSesi(req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) return null
    const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } })
    const r = await supabase.auth.getUser(token)
    return r.error ? null : r.data.user
  }
  return {
    name: 'api-youtube-dev',
    configureServer(server) {
      server.middlewares.use('/api/youtube/quota', async function (req, res) {
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        res.setHeader('Content-Type', 'application/json')
        res.setHeader('Cache-Control', 'no-store')
        res.end(JSON.stringify({ limit: 5, used: used, remaining: Math.max(0, 5 - used), ptDate: today }))
      })
      server.middlewares.use('/api/youtube/verify', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const body = await bacaBody(req)
        const ref = body.ref
        if (!ref) { res.statusCode = 400; res.end(JSON.stringify({ error: 'Ref tidak ada' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=10&q=' + encodeURIComponent(ref), { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video di YouTube' })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const desc = (it.snippet && it.snippet.description) || ''
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return desc.indexOf('REF ' + ref) === 0 && (isNaN(t) ? true : t >= batas)
        }) || items[0]
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video tidak ditemukan di channel' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      server.middlewares.use('/api/youtube/latest', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&forMine=true&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + tok.access_token } })
        if (!r.ok) { const t = await r.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru: ' + r.status + ' ' + t })); return }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { res.statusCode = 404; res.end(JSON.stringify({ error: 'Video terbaru tidak ditemukan' })); return }
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ videoId: cocok.id && cocok.id.videoId }))
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        if (used >= 5) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
        const body = await bacaBody(req)
        const params = new URLSearchParams()
        params.set('client_id', env.YOUTUBE_CLIENT_ID || '')
        params.set('client_secret', env.YOUTUBE_CLIENT_SECRET || '')
        params.set('refresh_token', env.YOUTUBE_REFRESH_TOKEN || '')
        params.set('grant_type', 'refresh_token')
        const tr = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: params })
        if (!tr.ok) { res.statusCode = 500; res.end(JSON.stringify({ error: 'Gagal refresh token YouTube' })); return }
        const tok = await tr.json()
        const meta = {
          snippet: { title: String(body.title || 'Dokumentasi Magang').slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + tok.access_token, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { const t = await init.text(); res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memulai sesi YouTube: ' + t })); return }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Sesi upload tidak mengembalikan lokasi' })); return }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id })
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 5 - used - 1) }))
      })
    }
  }
}
export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]
  }
})