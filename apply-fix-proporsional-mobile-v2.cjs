const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai perbaikan lanjutan: avatar profil, grid statistik, pembungkus iframe, dan kontrol pemutar video di layar sempit...')
console.log('')

/* ===== 1. DashboardPage.jsx: bungkus avatar 2xl dan beri kelas grid statistik ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

const reAvatar = /<Avatar src=\{mahasiswa\.foto_profil\s*\|\|\s*null\} nama=\{mahasiswa\.nama\} size="2xl"\s*\/>/
if (d.includes('avatar-profil-tab')) {
  console.log('[SUDAH ADA] Pembungkus avatar-profil-tab')
} else if (reAvatar.test(d)) {
  d = d.replace(reAvatar, '<div className="avatar-profil-tab"><Avatar src={mahasiswa.foto_profil || null} nama={mahasiswa.nama} size="2xl" /></div>')
  berubahD = true
  console.log('[BERHASIL] Avatar 2xl di tab profil dibungkus kelas responsif')
} else {
  console.log('[TIDAK KETEMU] Pola Avatar size 2xl di tab profil')
}

const reStats = /<div className="mt-4 grid grid-cols-3 gap-4">/
if (d.includes('stats-profil-grid')) {
  console.log('[SUDAH ADA] Kelas stats-profil-grid pada grid statistik')
} else if (reStats.test(d)) {
  d = d.replace(reStats, '<div className="stats-profil-grid mt-4 grid grid-cols-3 gap-4">')
  berubahD = true
  console.log('[BERHASIL] Grid statistik profil diberi kelas responsif')
} else {
  console.log('[TIDAK KETEMU] Pola grid statistik profil')
}

if (berubahD) simpan(FILE_D, d)

/* ===== 2. cards.jsx: bungkus iframe Drive dengan wadah rasio aspek ===== */
const FILE_C = 'src/components/cards.jsx'
if (!ada(FILE_C)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_C)
let berubahC = false

const reIframeLog = /<iframe key=\{it\.media_path\} src=\{drivePreviewUrl\(it\.media_path\)\} title=\{it\.judul\} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black mb-3"\s*\/>/
if (c.includes('iframe-video-wrap mb-3')) {
  console.log('[SUDAH ADA] Pembungkus iframe di LogbookDetail')
} else if (reIframeLog.test(c)) {
  c = c.replace(reIframeLog, '<div className="iframe-video-wrap mb-3"><iframe key={it.media_path} src={drivePreviewUrl(it.media_path)} title={it.judul} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black" /></div>')
  berubahC = true
  console.log('[BERHASIL] Iframe Drive di LogbookDetail dibungkus wadah rasio aspek')
} else {
  console.log('[TIDAK KETEMU] Pola iframe Drive di LogbookDetail')
}

const reIframeGal = /<iframe src=\{drivePreviewUrl\(item\.media_path\)\} title=\{item\.judul\} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black"\s*\/>/
if (c.includes('<div className="iframe-video-wrap"><iframe src={drivePreviewUrl(item.media_path)')) {
  console.log('[SUDAH ADA] Pembungkus iframe di GalleryDetail')
} else if (reIframeGal.test(c)) {
  c = c.replace(reIframeGal, '<div className="iframe-video-wrap"><iframe src={drivePreviewUrl(item.media_path)} title={item.judul} allow="autoplay; encrypted-media; fullscreen" allowFullScreen className="aspect-video w-full rounded-2xl border-0 bg-black" /></div>')
  berubahC = true
  console.log('[BERHASIL] Iframe Drive di GalleryDetail dibungkus wadah rasio aspek')
} else {
  console.log('[TIDAK KETEMU] Pola iframe Drive di GalleryDetail')
}

if (berubahC) simpan(FILE_C, c)

/* ===== 3. PemutarVideo.jsx: bar kontrol responsif supaya tidak terpotong di layar sempit ===== */
const FILE_P = 'src/components/PemutarVideo.jsx'
if (!ada(FILE_P)) {
  console.log('[GAGAL] PemutarVideo.jsx tidak ditemukan')
  process.exit(1)
}
let p = baca(FILE_P)
let berubahP = false

const BAR_LAMA = 'flex items-center gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pb-3 pt-10'
const BAR_BARU = 'flex items-center gap-2 sm:gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 sm:px-4 pb-3 pt-10'
if (p.includes(BAR_BARU)) {
  console.log('[SUDAH ADA] Bar kontrol versi responsif')
} else if (p.includes(BAR_LAMA)) {
  p = p.replace(BAR_LAMA, BAR_BARU)
  berubahP = true
  console.log('[BERHASIL] Bar kontrol diper rapat di layar sempit')
} else {
  console.log('[TIDAK KETEMU] Pola bar kontrol PemutarVideo')
}

