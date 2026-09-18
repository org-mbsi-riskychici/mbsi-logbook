#!/usr/bin/env node
/*
 * terapkan-perbaikan.cjs
 * Patch otomatis untuk dua bug:
 * 1) src/lib/auth.js: useAuth dibuat tahan terhadap sesi yang terbaca kosong sesaat,
 *    sehingga tombol Dashboard tidak hilang lagi tanpa refresh.
 * 2) src/components/ui.jsx dan src/index.css: aturan header sticky dibatasi ke
 *    kelas modal-detail supaya sudut membulat ConfirmModal tidak tertutup kotak putih.
 *
 * Cara pakai dari root project:
 *   node terapkan-perbaikan.cjs
 * Tambahkan --dry-run untuk melihat rencana tanpa menulis file:
 *   node terapkan-perbaikan.cjs --dry-run
 *
 * Script ini idempoten: jika suatu perbaikan sudah ada, target dilewati tanpa error.
 */
const fs = require('fs')
const path = require('path')

const ROOT = process.cwd()
const DRY = process.argv.indexOf('--dry-run') !== -1

const TARGET = {
  auth: path.join(ROOT, 'src', 'lib', 'auth.js'),
  ui: path.join(ROOT, 'src', 'components', 'ui.jsx'),
  css: path.join(ROOT, 'src', 'index.css')
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

const laporan = []

function catat(nama, status, pesan) {
  laporan.push({ nama: nama, status: status })
  const ikon = status === 'ok' ? '[DIPATCH]' : (status === 'lewati' ? '[SUDAH ADA]' : '[GAGAL]')
  console.log(ikon + ' ' + nama + (pesan ? ' : ' + pesan : ''))
}

function tulis(rel, isi) {
  if (!DRY) fs.writeFileSync(rel, isi, 'utf8')
}

function patchAuth() {
  const nama = 'src/lib/auth.js'
  if (!fs.existsSync(TARGET.auth)) return catat(nama, 'gagal', 'file tidak ditemukan')
  const isi = fs.readFileSync(TARGET.auth, 'utf8')
  if (isi.indexOf('function sinkronkan(') !== -1 && isi.indexOf('cariMahasiswa') !== -1) {
    return catat(nama, 'lewati', 'perbaikan auth sudah diterapkan sebelumnya')
  }
  const idx = isi.indexOf('export function useAuth()')
  if (idx === -1) return catat(nama, 'gagal', 'penanda export function useAuth tidak ditemukan')
  tulis(TARGET.auth, isi.slice(0, idx) + USE_AUTH_BARU)
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
  if (isi.indexOf(penanda) === -1) {
    return catat(nama, 'gagal', 'penanda panel Modal tidak ditemukan')
  }
  tulis(TARGET.ui, isi.split(penanda).join('anim-modal modal-detail w-full max-w-3xl'))
  catat(nama, 'ok', 'panel Modal detail diberi kelas modal-detail')
}

function patchCss() {
  const nama = 'src/index.css'
  if (!fs.existsSync(TARGET.css)) return catat(nama, 'gagal', 'file tidak ditemukan')
  const isi = fs.readFileSync(TARGET.css, 'utf8')
  if (isi.indexOf('.modal-detail > div:first-child') !== -1) {
    return catat(nama, 'lewati', 'selector modal-detail sudah ada')
  }
  const a = '.anim-modal > div:first-child {'
  const b = '.anim-modal > * + * {'
  if (isi.indexOf(a) === -1 || isi.indexOf(b) === -1) {
    return catat(nama, 'gagal', 'selector header sticky tidak ditemukan')
  }
  let baru = isi.split(a).join('.modal-detail > div:first-child {')
  baru = baru.split(b).join('.modal-detail > * + * {')
  tulis(TARGET.css, baru)
  catat(nama, 'ok', 'aturan header sticky dibatasi ke .modal-detail')
}

console.log('Mode: ' + (DRY ? 'dry run, tidak ada file yang ditulis' : 'patch langsung ke file'))
console.log('')

patchAuth()
patchUi()
patchCss()

const gagal = laporan.filter(function (l) { return l.status === 'gagal' })
console.log('')
console.log('Ringkasan: ' + (laporan.length - gagal.length) + ' dari ' + laporan.length + ' target beres.')
if (gagal.length) {
  console.log('Ada target yang gagal. Periksa pesan di atas, jangan commit dulu sebelum beres.')
  process.exit(1)
}
if (DRY) {
  console.log('Dry run selesai. Jalankan tanpa --dry-run untuk menulis perubahan.')
} else {
  console.log('Semua perbaikan diterapkan. Jalankan npm run dev lalu cek modal hapus dan perilaku login.')
}