const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menyelesaikan sisa pemasangan fitur YouTube...')
console.log('')

/* ===== 1. UI pemilih jenis media pada form galeri ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
if (d.includes("galMode === 'video'")) {
  console.log('[SUDAH ADA] UI pemilih jenis media pada form galeri')
} else {
  const regexGal = /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>/
  const blokGal = `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
                <div className="mt-1.5 flex gap-2">
                  <button type="button" onClick={function () { setGalMode('foto') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode !== 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Foto</button>
                  <button type="button" onClick={function () { setGalMode('video') }} className={'px-3 py-1.5 rounded-xl text-xs font-bold ' + (galMode === 'video' ? 'bg-bsi-800 text-white' : 'bg-slate-200 text-slate-600')}>Video</button>
                </div>
                <div className="mt-1.5">
                  {galMode === 'video' ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500">Sisa kuota upload YouTube hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>
                      <div className={ytQuota.remaining <= 0 && !galForm.file ? 'opacity-50 pointer-events-none' : ''}>
                        <FileInput accept="video/*" fileName={galForm.file ? galForm.file.name : ''}
                          onChange={async function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            if (formatHeic(f)) {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                              const blob = await pratinjauHeic(f)
                              const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                              setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                            } else {
                              setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                            }
                          }} />
                      </div>
                      {ytQuota.remaining <= 0 ? <p className="text-xs text-red-600">Kuota habis. Gunakan link YouTube di bawah.</p> : null}
                      <input className={inputCls} value={galYtLink} onChange={function (e) { setGalYtLink(e.target.value) }} placeholder="Atau tempel link YouTube (unlisted)" />
                    </div>
                  ) : (
                    <FileInput accept="image/*" fileName={galForm.file ? galForm.file.name : ''}
                      onChange={async function (e) {
                        const f = e.target.files[0]
                        if (!f) return
                        if (formatHeic(f)) {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: '', previewLoading: true }) })
                          const blob = await pratinjauHeic(f)
                          const preview = blob ? URL.createObjectURL(blob) : URL.createObjectURL(f)
                          setGalForm(function (g) { return Object.assign({}, g, { preview: preview, previewLoading: false }) })
                        } else {
                          setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
                        }
                      }} />
                  )}
                </div>`
  if (!regexGal.test(d)) {
    console.log('[TIDAK KETEMU] Blok form media galeri di DashboardPage.jsx')
  } else {
    d = d.replace(regexGal, blokGal)
    simpan(FILE_D, d)
    console.log('[BERHASIL] UI pemilih jenis media pada form galeri')
  }
}

/* ===== 2. Middleware dan plugin YouTube di vite.config.js ===== */
const FILE_V = 'vite.config.js'
let v = baca(FILE_V)
if (v.includes('pluginApiYoutube')) {
  console.log('[SUDAH ADA] Middleware dan plugin YouTube di vite.config.js')
} else {
  const fungsiPlugin = `function pluginApiYoutube(env) {
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
        res.end(JSON.stringify({ limit: 6, used: used, remaining: Math.max(0, 6 - used), ptDate: today }))
      })
      server.middlewares.use('/api/youtube/session', async function (req, res) {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(JSON.stringify({ error: 'Method tidak diizinkan' })); return }
        const user = await cekSesi(req)
        if (!user) { res.statusCode = 401; res.end(JSON.stringify({ error: 'Sesi tidak valid' })); return }
        const today = ptToday()
        const { count } = await admin.from('youtube_quota_usage').select('id', { count: 'exact', head: true }).eq('pt_date', today)
        const used = count || 0
        if (used >= 6) { res.statusCode = 429; res.end(JSON.stringify({ error: 'Kuota upload YouTube hari ini sudah habis. Gunakan link embed.', remaining: 0 })); return }
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
        res.end(JSON.stringify({ sessionUri: sessionUri, remaining: Math.max(0, 6 - used - 1) }))
      })
    }
  }
}
`
  const cariExport = `export default defineConfig(function ({ mode }) {`
  const cariPlugins = `plugins: [react(), pluginApiR2(env)]`
  if (!v.includes(cariExport) || !v.includes(cariPlugins)) {
    console.log('[TIDAK KETEMU] Pola export atau plugins di vite.config.js')
  } else {
    v = v.replace(cariExport, fungsiPlugin + cariExport)
    v = v.replace(cariPlugins, `plugins: [react(), pluginApiR2(env), pluginApiYoutube(env)]`)
    simpan(FILE_V, v)
    console.log('[BERHASIL] Middleware dan plugin YouTube di vite.config.js')
  }
}

console.log('')
console.log('Selesai. Restart dev server agar middleware baru aktif:')
console.log('  Ctrl+C lalu npm run dev -- --host')
console.log('')
console.log('Pastikan .env.local memuat: YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REFRESH_TOKEN, SUPABASE_SERVICE_ROLE_KEY')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan tombol Foto dan Video kini muncul.')
console.log('2. Pilih Video: terlihat sisa kuota, FileInput video, dan kolom link YouTube.')
console.log('3. Saat kuota habis, FileInput video menjadi abu-abu dan hanya link yang aktif.')
console.log('4. Uji di localhost: endpoint /api/youtube/quota harus menjawab JSON sisa kuota.')