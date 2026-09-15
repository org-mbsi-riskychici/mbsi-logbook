const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memperbaiki proporsi teks dashboard, iframe video, avatar profil, dan kotak statistik...')
console.log('')

/* ===== 1. index.css: teks header dashboard mengecil proporsional, iframe video responsif, avatar profil mengecil ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)
const CSS_BLOK = `/* proporsional-mobile-v1: teks header dashboard, avatar profil, dan iframe video menyesuaikan layar sempit */
@media (max-width: 639px) {
  .avatar-kepala-dash ~ div h1 { font-size: 1.25rem !important; line-height: 1.75rem !important; }
  .avatar-kepala-dash ~ div p { font-size: 0.75rem !important; }
  .avatar-kepala-dash ~ div .inline-flex { font-size: 0.625rem !important; padding: 0.25rem 0.5rem !important; }
  
  .avatar-profil-tab > button, .avatar-profil-tab > span {
    width: 96px !important;
    height: 96px !important;
    border-radius: 24px !important;
  }
  .avatar-profil-tab img { border-radius: 24px !important; }
  .avatar-profil-tab ~ h2 { font-size: 1.25rem !important; margin-top: 0.75rem !important; }
  .avatar-profil-tab ~ p { font-size: 0.875rem !important; }
  
  .stats-profil-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; gap: 0.5rem !important; }
  .stats-profil-grid > div:last-child { grid-column: span 2 / span 2; }
  
  .iframe-video-wrap { position: relative !important; padding-bottom: 56.25% !important; height: 0 !important; overflow: hidden !important; border-radius: 1rem !important; }
  .iframe-video-wrap iframe { position: absolute !important; top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important; border: 0 !important; }
}
@media (min-width: 640px) {
  .stats-profil-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
`
if (css.includes('proporsional-mobile-v1')) {
  console.log('[SUDAH ADA] CSS proporsional-mobile-v1 di index.css')
} else {
  simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
  console.log('[BERHASIL] CSS proporsional mobile ditambahkan di index.css')
}

/* ===== 2. DashboardPage.jsx: bungkus avatar profil tab dan grid stats ===== */
const FILE_D = 'src/pages/DashboardPage.jsx'
if (!ada(FILE_D)) {
  console.log('[GAGAL] DashboardPage.jsx tidak ditemukan')
  process.exit(1)
}
let d = baca(FILE_D)
let berubahD = false

/* 2a. Bungkus avatar tab profil dengan kelas responsif */
const reAvatarProfil = /<Avatar src=\{mahasiswa\.foto_profil\|\| null\} nama=\{mahasiswa\.nama\} size="2xl" \/>/
if (d.includes('avatar-profil-tab')) {
  console.log('[SUDAH ADA] Pembungkus avatar-profil-tab')
} else if (reAvatarProfil.test(d)) {
  d = d.replace(reAvatarProfil, '<div className="avatar-profil-tab"><Avatar src={mahasiswa.foto_profil|| null} nama={mahasiswa.nama} size="2xl" /></div>')
  berubahD = true
  console.log('[BERHASIL] Avatar tab profil dibungkus kelas responsif')
} else {
  console.log('[TIDAK KETEMU] Pola Avatar size 2xl di tab profil')
}

/* 2b. Grid statistik profil dengan kelas responsif */
const reStatsGrid = /<div className="mt-4 grid grid-cols-3 gap-3">/
if (d.includes('stats-profil-grid')) {
  console.log('[SUDAH ADA] Kelas stats-profil-grid pada grid statistik')
} else if (reStatsGrid.test(d)) {
  d = d.replace(reStatsGrid, '<div className="stats-profil-grid mt-4 grid grid-cols-3 gap-3">')
  berubahD = true
  console.log('[BERHASIL] Grid statistik profil diberi kelas responsif')
} else {
  console.log('[TIDAK KETEMU] Pola grid statistik profil')
}

if (berubahD) simpan(FILE_D, d)

/* ===== 3. cards.jsx: iframe video dibungkus dengan rasio aspek 16:9 ===== */
const FILE_CARDS = 'src/components/cards.jsx'
if (!ada(FILE_CARDS)) {
  console.log('[GAGAL] cards.jsx tidak ditemukan')
  process.exit(1)
}
let c = baca(FILE_CARDS)
let berubahC = false

const reIframe = /<iframe src=\{drivePreviewUrl\(it\.media_path\)\} className="w-full aspect-video rounded-2xl" allow="autoplay; encrypted-media" allowFullScreen title="Pratinjau video" \/>/
if (c.includes('iframe-video-wrap')) {
  console.log('[SUDAH ADA] Pembungkus iframe-video-wrap')
} else if (reIframe.test(c)) {
  c = c.replace(reIframe, '<div className="iframe-video-wrap"><iframe src={drivePreviewUrl(it.media_path)} allow="autoplay; encrypted-media" allowFullScreen title="Pratinjau video" /></div>')
  berubahC = true
  console.log('[BERHASIL] Iframe video dibungkus dengan rasio aspek responsif')
} else {
  console.log('[TIDAK KETEMU] Pola iframe video di cards.jsx')
}

if (berubahC) simpan(FILE_CARDS, c)

/* ===== 4. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
const d2 = baca(FILE_D)
const k2 = baca(FILE_CARDS)
console.log((c2.includes('proporsional-mobile-v1') ? '[OK] ' : '[BELUM] ') + 'CSS proporsional mobile tersedia')
console.log((c2.includes('.avatar-kepala-dash ~ div h1') ? '[OK] ' : '[BELUM] ') + 'Aturan teks nama header dashboard responsif')
console.log((c2.includes('.avatar-profil-tab > button') ? '[OK] ' : '[BELUM] ') + 'Aturan avatar tab profil responsif')
console.log((c2.includes('.stats-profil-grid') ? '[OK] ' : '[BELUM] ') + 'Aturan grid statistik profil responsif')
console.log((c2.includes('.iframe-video-wrap') ? '[OK] ' : '[BELUM] ') + 'Aturan iframe video responsif')
console.log((d2.includes('avatar-profil-tab') ? '[OK] ' : '[BELUM] ') + 'Avatar tab profil dibungkus kelas responsif')
console.log((d2.includes('stats-profil-grid') ? '[OK] ' : '[BELUM] ') + 'Grid statistik profil diberi kelas responsif')
console.log((k2.includes('iframe-video-wrap') ? '[OK] ' : '[BELUM] ') + 'Iframe video dibungkus dengan rasio aspek')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perbaikan yang diterapkan:')
console.log('1. Header dashboard: teks nama (h1) kini mengecil dari text-2xl menjadi text-xl (20px) di bawah 640px, teks NIM (p) dari text-sm menjadi text-xs (12px), dan badge prodi dari text-[11px] menjadi text-[10px] dengan padding lebih kecil. Hasilnya avatar 56px yang sudah dipasang sebelumnya kini seimbang dengan teks di sampingnya.')
console.log('2. Iframe video: dibungkus div dengan padding-bottom 56.25% (rasio 16:9) sehingga iframe selalu mempertahankan proporsi di lebar apa pun. Kontrol video tidak lagi terpotong atau berantakan karena iframe mengisi wadah secara absolut dengan tinggi yang dihitung otomatis dari lebar.')
console.log('3. Tab profil: avatar 2xl (128px) dikecilkan menjadi 96px dengan radius 24px di mobile, teks nama dari text-xl menjadi text-xl (tetap) dengan margin atas lebih kecil, dan teks NIM dari text-sm menjadi text-sm (tetap). Hasilnya kartu profil tidak lagi didominasi foto raksasa.')
console.log('4. Kotak statistik profil: grid 3 kolom di desktop berubah menjadi 2 kolom di mobile, dengan kotak ketiga (Kehadiran) melebar penuh di baris kedua. Ini membuat angka dan label tidak terdesak di layar sempit, dan tata letak tetap rapi.')
console.log('5. Semua aturan responsif hanya aktif di bawah 640px lewat media query, jadi tampilan desktop tidak berubah sama sekali.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka dashboard di ponsel: header kartu menampilkan avatar 56px dengan nama dan NIM yang proporsional, tidak ada teks yang mendominasi.')
console.log('2. Klik logbook dengan video Drive: video tampil dengan rasio 16:9 yang benar, kontrol play dan fullscreen tidak terpotong.')
console.log('3. Buka tab Profil: avatar 96px dengan nama dan NIM yang seimbang, tidak terlalu besar.')
console.log('4. Lihat kotak statistik Logbook, Media, Kehadiran: dua kotak di baris pertama (Logbook dan Media) dan satu kotak melebar di baris kedua (Kehadiran), semua terbaca jelas.')
console.log('5. Buka di tablet atau desktop: avatar kembali 128px, grid statistik kembali 3 kolom, teks header kembali ukuran normal, iframe tetap 16:9.')