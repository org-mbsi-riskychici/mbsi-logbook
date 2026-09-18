#!/usr/bin/env node
/*
 * terapkan-semua-perbaikan.cjs
 * Patch otomatis idempoten untuk seluruh perbaikan yang dibahas:
 * 1) auth.js: useAuth menyinkronkan ulang sesi, tombol Dashboard tidak hilang tanpa refresh
 * 2) ui.jsx: panel Modal detail diberi kelas modal-detail
 * 3) index.css: aturan header sticky dibatasi ke .modal-detail supaya ConfirmModal membulat
 * 4) index.css: latar hitam dipindah ke .carousel-slide supaya blur foto potret terlihat di kartu
 * 5) DashboardPage.jsx: progres upload banyak file diberi nomor urut dan total file
 *
 * Cara pakai dari root project:
 *   node terapkan-semua-perbaikan.cjs
 * Mode aman tanpa menulis file:
 *   node terapkan-semua-perbaikan.cjs --dry-run
 *
 * Setiap langkah punya penanda sendiri. Jika perbaikan sudah ada, langkah dilewati.
 */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const DRY = process.argv.indexOf('--dry-run') !== -1

const TARGET = {
  auth: path.join(ROOT, 'src', 'lib', 'auth.js'),
  ui: path.join(ROOT, 'src', 'components', 'ui.jsx'),
  css: path.join(ROOT, 'src', 'index.css'),
  dash: path.join(ROOT, 'src', 'pages', 'DashboardPage.jsx')
}

const USE_AUTH_BARU = `async function cariMahasiswa(uid) {
  if (!uid) return null
  const { data } = await supabase
    .from('mahasiswa')
    .select('*')
    .eq('auth_uid', uid)
    .single()
  return data || null
}

export function useAuth() {
  const [mahasiswa, setMahasiswa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    let active = true

    async function sinkronkan(sessionUser) {
      try {
        let uid = sessionUser ? sessionUser.id : null

        if (!uid) {
          const { data } = await supabase.auth.getSession()
          uid = data.session ? data.session.user.id : null
        }

        if (!uid) {
          if (active) {
            setMahasiswa(null)
            setLoading(false)
          }
          return
        }

        const mhs = await cariMahasiswa(uid)
        if (active) {
          setMahasiswa(mhs)
          setLoading(false)
        }
      } catch (e) {
        if (active) setLoading(false)
      }
    }

    sinkronkan(null)

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        sinkronkan(null)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_OUT') {
        if (active) {
          setMahasiswa(null)
          setLoading(false)
        }
        return
      }

      sinkronkan(session && session.user ? session.user : null)
    })

    return function () {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { mahasiswa: mahasiswa, loading: loading }
}
`

const HELPER_BARU = `function buatPelaporUpload(setInfo, nomor, total) {
  const awalan = total > 1 ? 'File ' + nomor + ' dari ' + total + ': ' : ''
  return function (pesan) {
    if (!pesan) {
      setInfo(total > 1 ? awalan + 'menyiapkan file' : '')
      return
    }
    setInfo(awalan + pesan)
  }
}

`

const laporan = []

function catat(nama, status, pesan) {
  laporan.push({ nama: nama, status: status })
  const ikon = status === 'ok' ? '[DIPATCH]' : (status === 'lewati' ? '[SUDAH ADA]' : '[GAGAL]')
  console.log(ikon + ' ' + nama + (pesan ? ' : ' + pesan : ''))
}

function gantiSemua(teks, target, pengganti) {
  return teks.split(target).join(pengganti)
}

function patchAuth() {
  const nama = 'src/lib/auth.js'
  if (!fs.existsSync(TARGET.auth)) return catat(nama, 'gagal', 'file tidak ditemukan')
  const isi = fs.readFileSync(TARGET.auth, 'utf8')
  if (isi.indexOf('function sinkronkan(') !== -1 && isi.indexOf('cariMahasiswa') !== -1) {
    return catat(nama, 'lewati', 'perbaikan auth sudah diterapkan')
  }
  const idx = isi.indexOf('export function useAuth()')
  if (idx === -1) return catat(nama, 'gagal', 'penanda export function useAuth tidak ditemukan')
  if (!DRY) fs.writeFileSync(TARGET.auth, isi.slice(0, idx) + USE_AUTH_BARU, 'utf8')
  catat(nama, 'ok', 'useAuth diganti versi yang menyinkronkan ulang sesi')
}

