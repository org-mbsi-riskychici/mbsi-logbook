const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

function semua(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.split(cari).join(ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function sisip(rel, cari, ganti, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(ganti)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label); return }
  isi = isi.replace(cari, ganti)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function tambah(rel, marker, blok, label) {
  if (!fs.existsSync(path.join(root, rel))) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  if (isi.includes(marker)) { console.log('[SUDAH ADA] ' + label); return }
  isi = isi.trimEnd() + '\n\n' + blok
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai menetralkan sebutan YouTube dan memasang animasi titik...')
console.log('')

/* ===== 1. index.css: animasi titik halus ===== */
tambah('src/index.css', '.titik-anim', `.titik-anim {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-left: 6px;
}
.titik-anim i {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: currentColor;
  opacity: 0.2;
  animation: titik-halus 1.1s ease-in-out infinite;
}
.titik-anim i:nth-child(2) { animation-delay: 0.18s; }
.titik-anim i:nth-child(3) { animation-delay: 0.36s; }
@keyframes titik-halus {
  0%, 60%, 100% { opacity: 0.2; transform: translateY(0) scale(0.9); }
  30% { opacity: 1; transform: translateY(-1px) scale(1); }
}`, 'CSS animasi titik di index.css')

/* ===== 2. ui.jsx: komponen TitikAnim dan LabelProses ===== */
tambah('src/components/ui.jsx', 'export function LabelProses', `export function TitikAnim() {
  return (
    <span className="titik-anim" aria-hidden="true">
      <i></i>
      <i></i>
      <i></i>
    </span>
  )
}
export function LabelProses(props) {
  const bersih = String(props.teks || '').replace(/\\.{3}/g, '').replace(/\\s+/g, ' ').trim()
  return (
    <span className="inline-flex items-center justify-center">
      <span>{bersih}</span>
      <TitikAnim />
    </span>
  )
}`, 'Komponen TitikAnim dan LabelProses di ui.jsx')

/* ===== 3. ui.jsx: netralkan placeholder pratinjau dan pemutar ===== */
semua('src/components/ui.jsx', `<SizedIcon name="youtube" size={26} />`, `<SizedIcon name="video" size={26} />`, 'Ikon placeholder pratinjau menjadi ikon video')
semua('src/components/ui.jsx', `Menyiapkan thumbnail YouTube...`, `Menyiapkan pratinjau video`, 'Teks placeholder pratinjau dinetralkan')
semua('src/components/ui.jsx', `Thumbnail belum siap di YouTube`, `Pratinjau video belum siap`, 'Teks placeholder permanen dinetralkan')
semua('src/components/ui.jsx', `alt={props.alt || 'Thumbnail YouTube'}`, `alt={props.alt || 'Pratinjau video'}`, 'Alt text pratinjau dinetralkan')
semua('src/components/ui.jsx', `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId}`, `src={'https://www.youtube-nocookie.com/embed/' + props.youtubeId + '?rel=0&modestbranding=1'}`, 'Pemutar lightbox meminimalkan merek')

/* ===== 4. cards.jsx: minimalkan merek pada embed detail ===== */
semua('src/components/cards.jsx', `embed/' + it.youtube_id}`, `embed/' + it.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail logbook meminimalkan merek')
semua('src/components/cards.jsx', `embed/' + item.youtube_id}`, `embed/' + item.youtube_id + '?rel=0&modestbranding=1'}`, 'Embed detail galeri meminimalkan merek')

/* ===== 5. youtube.js: netralkan pesan error ===== */
semua('src/lib/youtube.js', `Upload YouTube gagal (status `, `Upload video gagal (status `, 'Pesan gagal upload dinetralkan')
semua('src/lib/youtube.js', `Jaringan gagal saat upload YouTube`, `Jaringan gagal saat upload video`, 'Pesan jaringan dinetralkan')
semua('src/lib/youtube.js', `Video kemungkinan sudah masuk channel; tempel link YouTube secara manual.`, `Video kemungkinan sudah tersimpan; tempel link video secara manual.`, 'Pesan pemulihan dinetralkan')
semua('src/lib/youtube.js', `Gagal membuat sesi YouTube`, `Gagal memulai sesi upload video`, 'Pesan sesi dinetralkan')

/* ===== 6. upload.js: netralkan teks konversi ===== */
semua('src/lib/upload.js', `Mengonversi foto ke WebP...`, `Mengonversi foto`, 'Teks konversi foto dinetralkan')

/* ===== 7. DashboardPage: import LabelProses ===== */
sisip('src/pages/DashboardPage.jsx',
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'`,
  `import { pratinjauHeic, formatHeic } from '../lib/konversi.js'
import { LabelProses } from '../components/ui.jsx'`,
  'Import LabelProses di DashboardPage')

/* ===== 8. DashboardPage: netralkan semua teks YouTube ===== */
semua('src/pages/DashboardPage.jsx', `Sisa kuota upload YouTube hari ini:`, `Sisa kuota upload video hari ini:`, 'Label kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Atau tempel link YouTube (unlisted)`, `Atau tempel link video eksternal`, 'Placeholder link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota habis. Gunakan link YouTube di bawah.`, `Kuota habis. Gunakan link video di bawah.`, 'Peringatan kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Kuota upload YouTube hari ini sudah habis. Gunakan link YouTube.`, `Kuota upload video hari ini sudah habis. Gunakan link video.`, 'Alert kuota dinetralkan')
semua('src/pages/DashboardPage.jsx', `Link YouTube tidak valid`, `Link video tidak valid`, 'Alert link dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah ke YouTube... ' + Math.round(p * 100) + '%'`, `Mengunggah video ' + Math.round(p * 100) + '%'`, 'Progres upload video dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengunggah... ' + Math.round(p * 100) + '%'`, `Mengunggah ' + Math.round(p * 100) + '%'`, 'Progres upload R2 tanpa titik statis')
semua('src/pages/DashboardPage.jsx', `Mengonversi HEIC ke JPG...`, `Mengonversi foto HEIC`, 'Teks konversi HEIC dinetralkan')
semua('src/pages/DashboardPage.jsx', `Mengonversi pratinjau HEIC...`, `Mengonversi pratinjau`, 'Teks pratinjau HEIC dinetralkan')

/* ===== 9. DashboardPage: tombol proses memakai animasi titik ===== */
semua('src/pages/DashboardPage.jsx', `{busy ? (infoProses || 'Menyimpan...') :`, `{busy ? <LabelProses teks={infoProses || 'Menyimpan'} /> :`, 'Tombol simpan logbook dan galeri beranimasi titik')
semua('src/pages/DashboardPage.jsx', `{busy ? 'Menyimpan...' :`, `{busy ? <LabelProses teks="Menyimpan" /> :`, 'Tombol simpan lainnya beranimasi titik')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil yang akan terlihat:')
console.log('1. Tidak ada lagi kata YouTube pada label kuota, placeholder link, peringatan, maupun progres.')
console.log('2. Placeholder pratinjau video memakai ikon video umum, bukan ikon YouTube.')
console.log('3. Tombol sibuk menampilkan tiga titik kecil yang memudar dan naik turun secara halus dan berurutan.')
console.log('4. Progres persen tetap tampil, misalnya Mengunggah 43 persen, diikuti titik beranimasi.')
console.log('5. Pemutar embed memakai parameter modestbranding dan rel=0 untuk meminimalkan merek bawaan.')