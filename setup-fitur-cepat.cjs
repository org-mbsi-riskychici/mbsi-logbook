/**
 * setup-fitur-cepat.cjs
 * Menerapkan fitur "Isi Cepat" berbasis QR untuk project Logbook Magang BSI.
 *
 * Yang dilakukan script ini:
 *   1. Membuat src/pages/QuickPage.jsx  -> form cepat (tab Logbook & Daftar Hadir)
 *   2. Mengubah src/App.jsx             -> import, RequireAuth dengan ?next, route /cepat
 *   3. Mengubah src/pages/LoginPage.jsx -> setelah login balik ke halaman asal (?next)
 *   4. Mengubah public/llms.txt         -> tambah dokumentasi route /cepat
 *
 * Cara pakai: jalankan dari folder root project (sejajar package.json):
 *   node setup-fitur-cepat.cjs
 */

'use strict'

const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const FILE = {
  app: path.join(ROOT, 'src', 'App.jsx'),
  login: path.join(ROOT, 'src', 'pages', 'LoginPage.jsx'),
  llms: path.join(ROOT, 'public', 'llms.txt'),
  quick: path.join(ROOT, 'src', 'pages', 'QuickPage.jsx')
}

function gagal(pesan) {
  console.error('')
  console.error('[GAGAL] ' + pesan)
  console.error('Tidak ada file yang diubah.')
  process.exit(1)
}

/* ===== 1. Validasi struktur project ===== */

if (!fs.existsSync(path.join(ROOT, 'package.json'))) {
  gagal('package.json tidak ditemukan. Jalankan script dari folder root project.')
}
for (const nama of ['app', 'login', 'llms']) {
  if (!fs.existsSync(FILE[nama])) gagal('File tidak ditemukan: ' + FILE[nama])
}
if (fs.existsSync(FILE.quick)) {
  gagal('src/pages/QuickPage.jsx sudah ada. Fitur tampaknya sudah pernah diterapkan.')
}

let appSrc = fs.readFileSync(FILE.app, 'utf8')
let loginSrc = fs.readFileSync(FILE.login, 'utf8')
let llmsSrc = fs.readFileSync(FILE.llms, 'utf8')

if (appSrc.indexOf('/cepat') !== -1 || appSrc.indexOf('QuickPage') !== -1) {
  gagal('src/App.jsx sudah memuat route /cepat atau QuickPage. Fitur tampaknya sudah pernah diterapkan.')
}

/* ===== 2. Helper ganti teks (pastikan pola ada dan tunggal) ===== */

function gantiTepat(src, cari, ganti, label, file) {
  const i = src.indexOf(cari)
  if (i === -1) gagal('Pola tidak ditemukan di ' + file + ' — langkah: ' + label)
  if (src.indexOf(cari, i + cari.length) !== -1) gagal('Pola muncul lebih dari sekali di ' + file + ' — langkah: ' + label)
  return src.slice(0, i) + ganti + src.slice(i + cari.length)
}

/* ===== 3. Ubah src/App.jsx ===== */

const EOL_APP = appSrc.indexOf('\r\n') !== -1 ? '\r\n' : '\n'

appSrc = gantiTepat(
  appSrc,
  "import DashboardPage from './pages/DashboardPage.jsx'",
  "import DashboardPage from './pages/DashboardPage.jsx'" + EOL_APP + "import QuickPage from './pages/QuickPage.jsx'",
  'import QuickPage',
  'src/App.jsx'
)

const blokRequireAuth = [
  'function RequireAuth(props) {',
  '  const { mahasiswa, loading } = useAuth()',
  '  const location = useLocation()',
  '  if (loading) return <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8"><SkeletonDashboard /></div>',
  "  if (!mahasiswa) return <Navigate to={'/login?next=' + encodeURIComponent(location.pathname + location.search)} replace />",
  '  return props.children',
  '}'
].join(EOL_APP)

const regexRequireAuth = /function RequireAuth\(props\) \{[\s\S]*?\n\}/
if (!regexRequireAuth.test(appSrc)) gagal('Fungsi RequireAuth tidak ditemukan di src/App.jsx')
appSrc = appSrc.replace(regexRequireAuth, blokRequireAuth)

appSrc = gantiTepat(
  appSrc,
  '<Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />',
  '<Route path="/dashboard" element={<RequireAuth><DashboardPage /></RequireAuth>} />' +
    EOL_APP +
    '            <Route path="/cepat" element={<RequireAuth><QuickPage /></RequireAuth>} />',
  'route /cepat',
  'src/App.jsx'
)

