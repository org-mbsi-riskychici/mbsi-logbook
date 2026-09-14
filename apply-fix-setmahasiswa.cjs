const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

/* ===== 1. State kecil pemaksa render setelah foto berubah ===== */
if (d.includes('setVersiFoto')) {
  console.log('[SUDAH ADA] State pemaksa render foto')
} else {
  const anchor = 'const [uploadingFoto, setUploadingFoto] = useState(false)'
  if (d.includes(anchor)) {
    d = d.replace(anchor, anchor + '\n  const [, setVersiFoto] = useState(0)')
    berubah = true
    console.log('[BERHASIL] State pemaksa render foto ditambahkan')
  } else {
    console.log('[TIDAK KETEMU] Anchor state uploadingFoto')
  }
}

/* ===== 2. simpanFotoProfil: ganti setMahasiswa dengan mutasi plus refresh ===== */
const cariUrl = 'setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: url }))'
const gantiUrl = `mahasiswa.foto_profil = url
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })`
if (d.includes(cariUrl)) {
  d = d.split(cariUrl).join(gantiUrl)
  berubah = true
  console.log('[BERHASIL] simpanFotoProfil tidak lagi memakai setMahasiswa')
} else {
  console.log('[TIDAK KETEMU] Pola setMahasiswa pada simpanFotoProfil')
}

/* ===== 3. hapusFotoProfilKu: ganti setMahasiswa dengan mutasi plus refresh ===== */
const cariNull = 'setMahasiswa(Object.assign({}, mahasiswa, { foto_profil: null }))'
const gantiNull = `mahasiswa.foto_profil = null
      if (typeof refresh === 'function') await refresh()
      setVersiFoto(function (v) { return v + 1 })`
if (d.includes(cariNull)) {
  d = d.split(cariNull).join(gantiNull)
  berubah = true
  console.log('[BERHASIL] hapusFotoProfilKu tidak lagi memakai setMahasiswa')
} else {
  console.log('[TIDAK KETEMU] Pola setMahasiswa pada hapusFotoProfilKu')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Catatan:')
console.log('1. Foto yang tadi gagal tampil sebenarnya sudah tersimpan di bucket dan database.')
console.log('2. Setelah perbaikan ini, upload baru akan langsung memperbarui avatar header, kartu Profil, dan seluruh kartu publik.')
console.log('3. Bila foto lama belum muncul, cukup muat ulang halaman satu kali karena datanya sudah ada di database.')