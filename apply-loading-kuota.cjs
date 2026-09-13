const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menambahkan indikator loading pada kuota...')
console.log('')

const FILE_D = 'src/pages/DashboardPage.jsx'
let d = baca(FILE_D)
let berubah = false

/* ===== 1. Tambah state ytQuotaLoading ===== */
const cariState = `  const [ytQuota, setYtQuota] = useState({ limit: 5, used: 0, remaining: 5 })`
const gantiState = `  const [ytQuota, setYtQuota] = useState({ limit: 5, used: 0, remaining: 5 })
  const [ytQuotaLoading, setYtQuotaLoading] = useState(true)`
if (d.includes('ytQuotaLoading')) {
  console.log('[SUDAH ADA] State ytQuotaLoading')
} else if (d.includes(cariState)) {
  d = d.replace(cariState, gantiState)
  berubah = true
  console.log('[BERHASIL] State ytQuotaLoading ditambahkan')
} else {
  console.log('[TIDAK KETEMU] State ytQuota')
}

/* ===== 2. Set loading saat fetch kuota ===== */
const cariFetch = `  useEffect(function () {
    if (mahasiswa) refresh()
    fetchYouTubeQuota().then(setYtQuota)`
const gantiFetch = `  useEffect(function () {
    if (mahasiswa) refresh()
    setYtQuotaLoading(true)
    fetchYouTubeQuota().then(function (data) {
      setYtQuota(data)
      setYtQuotaLoading(false)
    })`
if (d.includes('setYtQuotaLoading(true)')) {
  console.log('[SUDAH ADA] Loading state pada fetch kuota')
} else if (d.includes(cariFetch)) {
  d = d.replace(cariFetch, gantiFetch)
  berubah = true
  console.log('[BERHASIL] Loading state dipasang pada fetch kuota')
} else {
  console.log('[TIDAK KETEMU] Blok fetch kuota di useEffect')
}

/* ===== 3. Set loading false juga di interval ===== */
const cariInterval = `    const iv = setInterval(function () { fetchYouTubeQuota().then(setYtQuota) }, 30000)`
const gantiInterval = `    const iv = setInterval(function () { fetchYouTubeQuota().then(function (data) { setYtQuota(data); setYtQuotaLoading(false) }) }, 30000)`
if (d.includes(gantiInterval)) {
  console.log('[SUDAH ADA] Loading state pada interval')
} else if (d.includes(cariInterval)) {
  d = d.replace(cariInterval, gantiInterval)
  berubah = true
  console.log('[BERHASIL] Loading state dipasang pada interval')
} else {
  console.log('[TIDAK KETEMU] Blok interval kuota')
}

/* ===== 4. Update tampilan kuota di form logbook ===== */
const cariLogbook = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
const gantiLogbook = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuotaLoading ? <span className="inline-block w-3 h-3 ml-1 border-2 border-slate-400 border-t-transparent rounded-full animate-spin align-middle"></span> : <>{ytQuota.remaining} dari {ytQuota.limit}</>}</p>`
if (d.includes('border-t-transparent rounded-full animate-spin')) {
  console.log('[SUDAH ADA] Indikator loading di form logbook')
} else if (d.includes(cariLogbook)) {
  d = d.split(cariLogbook).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form logbook')
} else {
  console.log('[TIDAK KETEMU] Teks kuota di form logbook')
}

/* ===== 5. Update tampilan kuota di form galeri ===== */
const cariGaleri = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
if (d.includes(cariGaleri) && d.includes('galMode === \'video\'')) {
  d = d.split(cariGaleri).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form galeri')
}

/* ===== 6. Update tampilan kuota di form rincian kegiatan ===== */
const cariRincian = `<p className="text-xs font-semibold text-slate-500">Sisa kuota upload video hari ini: {ytQuota.remaining} dari {ytQuota.limit}</p>`
if (d.includes(cariRincian) && d.includes('it.mode === \'video\'')) {
  d = d.split(cariRincian).join(gantiLogbook)
  berubah = true
  console.log('[BERHASIL] Indikator loading dipasang di form rincian kegiatan')
}

if (berubah) {
  simpan(FILE_D, d)
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat halaman dibuka, tulisan kuota menampilkan spinner kecil berputar.')
console.log('2. Begitu data dari server datang (biasanya < 1 detik), spinner hilang dan angka muncul.')
console.log('3. Tidak ada lagi kedipan angka dari 6 ke 26, karena loading state menahan tampilan.')