/* ===== 4. Ubah src/pages/LoginPage.jsx ===== */

const EOL_LOGIN = loginSrc.indexOf('\r\n') !== -1 ? '\r\n' : '\n'

loginSrc = gantiTepat(
  loginSrc,
  "import { useNavigate } from 'react-router-dom'",
  "import { useNavigate, useSearchParams } from 'react-router-dom'",
  'import useSearchParams',
  'src/pages/LoginPage.jsx'
)

loginSrc = gantiTepat(
  loginSrc,
  'const navigate = useNavigate()',
  'const navigate = useNavigate()' + EOL_LOGIN + '  const [params] = useSearchParams()',
  'state params',
  'src/pages/LoginPage.jsx'
)

loginSrc = gantiTepat(
  loginSrc,
  "navigate('/dashboard')",
  "const next = params.get('next')" +
    EOL_LOGIN +
    "  navigate(next && next.charAt(0) === '/' && next.indexOf('//') !== 0 ? next : '/dashboard')",
  'redirect balik setelah login',
  'src/pages/LoginPage.jsx'
)

/* ===== 5. Ubah public/llms.txt ===== */

const EOL_LLMS = llmsSrc.indexOf('\r\n') !== -1 ? '\r\n' : '\n'
const BARIS_DASHBOARD = '- /dashboard : pengelolaan logbook, galeri, daftar hadir, dan foto profil, memerlukan sesi login'
const BARIS_CEPAT = '- /cepat : form cepat berbasis QR untuk menambah kegiatan logbook hari ini dan daftar hadir tanpa membuka dashboard, memerlukan sesi login'

if (llmsSrc.indexOf(BARIS_CEPAT) === -1) {
  llmsSrc = gantiTepat(llmsSrc, BARIS_DASHBOARD, BARIS_DASHBOARD + EOL_LLMS + BARIS_CEPAT, 'baris /cepat', 'public/llms.txt')
}

/* ===== 6. Isi src/pages/QuickPage.jsx ===== */

