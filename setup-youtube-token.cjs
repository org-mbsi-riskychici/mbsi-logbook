const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const env = {}
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  })
}

const clientId = env.YOUTUBE_CLIENT_ID
const clientSecret = env.YOUTUBE_CLIENT_SECRET
if (!clientId || !clientSecret) {
  console.log('[GAGAL] Isi dulu YOUTUBE_CLIENT_ID dan YOUTUBE_CLIENT_SECRET di .env.local')
  process.exit(1)
}

const PORT = 8790
const redirect = 'http://localhost:' + PORT + '/callback'
const state = crypto.randomBytes(8).toString('hex')
const scope = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: clientId, redirect_uri: redirect, response_type: 'code',
  scope: scope, access_type: 'offline', prompt: 'consent', state: state
})

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://localhost')
  if (u.pathname !== '/callback') { res.end('ok'); return }
  const code = u.searchParams.get('code')
  const st = u.searchParams.get('state')
  if (st !== state) { res.end('State tidak cocok'); return }
  const body = new URLSearchParams({
    code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirect, grant_type: 'authorization_code'
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body })
  const j = await r.json()
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (j.refresh_token) {
    res.end('<h2>Berhasil!</h2><p>Salin refresh token ini:</p><code style="word-break:break-all;background:#f1f5f9;padding:8px;display:block;">' + j.refresh_token + '</code>')
    console.log('\nREFRESH TOKEN:')
    console.log(j.refresh_token)
  } else {
    res.end('<h2>Gagal</h2><pre>' + JSON.stringify(j, null, 2) + '</pre>')
  }
  setTimeout(function () { server.close(); process.exit(0) }, 2000)
})

server.listen(PORT, function () {
  console.log('Membuka browser... Jika tidak otomatis, buka URL ini:')
  console.log(url)
  try {
    require('child_process').exec(process.platform === 'win32' ? 'start "" "' + url + '"' : 'xdg-open ' + url)
  } catch (e) {}
})