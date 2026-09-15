const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai merapikan dashboard mobile: avatar proporsional, tombol tambah kegiatan ramping, teks pilih file sesuai konteks...')
console.log('')

/* ===== 1. index.css: avatar header dashboard mengecil proporsional di layar sempit ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
const CSS_BLOK = `/* kepala-dash-responsif: avatar header dashboard mengecil proporsional di layar sempit, desktop tetap 96px */
@media (max-width: 639px) {
  .avatar-kepala-dash > button, .avatar-kepala-dash > span {
    width: 56px !important;
    height: 56px !important;
    border-radius: 16px !important;
  }
  .avatar-kepala-dash img { border-radius: 16px !important; }
  .avatar-kepala-dash > button > span, .avatar-kepala-dash > span > span {
    font-size: 20px !important;
  }
}
`
if (css.includes('kepala-dash-responsif')) {
  console.log('[SUDAH ADA] CSS kepala-dash-responsif di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
  console.log('[BERHASIL] CSS avatar responsif ditambahkan di index.css')
}

/* ===== 2. controls.jsx: FileInput menerima label kustom ===== */
const FILE_C = 'src/components/controls.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] controls.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
const TEKS_LAMA = "{props.fileName || 'Klik untuk pilih foto atau video'}"
const TEKS_BARU = "{props.fileName || props.label || 'Klik untuk pilih foto atau video'}"
if (c.includes('props.label ||')) {
  console.log('[SUDAH ADA] Dukungan label kustom pada FileInput')
} else if (c.includes(TEKS_LAMA)) {
  c = c.replace(TEKS_LAMA, TEKS_BARU)
  simpan(FILE_C, c)
  console.log('[BERHASIL] FileInput kini menerima prop label untuk teks konteks foto atau video')
} else {
  console.log('[TIDAK KETEMU] Pola teks default FileInput di controls.jsx')
}

/* ===== 3. DashboardPage.jsx: bungkus avatar, rapikan tombol tambah kegiatan, teks file sesuai mode ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

/* 3a. Bungkus avatar header dengan kelas responsif */
const reAvatar = /<Avatar src=\{mahasiswa\.foto_profil \|\| null\} nama=\{mahasiswa\.nama\} size="xl"\s+onClick=\{function \(\) \{ gantiTab\('profil'\) \}\} title="Kelola foto profil" \/>/
if (d.includes('avatar-kepala-dash')) {
  console.log('[SUDAH ADA] Pembungkus avatar-kepala-dash')
} else if (reAvatar.test(d)) {
  d = d.replace(reAvatar, '<div className="avatar-kepala-dash"><Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="xl" onClick={function () { gantiTab(\'profil\') }} title="Kelola foto profil" /></div>')
  berubahD = true
  console.log('[BERHASIL] Avatar header dashboard dibungkus kelas responsif')
} else {
  console.log('[TIDAK KETEMU] Pola Avatar header dashboard')
}

/* 3b. Baris tombol tambah kegiatan: flex wrap plus tombol satu baris */
const reTambah = /([ \t]*)<div className="flex items-center justify-between">\n[ \t]*<p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">\*<\/span><\/p>\n[ \t]*<button type="button" onClick=\{function \(\) \{ setItems\(function \(p\) \{ return p\.concat\(\[newItem\(\)\]\) \}\) \}\} className=\{btnSmall \+ ' bg-bsi-100 text-bsi-900 hover:bg-bsi-200'\}>\+ Tambah kegiatan<\/button>\n[ \t]*<\/div>/
if (d.includes('whitespace-nowrap shrink-0 bg-bsi-100')) {
  console.log('[SUDAH ADA] Tombol tambah kegiatan versi ramping')
} else if (reTambah.test(d)) {
  d = d.replace(reTambah, function (match, ind) {
    const BLOK = `<div className="flex flex-wrap items-center justify-between gap-2">
