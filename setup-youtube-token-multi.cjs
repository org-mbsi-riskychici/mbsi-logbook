const fs = require('fs')
const path = require('path')
const http = require('http')
const crypto = require('crypto')

const n = String(process.argv[2] || '1')
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('[GAGAL] .env.local belum ada')
  process.exit(1)
}
const env = {}
fs.readFileSync(envPath, 'utf8').split('\n').forEach(function (line) {
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
})
const clientId = env['YOUTUBE_CLIENT_ID_' + n]
const clientSecret = env['YOUTUBE_CLIENT_SECRET_' + n]
if (!clientId || !clientSecret) {
  console.log('[GAGAL] Isi dulu YOUTUBE_CLIENT_ID_' + n + ' dan YOUTUBE_CLIENT_SECRET_' + n + ' di .env.local')
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

function simpanToken(token) {
  let isi = fs.readFileSync(envPath, 'utf8')
  const key = 'YOUTUBE_REFRESH_TOKEN_' + n
  const re = new RegExp('^' + key + '=.*$', 'm')
  if (re.test(isi)) isi = isi.replace(re, key + '=' + token)
  else isi = isi.trimEnd() + '\n' + key + '=' + token + '\n'
  fs.writeFileSync(envPath, isi, 'utf8')
}

const server = http.createServer(async function (req, res) {
  const u = new URL(req.url, 'http://localhost')
  if (u.pathname !== '/callback') { res.end('ok'); return }
  const code = u.searchParams.get('code')
  const st = u.searchParams.get('state')
  if (st !== state) { res.end('State tidak cocok'); return }
  const body = new URLSearchParams({
    code: code, client_id: clientId, client_secret: clientSecret,
    redirect_uri: redirect, grant_type: 'authorization_code'
  })
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: body })
  const j = await r.json()
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  if (j.refresh_token) {
    simpanToken(j.refresh_token)
    res.end('<h2>Berhasil untuk project ' + n + '</h2><p>Refresh token tersimpan otomatis ke YOUTUBE_REFRESH_TOKEN_' + n + ' di .env.local</p>')
    console.log('[BERHASIL] Refresh token project ' + n + ' disimpan ke .env.local')
  } else {
    res.end('<h2>Gagal</h2><pre>' + JSON.stringify(j, null, 2) + '</pre>')
    console.log('[GAGAL] ' + JSON.stringify(j))
  }
  setTimeout(function () { server.close(); process.exit(0) }, 1500)
})

server.listen(PORT, function () {
  console.log('Project ' + n + ': membuka browser untuk otorisasi...')
  console.log('Jika tidak terbuka otomatis, buka manual URL ini:')
  console.log(url)
  try {
    require('child_process').exec(process.platform === 'win32' ? 'start "" "' + url + '"' : 'xdg-open ' + url)
  } catch (e) {}
})