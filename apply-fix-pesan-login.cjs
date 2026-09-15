const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai mengganti pesan gagal login menjadi keterangan yang mudah dipahami...')
console.log('')

const FILE_L = 'src/pages/LoginPage.jsx'
if (!fs.existsSync(path.join(root, FILE_L))) {
  console.log('[GAGAL] LoginPage.jsx tidak ditemukan')
  process.exit(1)
}
let l = baca(FILE_L)
let berubah = false

if (l.includes('function pesanErrorLogin(')) {
  console.log('[SUDAH ADA] Pemeta pesan gagal login di LoginPage.jsx')
} else {
  /* ===== 1. Impor SizedIcon untuk ikon silang pada kotak error ===== */
  const IMPOR_LAMA = "import { EyeToggle } from '../components/icons.jsx'"
  const IMPOR_BARU = "import { EyeToggle, SizedIcon } from '../components/icons.jsx'"
  if (l.includes(IMPOR_BARU)) {
    console.log('[SUDAH ADA] Impor SizedIcon di LoginPage.jsx')
  } else if (l.includes(IMPOR_LAMA)) {
    l = l.replace(IMPOR_LAMA, IMPOR_BARU)
    berubah = true
    console.log('[BERHASIL] Impor SizedIcon ditambahkan di LoginPage.jsx')
  } else {
    console.log('[TIDAK KETEMU] Pola impor icons di LoginPage.jsx')
  }

  /* ===== 2. Fungsi pemeta pesan error Supabase menjadi bahasa manusia ===== */
  const FUNGSI = `function pesanErrorLogin(err) {
  const pesan = String((err && err.message) || '')
  const rendah = pesan.toLowerCase()
  if (rendah.indexOf('invalid login credentials') !== -1) {
    return 'NIM atau kode akses yang kamu masukkan tidak cocok dengan data kami. Periksa kembali penulisannya, pastikan tidak ada spasi berlebih, lalu coba lagi.'
  }
  if (rendah.indexOf('not confirmed') !== -1) {
    return 'Akun untuk NIM ini belum diaktifkan. Hubungi admin tim magang untuk mengaktifkan akunmu terlebih dahulu.'
  }
  if (rendah.indexOf('too many requests') !== -1 || rendah.indexOf('try again after') !== -1 || rendah.indexOf('rate limit') !== -1) {
    return 'Terlalu banyak percobaan masuk dalam waktu singkat demi keamanan. Tunggu sekitar satu menit, lalu coba lagi.'
  }
  if (rendah.indexOf('fetch') !== -1 || rendah.indexOf('network') !== -1 || rendah.indexOf('failed to load') !== -1 || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return 'Tidak bisa terhubung ke server. Periksa koneksi internetmu, lalu coba lagi.'
  }
  if (rendah.indexOf('email') !== -1 && rendah.indexOf('format') !== -1) {
    return 'Format NIM tidak terbaca. Masukkan NIM berupa angka tanpa spasi, contoh: 24070041.'
  }
  if (pesan) return 'Gagal masuk: ' + pesan + '. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
  return 'Terjadi kesalahan tidak terduga saat masuk. Coba sekali lagi, atau hubungi admin tim magang bila masalah berlanjut.'
}
`
  const ANCHOR_FN = 'export default function LoginPage() {'
  if (l.includes(ANCHOR_FN)) {
    l = l.replace(ANCHOR_FN, FUNGSI + ANCHOR_FN)
    berubah = true
    console.log('[BERHASIL] Fungsi pesanErrorLogin dipasang di LoginPage.jsx')
  } else {
    console.log('[TIDAK KETEMU] Anchor export default function LoginPage')
  }

  /* ===== 3. Catch submit memakai pemeta pesan ===== */
  if (l.includes('setError(pesanErrorLogin(err))')) {
    console.log('[SUDAH ADA] Catch submit memakai pesanErrorLogin')
  } else if (l.includes('setError(err.message)')) {
    l = l.replace('setError(err.message)', 'setError(pesanErrorLogin(err))')
    berubah = true
    console.log('[BERHASIL] Catch submit kini memakai pesanErrorLogin')
  } else {
    console.log('[TIDAK KETEMU] Pola setError(err.message) di submit')
  }

  /* ===== 4. Kotak error berstruktur: ikon, judul, penjelasan ===== */
  const reKotak = /([ \t]*)\{error \? <p className="mt-3 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">\{error\}<\/p> : null\}/
  if (l.includes('<p className="font-bold">Gagal masuk</p>')) {
    console.log('[SUDAH ADA] Kotak error berstruktur di LoginPage.jsx')
  } else if (reKotak.test(l)) {
    l = l.replace(reKotak, function (match, ind) {
      const BLOK = `{error ? (
  <div className="mt-3 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
      <SizedIcon name="close" size={12} />
    </span>
    <div className="min-w-0">
      <p className="font-bold">Gagal masuk</p>
      <p className="mt-1 leading-relaxed">{error}</p>
    </div>
  </div>
) : null}`
      return BLOK.split('\n').map(function (baris) { return baris.length ? ind + baris : baris }).join('\n')
    })
    berubah = true
    console.log('[BERHASIL] Kotak error diganti menjadi versi berstruktur dengan judul dan penjelasan')
  } else {
    console.log('[TIDAK KETEMU] Pola kotak error lama di LoginPage.jsx')
  }
}