const QUICK_PAGE = `import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../lib/auth.js'
import { uploadMedia } from '../lib/upload.js'
import { syncGaleriFromLogbook } from '../lib/logbook.js'
import { urlPratinjau } from '../lib/konversi.js'
import { todayInput, formatTanggal } from '../lib/format.js'
import { KATEGORI } from '../lib/constants.js'
import { inputCls, labelCls, btnPrimary, useToast, AutoTextArea, LabelProses } from '../components/ui.jsx'
import { CustomSelect } from '../components/controls.jsx'
import { SizedIcon } from '../components/icons.jsx'

const STATUS_HADIR = ['Masuk', 'Izin', 'Bolos']

export default function QuickPage() {
  const { mahasiswa } = useAuth()
  const toast = useToast()
  const tanggal = todayInput()

  const [tab, setTab] = useState('logbook')
  const [loading, setLoading] = useState(true)
  const [todayLog, setTodayLog] = useState(null)
  const [hadirHariIni, setHadirHariIni] = useState(null)
  const [lastLogTanggal, setLastLogTanggal] = useState(null)
  const [lastHadirTanggal, setLastHadirTanggal] = useState(null)

  const [kategori, setKategori] = useState('')
  const [judulKegiatan, setJudulKegiatan] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [showGal, setShowGal] = useState(false)
  const [busy, setBusy] = useState(false)
  const [info, setInfo] = useState('')

  const [status, setStatus] = useState('Masuk')
  const [alasan, setAlasan] = useState('')

  const cameraRef = useRef(null)
  const galeriRef = useRef(null)

  async function muatData(mhs, senyap) {
    if (!senyap) setLoading(true)
    const l = await supabase
      .from('logbooks')
      .select('*, logbook_items(*)')
      .eq('mahasiswa_id', mhs.id)
      .eq('tanggal', tanggal)
      .order('created_at', { ascending: false })
      .limit(1)
    const log = (l.data || [])[0] || null
    if (log) {
      log.logbook_items = (log.logbook_items || []).sort(function (a, b) { return (a.urutan || 0) - (b.urutan || 0) })
    }
    const h = await supabase
      .from('daftar_hadir')
      .select('*')
      .eq('mahasiswa_id', mhs.id)
      .eq('tanggal', tanggal)
      .limit(1)
    const hadir = (h.data || [])[0] || null
    const ll = await supabase
      .from('logbooks')
      .select('tanggal')
      .eq('mahasiswa_id', mhs.id)
      .order('tanggal', { ascending: false })
      .limit(1)
    const lh = await supabase
      .from('daftar_hadir')
      .select('tanggal')
      .eq('mahasiswa_id', mhs.id)
      .order('tanggal', { ascending: false })
      .limit(1)
    setTodayLog(log)
    setHadirHariIni(hadir)
    setLastLogTanggal(ll.data && ll.data[0] ? ll.data[0].tanggal : null)
    setLastHadirTanggal(lh.data && lh.data[0] ? lh.data[0].tanggal : null)
    if (hadir) {
      setStatus(hadir.status)
      setAlasan(hadir.alasan || '')
    }
    if (!senyap) setLoading(false)
  }

  useEffect(function () {
    if (mahasiswa) muatData(mahasiswa)
  }, [mahasiswa])

  async function pilihFile(e) {
    const f = e.target.files[0]
    e.target.value = ''
    if (!f) return
    if (preview && preview.indexOf('blob:') === 0) URL.revokeObjectURL(preview)
    setFile(f)
    setPreview(await urlPratinjau(f))
  }

  function hapusFile() {
    if (preview && preview.indexOf('blob:') === 0) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    setShowGal(false)
  }

  async function submitLogbook(e) {
    e.preventDefault()
    if (!todayLog && !kategori) { toast.gagal('Pilih kategori terlebih dahulu.'); return }
    if (!judulKegiatan.trim()) { toast.gagal('Judul kegiatan wajib diisi.'); return }
    setBusy(true)
    try {
      let mediaPath = null
      let mediaThumb = null
      if (file) {
        const up = await uploadMedia(file, 'logbook', setInfo)
        mediaPath = up.publicUrl
        mediaThumb = up.thumbUrl || null
      }
      let logId = todayLog ? todayLog.id : null
      if (!todayLog) {
        const ins = await supabase.from('logbooks').insert({
          mahasiswa_id: mahasiswa.id, tanggal: tanggal, unit: '', kategori: kategori,
          judul: judulKegiatan.trim(), kendala: '', solusi: '', pembelajaran: '', status: 'publik'
        }).select().single()
        if (ins.error) throw new Error(ins.error.message)
        logId = ins.data.id
      }
      const urutan = todayLog ? todayLog.logbook_items.reduce(function (m, it) { return Math.max(m, it.urutan || 0) }, 0) + 1 : 1
      const insItem = await supabase.from('logbook_items').insert({
        logbook_id: logId,
        urutan: urutan,
        judul: judulKegiatan.trim(),
        deskripsi: deskripsi.trim(),
        hasil: '',
        media_path: mediaPath,
        media_type: mediaPath ? 'foto' : null,
        media_thumb: mediaThumb,
        media_source: 'r2',
        youtube_id: null,
        drive_id: null,
        show_in_gallery: showGal && !!mediaPath
      }).select().single()
      if (insItem.error) throw new Error(insItem.error.message)
      if (todayLog && todayLog.status !== 'publik') {
        await supabase.from('logbooks').update({ status: 'publik' }).eq('id', todayLog.id)
      }
      if (showGal && mediaPath) {
        await syncGaleriFromLogbook(mahasiswa.id, [insItem.data], {
          tanggal: tanggal,
          kategori: todayLog ? todayLog.kategori : kategori
        })
      }
      const pertama = !todayLog
      setJudulKegiatan('')
      setDeskripsi('')
      hapusFile()
      if (pertama) setKategori('')
      await muatData(mahasiswa, true)
      toast.sukses(pertama ? 'Logbook hari ini berhasil dibuat' : 'Kegiatan baru berhasil ditambahkan')
    } catch (err) {
      toast.gagal('Gagal menyimpan logbook: ' + err.message)
    }
    setInfo('')
    setBusy(false)
  }

  async function submitAbsen(e) {
    e.preventDefault()
    setBusy(true)
    try {
      const payload = {
        mahasiswa_id: mahasiswa.id,
        tanggal: tanggal,
        status: status,
        alasan: status === 'Masuk' ? '' : alasan.trim()
      }
      let res
      if (hadirHariIni) {
        res = await supabase.from('daftar_hadir').update(payload).eq('id', hadirHariIni.id)
      } else {
        res = await supabase.from('daftar_hadir').insert(payload)
      }
      if (res.error) throw new Error(res.error.message)
      await muatData(mahasiswa, true)
      toast.sukses(hadirHariIni ? 'Daftar hadir berhasil diperbarui' : 'Daftar hadir berhasil disimpan')
    } catch (err) {
      toast.gagal('Gagal menyimpan kehadiran: ' + err.message)
    }
    setBusy(false)
  }

  function infoTerakhir(tgl) {
    if (!tgl) return { teks: 'belum pernah', lama: true }
    const selisih = Math.round((new Date(tanggal + 'T00:00:00').getTime() - new Date(tgl + 'T00:00:00').getTime()) / 86400000)
    if (selisih <= 0) return { teks: 'hari ini', lama: false }
    if (selisih === 1) return { teks: 'kemarin', lama: false }
    return { teks: selisih + ' hari yang lalu', lama: true }
  }

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center"><div className="h-10 w-10 rounded-full border-4 border-bsi-500 border-t-transparent animate-spin"></div></div>
  }

  const infoLog = infoTerakhir(lastLogTanggal)
  const infoHadir = infoTerakhir(lastHadirTanggal)

  const tabCls = function (t) {
    return 'flex-1 px-4 py-2.5 rounded-xl text-xs sm:rounded-2xl sm:py-3 sm:text-sm font-bold ' + (tab === t ? 'bg-white text-bsi-900' : 'bg-white/10 text-white hover:bg-white/20')
  }

  return (
    <div className="mx-auto w-full max-w-xl space-y-5">
      <section className="rounded-[2rem] bg-bsi-900 p-5 text-white sm:p-8">
        <h1 className="text-xl font-black sm:text-2xl">Isi Cepat</h1>
        <p className="mt-1 text-sm text-white/80">{formatTanggal(tanggal)}</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={function () { setTab('logbook') }} className={tabCls('logbook')}>Logbook</button>
          <button type="button" onClick={function () { setTab('absen') }} className={tabCls('absen')}>Daftar Hadir</button>
        </div>
      </section>

      {tab === 'logbook' ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className={'mb-4 flex items-center gap-1.5 text-xs font-semibold ' + (infoLog.lama ? 'text-amber-600' : 'text-slate-500')}>
            <SizedIcon name="calendar" size={13} />
            Terakhir mengisi logbook: {infoLog.teks}
          </p>
          {todayLog ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">Logbook hari ini sudah ada</p>
              <p className="mt-1 text-sm text-emerald-800">{todayLog.judul} • {todayLog.logbook_items.length} kegiatan</p>
              <div className="mt-2 space-y-1">
                {todayLog.logbook_items.map(function (it, i) {
                  return <p key={it.id} className="truncate text-xs text-emerald-800">{i + 1}. {it.judul}</p>
                })}
              </div>
              <p className="mt-2 text-xs text-emerald-800">Kegiatan baru ditambahkan di bawahnya tanpa menghapus kegiatan lama.</p>
              {todayLog.status !== 'publik' ? <p className="mt-1 text-xs font-semibold text-emerald-800">Status masih draf — akan otomatis dipublikasikan.</p> : null}
            </div>
          ) : (
            <div>
              <label className={labelCls}>Kategori Utama <span className="text-red-500">*</span></label>
              <div className="mt-1.5">
                <CustomSelect placeholder="Pilih Kategori" value={kategori} onChange={setKategori} options={KATEGORI.map(function (k) { return { value: k, label: k } })} />
              </div>
            </div>
          )}

          <form onSubmit={submitLogbook} className="mt-5 space-y-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-bold text-bsi-800">{todayLog ? 'Kegiatan Baru (kegiatan ' + (todayLog.logbook_items.length + 1) + ')' : 'Kegiatan'}</p>
              <input className={inputCls} value={judulKegiatan} onChange={function (e) { setJudulKegiatan(e.target.value) }} aria-label="Judul Kegiatan" placeholder="Judul kegiatan" />
              <AutoTextArea className={inputCls} value={deskripsi} onChange={function (e) { setDeskripsi(e.target.value) }} aria-label="Deskripsi Kegiatan" placeholder="Deskripsi singkat kegiatan" />
              {preview ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
                  <img src={preview} alt="Pratinjau" className="absolute inset-0 h-full w-full object-contain" />
                  <button type="button" onClick={hapusFile} title="Hapus Gambar" className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-red-500 text-white hover:bg-red-600">
                    <SizedIcon name="close" size={14} />
                  </button>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={function () { cameraRef.current.click() }} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 hover:border-bsi-500 hover:bg-slate-100">
                  <SizedIcon name="camera" size={18} /> Ambil Foto
                </button>
                <button type="button" onClick={function () { galeriRef.current.click() }} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white px-3 py-3.5 text-sm font-semibold text-slate-700 hover:border-bsi-500 hover:bg-slate-100">
                  <SizedIcon name="image" size={18} /> Dari Galeri
                </button>
              </div>
              <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pilihFile} />
              <input ref={galeriRef} type="file" accept="image/*" className="hidden" onChange={pilihFile} />
              {preview ? (
                <label className="flex w-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-3">
                  <input type="checkbox" checked={showGal} onChange={function (e) { setShowGal(e.target.checked) }} className="mt-0.5 h-4 w-4 rounded accent-bsi-800" />
                  <span className="text-sm font-semibold text-slate-800">Tampilkan kegiatan ini di galeri</span>
                </label>
              ) : null}
            </div>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <LabelProses teks={info || 'Menyimpan'} /> : (todayLog ? 'Tambah Kegiatan' : 'Simpan Logbook')}
            </button>
          </form>
        </section>
      ) : null}

      {tab === 'absen' ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <p className={'mb-4 flex items-center gap-1.5 text-xs font-semibold ' + (infoHadir.lama ? 'text-amber-600' : 'text-slate-500')}>
            <SizedIcon name="clipboard" size={13} />
            Terakhir mengisi daftar hadir: {infoHadir.teks}
          </p>
          {hadirHariIni ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-bold text-emerald-800">Kamu sudah mengisi daftar hadir hari ini ({hadirHariIni.status})</p>
              <p className="mt-1 text-xs text-emerald-800">Form di bawah bisa dipakai untuk memperbarui status bila ada perubahan.</p>
            </div>
          ) : null}
          <form onSubmit={submitAbsen} className={'space-y-4 ' + (hadirHariIni ? 'mt-5' : '')}>
            <div>
              <label className={labelCls}>Status Kehadiran <span className="text-red-500">*</span></label>
              <div className="mt-1.5 flex gap-2">
                {STATUS_HADIR.map(function (s) {
                  const aktif = status === s
                  const warna = aktif
                    ? (s === 'Masuk' ? 'bg-emerald-500 text-white' : s === 'Izin' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white')
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  return <button type="button" key={s} onClick={function () { setStatus(s) }} className={'flex-1 rounded-2xl px-3 py-3 text-sm font-bold ' + warna}>{s}</button>
                })}
              </div>
            </div>
            <div>
              <label className={labelCls}>Alasan atau Keterangan</label>
              <AutoTextArea
                className={inputCls + (status === 'Masuk' ? ' cursor-not-allowed opacity-60' : '')}
                value={alasan}
                onChange={function (e) { setAlasan(e.target.value) }}
                aria-label="Alasan atau Keterangan"
                placeholder={status === 'Masuk' ? 'Status Masuk tidak memerlukan alasan' : 'Contoh: Keperluan keluarga, sakit.'}
                disabled={status === 'Masuk'}
              />
            </div>
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? <LabelProses teks="Menyimpan" /> : (hadirHariIni ? 'Perbarui Daftar Hadir' : 'Simpan Daftar Hadir')}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
`