function patchUi() {
  const nama = 'src/components/ui.jsx'
  if (!fs.existsSync(TARGET.ui)) return catat(nama, 'gagal', 'file tidak ditemukan')
  const isi = fs.readFileSync(TARGET.ui, 'utf8')
  if (isi.indexOf('anim-modal modal-detail') !== -1) {
    return catat(nama, 'lewati', 'kelas modal-detail sudah ada')
  }
  const penanda = 'anim-modal w-full max-w-3xl'
  if (isi.indexOf(penanda) === -1) return catat(nama, 'gagal', 'penanda panel Modal tidak ditemukan')
  if (!DRY) fs.writeFileSync(TARGET.ui, gantiSemua(isi, penanda, 'anim-modal modal-detail w-full max-w-3xl'), 'utf8')
  catat(nama, 'ok', 'panel Modal detail diberi kelas modal-detail')
}

function patchCss() {
  const namaModal = 'src/index.css (modal-detail)'
  const namaCarousel = 'src/index.css (blur carousel)'
  if (!fs.existsSync(TARGET.css)) {
    catat(namaModal, 'gagal', 'file tidak ditemukan')
    catat(namaCarousel, 'gagal', 'file tidak ditemukan')
    return
  }
  let isi = fs.readFileSync(TARGET.css, 'utf8')
  let berubah = false

  const mA = '.anim-modal > div:first-child {'
  const mB = '.anim-modal > * + * {'
  if (isi.indexOf('.modal-detail > div:first-child') !== -1) {
    catat(namaModal, 'lewati', 'selector modal-detail sudah ada')
  } else if (isi.indexOf(mA) === -1 || isi.indexOf(mB) === -1) {
    catat(namaModal, 'gagal', 'selector header sticky tidak ditemukan')
  } else {
    isi = gantiSemua(isi, mA, '.modal-detail > div:first-child {')
    isi = gantiSemua(isi, mB, '.modal-detail > * + * {')
    berubah = true
    catat(namaModal, 'ok', 'aturan header sticky dibatasi ke .modal-detail')
  }

  const cA = '.carousel-slide { position: relative; flex: 0 0 100%; height: 100%; }'
  const cA2 = '.carousel-slide { position: relative; flex: 0 0 100%; height: 100%; background: #020617; }'
  const cB = '.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; background: #020617; }'
  const cB2 = '.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; background: transparent; }'
  if (isi.indexOf(cA2) !== -1) {
    catat(namaCarousel, 'lewati', 'latar carousel sudah diperbaiki')
  } else if (isi.indexOf(cA) === -1 || isi.indexOf(cB) === -1) {
    catat(namaCarousel, 'gagal', 'aturan carousel-slide tidak ditemukan')
  } else {
    isi = gantiSemua(isi, cA, cA2)
    isi = gantiSemua(isi, cB, cB2)
    berubah = true
    catat(namaCarousel, 'ok', 'latar hitam dipindah ke slide supaya blur potret terlihat')
  }

  if (berubah && !DRY) fs.writeFileSync(TARGET.css, isi, 'utf8')
}