const WAKTU_LAMA = 'className="min-w-[84px] shrink-0 text-center text-[11px] font-semibold tabular-nums text-slate-200"'
const WAKTU_BARU = 'className="min-w-[64px] sm:min-w-[84px] shrink-0 text-center text-[10px] sm:text-[11px] font-semibold tabular-nums text-slate-200"'
if (p.includes(WAKTU_BARU)) {
  console.log('[SUDAH ADA] Tampilan waktu versi ramping')
} else if (p.includes(WAKTU_LAMA)) {
  p = p.replace(WAKTU_LAMA, WAKTU_BARU)
  berubahP = true
  console.log('[BERHASIL] Tampilan waktu diperkecil di layar sempit')
} else {
  console.log('[TIDAK KETEMU] Pola tampilan waktu PemutarVideo')
}

const VOL_LAMA = 'className="pemutar-volume h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"'
const VOL_BARU = 'className="pemutar-volume hidden sm:block h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"'
if (p.includes(VOL_BARU)) {
    console.log('[SUDAH ADA] Slider volume disembunyikan di layar sempit')
} else if (p.includes(VOL_LAMA)) {
  p = p.replace(VOL_LAMA, VOL_BARU)
  berubahP = true
  console.log('[BERHASIL] Slider volume disembunyikan di bawah 640px supaya kontrol tidak terpotong')
} else {
  console.log('[TIDAK KETEMU] Pola slider volume PemutarVideo')
}

if (berubahP) simpan(FILE_P, p)

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const d2 = baca(FILE_D)
const c2 = baca(FILE_C)
const p2 = baca(FILE_P)
console.log((d2.includes('avatar-profil-tab') ? '[OK] ' : '[BELUM] ') + 'Avatar tab profil dibungkus kelas responsif')
console.log((d2.includes('stats-profil-grid') ? '[OK] ' : '[BELUM] ') + 'Grid statistik profil diberi kelas responsif')
console.log((c2.includes('iframe-video-wrap mb-3') ? '[OK] ' : '[BELUM] ') + 'Iframe Drive LogbookDetail dibungkus wadah rasio aspek')
console.log((c2.includes('<div className="iframe-video-wrap"><iframe src={drivePreviewUrl(item.media_path)') ? '[OK] ' : '[BELUM] ') + 'Iframe Drive GalleryDetail dibungkus wadah rasio aspek')
console.log((p2.includes(BAR_BARU) ? '[OK] ' : '[BELUM] ') + 'Bar kontrol pemutar video responsif')
console.log((p2.includes(VOL_BARU) ? '[OK] ' : '[BELUM] ') + 'Slider volume disembunyikan di layar sempit')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa script v1 gagal dan apa yang v2 perbaiki:')
console.log('1. Regex avatar v1 menulis foto_profil tanpa spasi sebelum pipa ganda, padahal file aslimu memakai spasi di kedua sisi. v2 memakai pola longgar sehingga cocok berapapun spasinya.')
console.log('2. Grid statistik v1 dicari dengan gap-3 padahal markup aslimu gap-4, jadi pengganti kelas tidak pernah menempel. v2 memakai pola yang benar.')
console.log('3. Pola iframe v1 menebak urutan atribut yang tidak pernah ada di cards.jsx. v2 membaca bentuk asli iframe Drive lengkap dengan atribut key, allow, dan kelasnya, lalu membungkusnya wadah iframe-video-wrap supaya CSS rasio aspek yang sudah terpasang di v1 akhirnya hidup.')
console.log('4. Penyebab asli kontrol berantakan pada lampiran gambar 2 bukanlah iframe Drive melainkan bar kontrol PemutarVideo: jumlah lebar minimum tombol putar, tampilan waktu 84px, tombol bisu, slider volume 64px, dan tombol layar penuh melebihi lebar modal di ponsel, sehingga slider volume terdorong keluar tepi dan progress bar menyusut menjadi titik.')
console.log('5. Kini di bawah 640px slider volume disembunyikan (tombol bisu tetap ada), tampilan waktu menyusut menjadi 64px dengan huruf lebih kecil, dan jarak antar kontrol serta padding bar dirapatkan, sehingga progress bar mendapat ruang lega dan seluruh kontrol utuh di dalam bingkai video.')
console.log('6. Di 640px ke atas semua kontrol kembali lengkap persis seperti sebelumnya, jadi pengalaman desktop tidak berubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard di ponsel lalu masuk tab Profil: foto profil kini 96px dengan nama dan NIM yang seimbang, tidak lagi mendominasi kartu.')
console.log('2. Lihat kotak Ringkasan aktivitas magang: Logbook dan Media berdampingan di baris pertama, Kehadiran melebar penuh di baris kedua, angka tidak terdesak.')
console.log('3. Buka detail logbook berisi video YouTube di ponsel: bar kontrol menampilkan putar, progress bar panjang, waktu, bisu, dan layar penuh tanpa ada yang terpotong keluar bingkai.')
console.log('4. Buka detail yang sama di desktop: slider volume kuning kembali muncul dan seluruh kontrol tampil lengkap seperti semula.')
console.log('5. Buka detail logbook atau galeri berisi video Google Drive: video tetap berasio 16 per 9 di semua lebar layar.')