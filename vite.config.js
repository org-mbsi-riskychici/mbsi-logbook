import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createClient } from '@supabase/supabase-js'
import { LIMIT_PER_PROJECT, ptToday, daftarKredensial, getAccessToken } from './api/_lib/youtube.js'
import { cekSesi, bacaBody } from './api/_lib/sesi.js'

function pluginApiR2(env) {
  const s3 = new S3Client({
    region: 'auto',
    endpoint: 'https://' + env.R2_ACCOUNT_ID + '.r2.cloudflarestorage.com',
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY
    }
  })

  // Bungkus middlewares agar bisa dipakai di dev dan preview
  const setupMiddlewares = (server) => {
    server.middlewares.use('/api/r2/presign', async function (req, res) {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
        return
      }
      const ok = await cekSesi(env, req.headers.authorization)
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
        publicUrl: '/api/r2/file?key=' + key,
        key: key
      }))
    })

    server.middlewares.use('/api/r2/delete', async function (req, res) {
      if (req.method !== 'POST') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
        return
      }
      const ok = await cekSesi(env, req.headers.authorization)
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
    server.middlewares.use('/api/r2/file', async function (req, res) {
      if (req.method !== 'GET') {
        res.statusCode = 405
        res.end(JSON.stringify({ error: 'Method tidak diizinkan' }))
        return
      }
      const url = new URL(req.url, 'http://localhost')
      const key = url.searchParams.get('key')
      if (!key) {
        res.statusCode = 400
        res.end(JSON.stringify({ error: 'Key tidak ada' }))
        return
      }
      const cmd = new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key: key })
      if (url.searchParams.get('unduh') !== '1') {
        const signed = await getSignedUrl(s3, cmd, { expiresIn: 300 })
        res.statusCode = 302
        res.setHeader('Location', signed)
        res.setHeader('Cache-Control', 'public, max-age=60')
        res.end()
        return
      }
      try {
        const obj = await s3.send(cmd)
        res.statusCode = 200
        res.setHeader('Content-Type', obj.ContentType || 'application/octet-stream')
        if (obj.ContentLength) res.setHeader('Content-Length', String(obj.ContentLength))
        res.setHeader('Cache-Control', 'public, max-age=3600')
        obj.Body.pipe(res)
      } catch (e) {
        res.statusCode = 404
        res.end(JSON.stringify({ error: 'Media tidak ditemukan' }))
      }
    })
  }

  return {
    name: 'api-r2-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}

function pluginApiYoutube(env) {
  const admin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
  function kirim(res, code, obj) {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(obj))
  }

  // Bungkus middlewares agar bisa dipakai di dev dan preview
  const setupMiddlewares = (server) => {
    server.middlewares.use('/api/youtube/quota', async function (req, res) {
      const today = ptToday()
      const kredensial = daftarKredensial(env)
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      let usedTotal = 0
      const perProject = []
      for (const kred of kredensial) {
        const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
        const used = hit.count || 0
        usedTotal += used
        perProject.push({ project: kred.n, used: used, remaining: Math.max(0, LIMIT_PER_PROJECT - used) })
      }
      const limit = kredensial.length * LIMIT_PER_PROJECT
      res.setHeader('Cache-Control', 'no-store')
      kirim(res, 200, { limit: limit, used: usedTotal, remaining: Math.max(0, limit - usedTotal), perProject: perProject, ptDate: today })
    })

    server.middlewares.use('/api/youtube/session', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(env, req.headers.authorization)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const today = ptToday()
      const kredensial = daftarKredensial(env)
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      const body = await bacaBody(req)
      if (!body.title) { kirim(res, 400, { error: 'Judul video wajib diisi' }); return }
      let terakhir = ''
      for (const kred of kredensial) {
        const hit = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today).eq('project_id', kred.n)
        if ((hit.count || 0) >= LIMIT_PER_PROJECT) { terakhir = 'project ' + kred.n + ' sudah penuh'; continue }
        let access
        try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
        const meta = {
          snippet: { title: String(body.title).slice(0, 100), description: String(body.description || '').slice(0, 4000), tags: ['logbook-magang-bsi'], categoryId: '22' },
          status: { privacyStatus: 'unlisted', embeddable: true, publicStatsViewable: false }
        }
        const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + access, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': body.contentType || 'video/mp4' },
          body: JSON.stringify(meta)
        })
        if (!init.ok) { terakhir = 'project ' + kred.n + ' ditolak Google (status ' + init.status + ')'; continue }
        const sessionUri = init.headers.get('location')
        if (!sessionUri) { terakhir = 'project ' + kred.n + ' tanpa lokasi upload'; continue }
        await admin.from('youtube_quota_usage').insert({ pt_date: today, user_id: user.id, project_id: kred.n })
        kirim(res, 200, { sessionUri: sessionUri, project: kred.n })
        return
      }
      kirim(res, 429, { error: 'Kuota harian semua project video sudah habis. Coba lagi besok atau gunakan link video eksternal.', detail: terakhir })
    })

    server.middlewares.use('/api/youtube/latest', async function (req, res) {
      if (req.method !== 'POST') { kirim(res, 405, { error: 'Method tidak diizinkan' }); return }
      const user = await cekSesi(env, req.headers.authorization)
      if (!user) { kirim(res, 401, { error: 'Sesi tidak valid' }); return }
      const kredensial = daftarKredensial(env)
      if (!kredensial.length) { kirim(res, 500, { error: 'Kredensial YouTube belum dikonfigurasi' }); return }
      let terakhir = ''
      for (const kred of kredensial) {
        let access
        try { access = await getAccessToken(kred) } catch (e) { terakhir = e.message; continue }
        const r = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&order=date&maxResults=5', { headers: { Authorization: 'Bearer ' + access } })
        if (!r.ok) { terakhir = 'project ' + kred.n + ' status ' + r.status; continue }
        const j = await r.json()
        const items = j.items || []
        const batas = Date.now() - 15 * 60 * 1000
        const cocok = items.find(function (it) {
          const t = Date.parse(it.snippet && it.snippet.publishedAt ? it.snippet.publishedAt : '')
          return isNaN(t) ? false : t >= batas
        })
        if (!cocok) { kirim(res, 404, { error: 'Video terbaru tidak ditemukan' }); return }
        kirim(res, 200, { videoId: cocok.id && cocok.id.videoId, project: kred.n })
        return
      }
      kirim(res, 502, { error: 'Gagal memeriksa video terbaru: ' + terakhir })
    })
  }

  return {
    name: 'api-youtube-dev',
    configureServer: setupMiddlewares,
    configurePreviewServer: setupMiddlewares
  }
}

export default defineConfig(function ({ mode }) {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)],
    
    // Konfigurasi agar bisa diakses lewat Network / IP lokal
    server: {
      host: true
    },
    preview: {
      host: true
    },
    
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-aws': ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'],
            'vendor-media': ['heic2any']
          }
        }
      }
    }
  }
})