function patchDash() {
  const nama = 'src/pages/DashboardPage.jsx'
  if (!fs.existsSync(TARGET.dash)) return catat(nama, 'gagal', 'file tidak ditemukan')
  let isi = fs.readFileSync(TARGET.dash, 'utf8')
  const hasil = []

  const LOG_LINE = "const LOG_INITIAL = { kategori: '', status: '', timeMode: 'bulan', bulan: '', dari: '', sampai: '' }"
  if (isi.indexOf('function buatPelaporUpload(') !== -1) {
    hasil.push('helper lewati')
  } else if (isi.indexOf(LOG_LINE) === -1) {
    hasil.push('helper gagal')
  } else {
    isi = gantiSemua(isi, LOG_LINE, HELPER_BARU + LOG_LINE)
    hasil.push('helper ok')
  }

  const CLEAN_LINE = 'const clean = []'
  if (isi.indexOf('const totalUpload = items.reduce(') !== -1) {
    hasil.push('total lewati')
  } else if (isi.indexOf(CLEAN_LINE) === -1) {
    hasil.push('total gagal')
  } else {
    const sisip = CLEAN_LINE +
      '\n      const totalUpload = items.reduce(function (n, x) { return n + (x.judul.trim() && x.file ? 1 : 0) }, 0)' +
      '\n      let nomorUpload = 0' +
      "\n      if (totalUpload > 1) setInfoProses('Mengunggah ' + totalUpload + ' file media sekaligus')"
    isi = gantiSemua(isi, CLEAN_LINE, sisip)
    hasil.push('total ok')
  }

  const YT_TARGET = "const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { setInfoProses('Mengunggah video ' + Math.round(p * 100) + '%') })"
  if (isi.indexOf("lapor('Mengunggah video '") !== -1) {
    hasil.push('youtube lewati')
  } else if (isi.indexOf(YT_TARGET) === -1) {
    hasil.push('youtube gagal')
  } else {
    const ytBaru = 'nomorUpload += 1' +
      '\n      const lapor = buatPelaporUpload(setInfoProses, nomorUpload, totalUpload)' +
      "\n      lapor('')" +
      "\n      const hasilYt = await unggahVideoYouTube(it.file, it.judul || 'Dokumentasi Magang', function (p) { lapor('Mengunggah video ' + Math.round(p * 100) + '%') })"
    isi = gantiSemua(isi, YT_TARGET, ytBaru)
    hasil.push('youtube ok')
  }

  const UP_TARGET = "const up = await uploadMedia(it.file, 'logbook', function (pesan) { setInfoProses(pesan) })"
  if (isi.indexOf("uploadMedia(it.file, 'logbook', lapor)") !== -1) {
    hasil.push('r2 lewati')
  } else if (isi.indexOf(UP_TARGET) === -1) {
    hasil.push('r2 gagal')
  } else {
    const upBaru = 'nomorUpload += 1' +
      '\n      const lapor = buatPelaporUpload(setInfoProses, nomorUpload, totalUpload)' +
      "\n      lapor('')" +
      "\n      const up = await uploadMedia(it.file, 'logbook', lapor)"
    isi = gantiSemua(isi, UP_TARGET, upBaru)
    hasil.push('r2 ok')
  }

  const CLEAN_LEN = "if (!clean.length) { toast.gagal('Tambahkan minimal satu kegiatan dengan judul.'); setBusy(false); return }"
  const sudahAdaClear = /setInfoProses\(''\)\s*\n\s*if \(!clean\.length\)/.test(isi)
  if (sudahAdaClear) {
    hasil.push('clear lewati')
  } else if (isi.indexOf(CLEAN_LEN) === -1) {
    hasil.push('clear gagal')
  } else {
    isi = gantiSemua(isi, CLEAN_LEN, "setInfoProses('')\n      " + CLEAN_LEN)
    hasil.push('clear ok')
  }

  const gagal = hasil.filter(function (h) { return h.indexOf('gagal') !== -1 }).length
  const ok = hasil.filter(function (h) { return h.indexOf(' ok') !== -1 }).length
  if (gagal) {
    catat(nama, 'gagal', hasil.join(', '))
    return
  }
  if (!ok) {
    catat(nama, 'lewati', 'semua langkah progres upload sudah ada')
    return
  }
  if (!DRY) fs.writeFileSync(TARGET.dash, isi, 'utf8')
  catat(nama, 'ok', hasil.join(', '))
}

console.log('Mode: ' + (DRY ? 'dry run, tidak ada file yang ditulis' : 'patch langsung ke file'))
console.log('')

patchAuth()
patchUi()
patchCss()
patchDash()

const gagal = laporan.filter(function (l) { return l.status === 'gagal' })
console.log('')
console.log('Ringkasan: ' + (laporan.length - gagal.length) + ' dari ' + laporan.length + ' target beres.')
if (gagal.length) {
  console.log('Ada target yang gagal. Periksa pesan di atas dan jangan commit dulu sebelum beres.')
  process.exit(1)
}
if (DRY) {
  console.log('Dry run selesai. Jalankan tanpa --dry-run untuk menulis perubahan.')
} else {
  console.log('Semua perbaikan diterapkan. Jalankan npm run dev untuk memeriksa hasilnya.')
}