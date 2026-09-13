const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menambahkan middleware /api/youtube/latest untuk dev lokal...')
console.log('')

/* ===== 1. Middleware /api/youtube/latest di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes("'/api/youtube/latest'")) {
  console.log('[SUDAH ADA] Middleware /api/youtube/latest di vite.config.js')
} else {
  const marker = "server.middlewares.use('/api/youtube/session'"
  if (!v.includes(marker)) {
    console.log('[TIDAK KETEMU] Penanda middleware session di vite.config.js')
    process.exit(1)
  }
  const middlewareLatest = `server.middlewares.use('/api/youtube/latest', async function (req, res) {
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
        if (!r.ok) { res.statusCode = 502; res.end(JSON.stringify({ error: 'Gagal memeriksa video terbaru' })); return }
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
      `
  v = v.replace(marker, middlewareLatest + marker)
  simpan(FILE_V, v)
  console.log('[BERHASIL] Middleware /api/youtube/latest ditambahkan di vite.config.js')
}

/* ===== 2. Pengaman respons bukan JSON di src/lib/youtube.js ===== */
const FILE_Y = 'src/lib/youtube.js'
let y = baca(FILE_Y)
const cariJson = `  if (v.ok) {
    const j = await v.json()
    if (j.videoId) return { videoId: j.videoId }
  }`
const gantiJson = `  if (v.ok) {
    try {
      const j = await v.json()
      if (j && j.videoId) return { videoId: j.videoId }
    } catch (e) {
      console.warn('Respons pemulihan bukan JSON, dilewati.')
    }
  }`
if (y.includes(gantiJson)) {
  console.log('[SUDAH ADA] Pengaman JSON di youtube.js')
} else if (y.includes(cariJson)) {
  y = y.replace(cariJson, gantiJson)
  simpan(FILE_Y, y)
  console.log('[BERHASIL] Pengaman JSON ditambahkan di youtube.js')
} else {
  console.log('[TIDAK KETEMU] Pola v.json() di youtube.js, kemungkinan sudah aman')
}

console.log('')
console.log('Selesai. Restart dev server: Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload satu video kecil dari form logbook atau galeri di localhost.')
console.log('2. Progres mencapai 100 persen, lalu id video dipulihkan lewat /api/youtube/latest.')
console.log('3. Logbook tersimpan tanpa error dan kartu menampilkan thumbnail YouTube.')
console.log('4. Kuota harian tampil X dari 5, berkurang satu tiap upload sukses.')
console.log('5. Di Vercel perilaku sama karena api/youtube/latest.js sudah ada sebagai serverless function.')