/* ===== 7. Tulis semua file (baru dieksekusi jika semua langkah di atas lolos) ===== */

try {
  fs.writeFileSync(FILE.quick, QUICK_PAGE, 'utf8')
  fs.writeFileSync(FILE.app, appSrc, 'utf8')
  fs.writeFileSync(FILE.login, loginSrc, 'utf8')
  fs.writeFileSync(FILE.llms, llmsSrc, 'utf8')
} catch (e) {
  gagal('Gagal menulis file: ' + e.message)
}

console.log('')
console.log('[SELESAI] Fitur Isi Cepat (/cepat) berhasil diterapkan.')
console.log('')
console.log('File yang dibuat/diubah:')
console.log('  + src/pages/QuickPage.jsx   (baru)')
console.log('  ~ src/App.jsx               (import QuickPage, RequireAuth + ?next, route /cepat)')
console.log('  ~ src/pages/LoginPage.jsx   (setelah login balik ke halaman asal)')
console.log('  ~ public/llms.txt           (dokumentasi route baru)')
console.log('')
console.log('Langkah berikutnya:')
console.log('  1. Uji lokal   : npm run dev, buka http://localhost:5173/cepat')
console.log('  2. Deploy      : push ke GitHub / vercel deploy seperti biasa')
console.log('  3. Buat QR     : encode URL https://domain-kamu/cepat pakai QR generator,')
console.log('                   lalu print/tempel di kantor atau share di grup WA')