if (berubah) simpan(FILE_L, l)

/* ===== Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const l2 = baca(FILE_L)
console.log((l2.includes("import { EyeToggle, SizedIcon }") ? '[OK] ' : '[BELUM] ') + 'Impor SizedIcon tersedia')
console.log((l2.includes('function pesanErrorLogin(') ? '[OK] ' : '[BELUM] ') + 'Fungsi pemeta pesan tersedia')
console.log((l2.includes('setError(pesanErrorLogin(err))') ? '[OK] ' : '[BELUM] ') + 'Catch submit memakai pemeta pesan')
console.log((l2.includes('<p className="font-bold">Gagal masuk</p>') ? '[OK] ' : '[BELUM] ') + 'Kotak error berstruktur judul dan penjelasan')
console.log((!l2.includes('{error ? <p className="mt-3 rounded-2xl bg-red-50') ? '[OK] ' : '[BELUM] ') + 'Kotak error lama sudah diganti')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang berubah bagi user:')
console.log('1. Salah NIM atau kode: muncul judul Gagal masuk plus kalimat NIM atau kode akses yang kamu masukkan tidak cocok dengan data kami, lengkap dengan arahan memeriksa penulisan dan spasi, bukan lagi Invalid login credentials.')
console.log('2. Akun belum diaktifkan: user diberitahu menghubungi admin tim magang, bukan pesan konfirmasi email yang membingungkan.')
console.log('3. Percobaan beruntun: user diminta menunggu sekitar satu menit, sesuai perilaku pembatasan percobaan dari server.')
console.log('4. Putus jaringan: user diarahkan memeriksa koneksi internet, bukan pesan fetch gagal yang teknis.')
console.log('5. Kotak error kini punya ikon silang dalam lingkaran, judul tebal, dan penjelasan berbaris longgar, sehingga langsung terbaca sebagai panduan bukan kode error.')
console.log('6. Mode gelap tetap rapi karena seluruh kelas warna kotak (bg-red-50, bg-red-100, text-red-700) sudah punya pengganti gelap di index.css.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman login, isi NIM benar tetapi kode akses salah: kotak merah menampilkan judul Gagal masuk dan penjelasan NIM atau kode akses tidak cocok.')
console.log('2. Matikan wifi atau data lalu coba masuk: muncul pesan periksa koneksi internet.')
console.log('3. Coba masuk salah berulang kali dengan cepat: muncul pesan tunggu sekitar satu menit.')
console.log('4. Uji di mode gelap: kotak error tetap kontras dan terbaca.')
console.log('5. Masuk dengan data benar: tetap langsung menuju dashboard tanpa perubahan perilaku.')