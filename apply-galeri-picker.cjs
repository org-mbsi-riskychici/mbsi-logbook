const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function gantiRegex(rel, regex, gantiDengan, label, marker) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (marker && isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  if (!regex.test(isi)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(regex, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

const FILE_D = 'src/pages/DashboardPage.jsx'

console.log('Mulai memasang pemilih jenis media pada form galeri...')
console.log('')

/* ===== 1. Import helper YouTube ===== */
if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] ' + FILE_D + ' tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
if (d.includes("from '../lib/youtube.js'")) {
  console.log('[SUDAH ADA] Import helper YouTube')
} else if (d.includes("from '../lib/konversi.js'")) {
  d = d.replace("from '../lib/konversi.js'", "from '../lib/konversi.js'\nimport { parseYouTubeId, ytThumb, fetchYouTubeQuota, startYouTubeSession, uploadToYouTube } from '../lib/youtube.js'")
  simpan(FILE_D, d)
  console.log('[BERHASIL] Import helper YouTube')
} else {
  console.log('[TIDAK KETEMU] Import helper YouTube')
}

/* ===== 2. State YouTube dan mode galeri ===== */
d = baca(FILE_D)
const stateBaru = []
if (!d.includes('const [ytQuota, setYtQuota]')) stateBaru.push("  const [ytQuota, setYtQuota] = useState({ limit: 6, used: 0, remaining: 6 })")
if (!d.includes('const [galMode, setGalMode]')) stateBaru.push("  const [galMode, setGalMode] = useState('foto')")
if (!d.includes('const [galYtLink, setGalYtLink]')) stateBaru.push("  const [galYtLink, setGalYtLink] = useState('')")
if (!d.includes('const [galOldYt, setGalOldYt]')) stateBaru.push('  const [galOldYt, setGalOldYt] = useState(null)')
if (stateBaru.length === 0) {
  console.log('[SUDAH ADA] State YouTube dan mode galeri')
} else if (d.includes("const [infoProses, setInfoProses] = useState('')")) {
  d = d.replace("const [infoProses, setInfoProses] = useState('')", "const [infoProses, setInfoProses] = useState('')\n" + stateBaru.join('\n'))
  simpan(FILE_D, d)
  console.log('[BERHASIL] State YouTube dan mode galeri (' + stateBaru.length + ' baris)')
} else {
  console.log('[TIDAK KETEMU] State YouTube dan mode galeri')
}

/* ===== 3. Muat kuota YouTube berkala ===== */
ganti(FILE_D,
  `  useEffect(function () {
    if (mahasiswa) refresh()
  }, [mahasiswa])`,
  `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)
    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)
    return function () { clearInterval(iv) }
  }, [mahasiswa])`,
  'Muat kuota YouTube berkala')

/* ===== 4. Cabang YouTube pada submitGaleri ===== */
ganti(FILE_D,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      if (galForm.file) {`,
  `      let mediaPath = ''
      let mediaType = ''
      let mediaThumb = null
      let mediaSource = galOldYt ? 'youtube' : 'r2'
      let youtubeId = galOldYt || null
      if (galMode === 'video' && galYtLink && !galForm.file) {
        const id = parseYouTubeId(galYtLink)
        if (!id) { alert('Link YouTube tidak valid.'); setBusy(false); return }
        mediaSource = 'youtube'
        youtubeId = id
        mediaPath = ytThumb(id)
        mediaThumb = ytThumb(id)
        mediaType = 'video'
      } else if (galMode === 'video' && galForm.file) {
        if (ytQuota.remaining <= 0) { alert('Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.'); setBusy(false); return }
        const sesiData = await supabase.auth.getSession()
        const tokenS = sesiData.data.session ? sesiData.data.session.access_token : ''
        const sesi = await startYouTubeSession(galForm.judul || ('Dokumentasi ' + galForm.tanggal), galForm.deskripsi || '', galForm.file.type || 'video/mp4', tokenS)
        const hasilYt = await uploadToYouTube(sesi.sessionUri, galForm.file, function (p) { setInfoProses('Mengunggah ke YouTube... ' + Math.round(p * 100) + '%') })
        mediaSource = 'youtube'
        youtubeId = hasilYt.videoId
        mediaPath = ytThumb(hasilYt.videoId)
        mediaThumb = ytThumb(hasilYt.videoId)
        mediaType = 'video'
        setYtQuota(function (q) { return Object.assign({}, q, { used: q.used + 1, remaining: Math.max(0, q.remaining - 1) }) })
        fetchYouTubeQuota().then(setYtQuota)
      } else if (galForm.file) {`,
  'Cabang YouTube pada submitGaleri')
ganti(FILE_D,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb
      }`,
  `        media_path: mediaPath,
        media_type: mediaType,
        media_thumb: mediaThumb,
        media_source: mediaSource,
        youtube_id: youtubeId
      }`,
  'Payload galeri membawa kolom YouTube')

/* ===== 5. startEditGal membawa mode dan sumber lama ===== */
ganti(FILE_D,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path, oldPath: g.media_path, oldThumb: g.media_thumb || '', previewLoading: false })`,
  `setGalForm({ judul: g.judul, deskripsi: g.deskripsi || '', tanggal: g.tanggal, kegiatan: g.kegiatan, file: null, preview: g.media_path || '', oldPath: g.media_source === 'youtube' ? '' : (g.media_path || ''), oldThumb: g.media_source === 'youtube' ? '' : (g.media_thumb || ''), previewLoading: false })
    setGalMode(g.media_source === 'youtube' ? 'video' : (g.media_type === 'video' ? 'video' : 'foto'))
    setGalYtLink('')
    setGalOldYt(g.youtube_id || null)`,
  'startEditGal membawa mode dan sumber lama')

/* ===== 6. Reset mode galeri setelah simpan dan batal ===== */
d = baca(FILE_D)
if (d.includes('setGalOldYt(null)')) {
  console.log('[SUDAH ADA] Reset mode galeri')
} else {
  const polaReset = `setGalForm({ judul: '', deskripsi: '', tanggal: todayInput(), kegiatan: '', file: null, preview: '', oldPath: '', oldThumb: '', previewLoading: false })`
  const gantiReset = polaReset + `\n    setGalMode('foto')\n    setGalYtLink('')\n    setGalOldYt(null)`
  if (d.includes(polaReset)) {
    d = d.split(polaReset).join(gantiReset)
    simpan(FILE_D, d)
    console.log('[BERHASIL] Reset mode galeri')
  } else {
    console.log('[TIDAK KETEMU] Reset mode galeri')
  }
}

/* ===== 7. hapusMediaR2 melewatkan URL YouTube ===== */
ganti(FILE_D,
  `  async function hapusMediaR2(url) {
    const key = keyDariUrl(url)`,
  `  async function hapusMediaR2(url) {
    if (String(url || '').indexOf('i.ytimg.com') !== -1 || String(url || '').indexOf('youtube') !== -1) return
    const key = keyDariUrl(url)`,
  'hapusMediaR2 melewatkan URL YouTube')

/* ===== 8. Hapus galeri melewatkan media YouTube ===== */
ganti(FILE_D,
  `      const urls = target.data.logbook_item_id ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  `      const urls = target.data.logbook_item_id || target.data.media_source === 'youtube' ? [] : [target.data.media_path, target.data.media_thumb].filter(Boolean)`,
  'Hapus galeri melewatkan media YouTube')

/* ===== 9. UI pemilih jenis media pada form galeri ===== */
gantiRegex(FILE_D,
  /<label className=\{labelCls\}>Pilih foto atau video[\s\S]*?\}\} \/>\s*<\/div>\s*<\/div>/,
  `<label className={labelCls}>Jenis media {editGalId ? null : <span className="text-red-500">*</span>}</label>
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
                          onChange={function (e) {
                            const f = e.target.files[0]
                            if (!f) return
                            setGalForm(function (g) { return Object.assign({}, g, { file: f, preview: URL.createObjectURL(f), previewLoading: false }) })
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
                </div>
              </div>`,
  'UI pemilih jenis media pada form galeri',
  'Jenis media {editGalId')

/* ===== 10. Kartu galeri menampilkan thumbnail untuk media YouTube ===== */
gantiRegex('src/components/cards.jsx',
  /<SmartFit src=\{item\.media_thumb \|\| item\.media_path\}[^/]*\/>/,
  `{item.media_source === 'youtube' ? (
        <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <SmartFit src={item.media_thumb || item.media_path} full={item.media_path} type={item.media_type} alt={item.judul} />
      )}`,
  'Kartu galeri menampilkan thumbnail untuk media YouTube',
  '<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />')

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Catatan:')
console.log('1. Tidak ada SQL baru. Kolom media_source dan youtube_id sudah kamu tambahkan sebelumnya.')
console.log('2. Script aman dijalankan ulang karena setiap langkah memeriksa penanda lebih dulu.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard, tab Galeri, perhatikan label kini bertuliskan Jenis media dengan tombol Foto dan Video.')
console.log('2. Pilih Foto: muncul FileInput gambar dengan pratinjau HEIC seperti sebelumnya.')
console.log('3. Pilih Video: muncul sisa kuota harian, FileInput video, dan kolom link YouTube.')
console.log('4. Saat kuota habis, FileInput video mengabu dan hanya kolom link yang bisa dipakai.')
console.log('5. Simpan media YouTube: kartu galeri menampilkan thumbnail YouTube, dan modal detail memutar embed.')
console.log('6. Edit media YouTube: mode otomatis terpilih Video dan tombol simpan mempertahankan sumber lama.')
console.log('7. Hapus media YouTube: tidak ada percobaan hapus ke R2 karena penjaga URL sudah aktif.')