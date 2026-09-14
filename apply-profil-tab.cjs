const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DashboardPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai menata ulang foto profil dan menambah tab Profil...')
console.log('')

/* ===== 1. Pindahkan section Foto Profil menjadi konten tab Profil ===== */
const idxFoto = d.indexOf('>Foto Profil<')
if (idxFoto === -1) {
  console.log('[TIDAK KETEMU] Section Foto Profil di DashboardPage')
} else if (d.includes("{tab === 'profil' ? (")) {
  console.log('[SUDAH ADA] Section Foto Profil sudah berada di tab Profil')
} else {
  const mulaiBlok = d.lastIndexOf('<section', idxFoto)
  const akhirBlok = d.indexOf('</section>', idxFoto) + '</section>'.length
  const blok = d.slice(mulaiBlok, akhirBlok)
  const sisa = d.slice(0, mulaiBlok) + d.slice(akhirBlok)
  d = sisa.slice(0, mulaiBlok) + "{tab === 'profil' ? (\n" + blok + "\n) : null}\n" + sisa.slice(mulaiBlok)
  console.log('[BERHASIL] Section Foto Profil kini hanya tampil pada tab Profil')
}

/* ===== 2. Header card: Avatar di kiri teks plus tombol tab Profil ===== */
const idxHeader = d.indexOf('Dashboard mahasiswa')
if (idxHeader === -1) {
  console.log('[TIDAK KETEMU] Teks Dashboard mahasiswa pada header')
} else {
  const sectionStart = d.lastIndexOf('<section', idxHeader)
  const sectionEnd = d.indexOf('</section>', idxHeader)
  let header = d.slice(sectionStart, sectionEnd)

  if (header.includes('<Avatar src={mahasiswa.foto_profil')) {
    console.log('[SUDAH ADA] Avatar pada kartu header')
  } else {
    header = header.replace(
      /(<p[^>]*>Dashboard mahasiswa<\/p>)/,
      `<div className="flex flex-wrap items-center gap-6">
<Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" />
<div className="min-w-0 flex-1">
$1`
    )
    header = header.replace(
      /(<div[^>]*>\s*<button onClick=\{function \(\) \{ setTab\('logbook'\) \}\})/,
      '</div>\n$1'
    )
    header = header + '\n</div>'
    console.log('[BERHASIL] Avatar dipasang di kiri teks kartu header')
  }

  if (header.includes("setTab('profil')")) {
    console.log('[SUDAH ADA] Tombol tab Profil')
  } else {
    header = header.replace(
      /(<button onClick=\{function \(\) \{ setTab\('absen'\) \}\} className=\{tabCls\('absen'\)\}>Daftar Hadir<\/button>)/,
      `$1
<button onClick={function () { setTab('profil') }} className={tabCls('profil')}>Profil</button>`
    )
    console.log('[BERHASIL] Tombol tab Profil ditambahkan setelah Daftar Hadir')
  }

  d = d.slice(0, sectionStart) + header + d.slice(sectionEnd)
}

fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Kartu header dashboard menampilkan foto profil bulat di sebelah kiri nama, NIM, dan prodi.')
console.log('2. Mahasiswa tanpa foto tetap melihat inisial berwarna tema pada posisi yang sama.')
console.log('3. Tombol tab baru bernama Profil muncul di sebelah Daftar Hadir.')
console.log('4. Form upload, ganti, dan hapus foto hanya tampil saat tab Profil dibuka, sehingga halaman utama tetap lega.')
console.log('5. Setelah foto disimpan, avatar di header langsung berubah tanpa reload karena state mahasiswa diperbarui.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard: avatar muncul di kiri teks header dan section foto tidak lagi memenuhi halaman.')
console.log('2. Klik tab Profil: form upload foto muncul lengkap dengan pratinjau dan tombol simpan.')
console.log('3. Upload atau ganti foto, lalu kembali ke tab Logbook: avatar header sudah memakai foto baru.')
console.log('4. Hapus foto dari tab Profil: avatar header kembali ke inisial berwarna tema.')