<p className="text-sm font-semibold text-slate-700">Rincian kegiatan hari ini <span className="text-red-500">*</span></p>
<button type="button" onClick={function () { setItems(function (p) { return p.concat([newItem()]) }) }} className={btnSmall + ' whitespace-nowrap shrink-0 bg-bsi-100 text-bsi-900 hover:bg-bsi-200'}>+ Tambah kegiatan</button>
</div>`
    return BLOK.split('\n').map(function (l) { return l.length ? ind + l : l }).join('\n')
  })
  berubahD = true
  console.log('[BERHASIL] Baris tambah kegiatan memakai flex wrap dan tombol satu baris')
} else {
  console.log('[TIDAK KETEMU] Pola baris tombol tambah kegiatan')
}

/* 3c. Teks FileInput sesuai konteks foto atau video */
const pasanganFile = [
  ['accept="video/*" fileName={it.file ? it.file.name : \'\' }', null],
]
const gantiFile = [
  {
    lama: 'accept="video/*" fileName={it.file ? it.file.name : \'\'}',
    baru: 'accept="video/*" fileName={it.file ? it.file.name : \'\'} label="Klik untuk pilih video" hint="Video maks 50 MB. Format MP4, MOV, WebM, atau MKV."'
  },
  {
    lama: 'accept="image/*" fileName={it.file ? it.file.name : \'\'}',
    baru: 'accept="image/*" fileName={it.file ? it.file.name : \'\'} label="Klik untuk pilih foto" hint="Foto JPG, PNG, atau HEIC otomatis dikonversi ke WebP ringan."'
  },
  {
    lama: 'accept="video/*" fileName={galForm.file ? galForm.file.name : \'\'}',
    baru: 'accept="video/*" fileName={galForm.file ? galForm.file.name : \'\'} label="Klik untuk pilih video" hint="Video maks 50 MB. Format MP4, MOV, WebM, atau MKV."'
  },
  {
    lama: 'accept="image/*" fileName={galForm.file ? galForm.file.name : \'\'}',
    baru: 'accept="image/*" fileName={galForm.file ? galForm.file.name : \'\'} label="Klik untuk pilih foto" hint="Foto JPG, PNG, atau HEIC otomatis dikonversi ke WebP ringan."'
  }
]
let jumlahFile = 0
for (let i = 0; i < gantiFile.length; i++) {
  if (d.includes(gantiFile[i].baru)) { jumlahFile++; continue }
  if (d.includes(gantiFile[i].lama)) {
    d = d.replace(gantiFile[i].lama, gantiFile[i].baru)
    jumlahFile++
    berubahD = true
  }
}
console.log(jumlahFile === 4 ? '[BERHASIL] Empat FileInput memakai teks sesuai konteks foto atau video' : '[INFO] FileInput menyesuaikan: ' + jumlahFile + ' dari 4 lokasi')

if (berubahD) simpan(FILE_D, d)

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
const k2 = baca(FILE_C)
const d2 = baca(FILE_D)
console.log((c2.includes('kepala-dash-responsif') ? '[OK] ' : '[BELUM] ') + 'CSS avatar responsif tersedia')
console.log((d2.includes('avatar-kepala-dash') ? '[OK] ' : '[BELUM] ') + 'Avatar header dashboard dibungkus kelas responsif')
console.log((d2.includes('whitespace-nowrap shrink-0 bg-bsi-100') ? '[OK] ' : '[BELUM] ') + 'Tombol tambah kegiatan satu baris dan tidak melebar')
console.log((k2.includes('props.label ||') ? '[OK] ' : '[BELUM] ') + 'FileInput mendukung label kustom')
console.log((d2.split('label="Klik untuk pilih video"').length - 1 === 2 ? '[OK] ' : '[BELUM] ') + 'Dua pemilih video memakai teks video')
console.log((d2.split('label="Klik untuk pilih foto"').length - 1 === 2 ? '[OK] ' : '[BELUM] ') + 'Dua pemilih foto memakai teks foto')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyesuaian yang diterapkan:')
console.log('1. Avatar header dashboard dibungkus kelas avatar-kepala-dash. Di bawah 640 piksel ukurannya dipangkas dari 96 menjadi 56 piksel dengan radius 16 piksel dan ukuran inisial yang ikut mengecil, sehingga kepala kartu tidak lagi didominasi foto besar. Di 640 piksel ke atas tidak ada aturan yang aktif, jadi tampilan desktop tetap 96 piksel seperti semula.')
console.log('2. Baris label Rincian kegiatan hari ini dan tombol tambah kegiatan kini memakai flex wrap dengan gap, dan tombolnya diberi whitespace-nowrap plus shrink-0. Hasilnya di layar sempit tombol turun sendiri ke baris kedua sebagai pill satu baris yang ramping, bukan blok hijau tinggi dengan teks terlipat seperti lampiran.')
console.log('3. FileInput menerima prop label, dan keempat pemakainya kini berbicara sesuai konteks: mode video menyapa Klik untuk pilih video dengan hint format video dan batas 50 MB, mode foto menyapa Klik untuk pilih foto dengan hint konversi JPG PNG HEIC ke WebP. Tidak ada lagi teks campur foto atau video pada konteks tunggal.')
console.log('4. Nama file yang sudah dipilih tetap menang atas label, sehingga setelah user memilih file yang tampil adalah nama filenya seperti sebelumnya.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard di ponsel: foto profil di kartu header kini seukuran avatar besar yang proporsional berdampingan dengan nama, tidak mendominasi sepertiga kartu.')
console.log('2. Gulir ke form logbook: tombol + Tambah kegiatan tampil sebagai pill satu baris di bawah label, tidak lagi melebar dan bertingkat dua baris.')
console.log('3. Pada kegiatan mode Foto: kotak putus putus berbunyi Klik untuk pilih foto dengan hint konversi WebP.')
console.log('4. Ganti kegiatan ke mode Video: kotak berubah berbunyi Klik untuk pilih video dengan hint batas 50 MB.')
console.log('5. Ulangi pada form galeri untuk kedua mode: teks ikut berubah sesuai jenis media.')
console.log('6. Buka dashboard di desktop: avatar header tetap besar 96 piksel dan seluruh tata letak tidak berubah.')