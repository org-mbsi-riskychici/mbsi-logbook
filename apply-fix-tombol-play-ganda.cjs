const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghapus overlay tombol putar ganda saat video dijeda...')
console.log('')

const FILE_P = 'src/components/PemutarVideo.jsx'
if (!ada(FILE_P)) {
  console.log('[GAGAL] PemutarVideo.jsx tidak ditemukan')
  process.exit(1)
}

let p = baca(FILE_P)
const MARKER = '{/* Ikon putar besar milik kita saat dijeda'
const AKHIR = ') : null}'

if (p.indexOf(MARKER) === -1) {
  console.log('[SUDAH ADA] Overlay tombol putar jeda sudah tidak ada di PemutarVideo.jsx')
} else {
  const mulai = p.indexOf(MARKER)
  const akhir = p.indexOf(AKHIR, mulai)
  if (akhir === -1) {
    console.log('[TIDAK KETEMU] Penutup blok overlay jeda di PemutarVideo.jsx')
  } else {
    const batas = akhir + AKHIR.length
    /* ikut buang baris komentar dan sisa baris kosong supaya JSX tetap rapi */
    let dari = mulai
    while (dari > 0 && p[dari - 1] === ' ') dari--
    if (dari > 0 && p[dari - 1] === '\n') dari--
    let sampai = batas
    while (sampai < p.length && p[sampai] !== '\n') sampai++
    if (sampai < p.length) sampai++
    p = p.slice(0, dari) + p.slice(sampai)
    simpan(FILE_P, p)
    console.log('[BERHASIL] Overlay lingkaran putar besar saat jeda dihapus dari PemutarVideo.jsx')
  }
}

/* ===== Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const p2 = baca(FILE_P)
console.log((p2.indexOf(MARKER) === -1 ? '[OK] ' : '[BELUM] ') + 'Komentar overlay jeda sudah hilang')
console.log((p2.indexOf('h-20 w-20 place-items-center rounded-full bg-black/60') === -1 ? '[OK] ' : '[BELUM] ') + 'Lingkaran putar besar buatan sendiri sudah hilang')
console.log((p2.indexOf('dimulai && !selesai && !gagal ?') !== -1 ? '[OK] ' : '[BELUM] ') + 'Perisai penangkap klik untuk putar dan jeda tetap ada')
console.log((p2.indexOf('dimulai && !memutar && !buffer && !selesai && !gagal') === -1 ? '[OK] ' : '[BELUM] ') + 'Tidak ada lagi cabang render overlay jeda yang tersisa')
console.log((p2.indexOf('function IkonPlay(') !== -1 ? '[OK] ' : '[BELUM] ') + 'Komponen IkonPlay tetap tersedia untuk poster dan bar kontrol')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penyebab bug dan cara kerja perbaikan:')
console.log('1. Saat video YouTube dijeda, iframe menampilkan tombol putar bawaannya sendiri di tengah player. Di saat yang sama komponen kita juga merender lingkaran putar besar berlapis blur di atas iframe dengan maksud menutup ikon bawaan, tetapi keduanya justru tampil bertumpuk karena iframe berada di lapisan bawah dan ikon bawaan tetap terlihat menembus overlay.')
console.log('2. Mata user membaca tumpukan itu sebagai dua tombol putar, dengan lingkaran gelap besar milik kita sebagai yang paling depan, persis seperti lampiranmu.')
console.log('3. Isi iframe YouTube bersifat lintas origin sehingga tombol bawaannya tidak bisa disembunyikan lewat CSS maupun JavaScript dari sisi kita. Karena itu langkah paling benar adalah membuang overlay milik kita dan menjadikan tombol bawaan YouTube sebagai satu satunya tombol putar saat jeda.')
console.log('4. Lapisan perisai transparan sepenuh layar tetap dipertahankan, sehingga mengetuk bagian mana pun pada video, termasuk tepat di tombol putar, tetap menjalankan dan menjeda video seperti sebelumnya. Pengalaman ketukan tidak berubah.')
console.log('5. Poster awal dengan tombol putar minimalis sebelum video dimulai serta layar akhir Putar ulang tidak disentuh, jadi hanya kondisi jeda yang menjadi tunggal dan rapi.')
console.log('6. Tidak ada perubahan pada iframe Google Drive maupun pemutar native, karena keduanya memang hanya menampilkan satu tombol putar bawaan masing masing.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka logbook atau galeri berisi video YouTube di ponsel maupun desktop, putar video, lalu jeda: hanya ada satu tombol putar di tengah, yaitu tombol bawaan YouTube, tanpa lingkaran gelap besar menumpuk di depannya.')
console.log('2. Ketuk tepat di tengah video saat jeda: video kembali berputar karena perisai penangkap klik masih aktif.')
console.log('3. Jeda lagi lewat bar kontrol bawah: tampilan jeda tetap tunggal dan konsisten.')
console.log('4. Muat ulang halaman dan jangan putar video: poster awal tetap menampilkan tombol putar minimalis kecil seperti biasanya.')
console.log('5. Biarkan video habis: layar akhir Putar ulang tetap muncul dengan tombol emas seperti semula.')
console.log('6. Buka video Google Drive dan video R2: perilaku putar dan jeda mereka tidak berubah karena perbaikan hanya menyentuh pemutar YouTube.')