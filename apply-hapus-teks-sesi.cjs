const fs = require('fs')
const path = require('path')
const root = process.cwd()
const SRC = path.join(root, 'src')

const BLOK = `<div className="mx-auto w-full max-w-7xl px-4 py-6 lg:py-8">
<div className="space-y-6">
<div className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-14 w-14 rounded-2xl"></div>
<div className="flex-1 space-y-2">
<div className="skeleton h-4 w-44 rounded-full"></div>
<div className="skeleton h-3 w-28 rounded-full"></div>
</div>
<div className="skeleton h-10 w-28 rounded-2xl"></div>
</div>
<div className="grid items-start gap-6 xl:grid-cols-[0.9fr_1.1fr]">
<div className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
<div className="skeleton h-5 w-36 rounded-full"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-10 w-full rounded-2xl"></div>
<div className="skeleton h-20 w-full rounded-2xl"></div>
<div className="skeleton h-11 w-44 rounded-2xl"></div>
</div>
<div className="grid gap-5 md:grid-cols-2">
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
<div className="skeleton h-64 rounded-3xl"></div>
</div>
</div>
</div>
</div>`

function daftarFile(dir) {
  let out = []
  const nama = fs.readdirSync(dir)
  for (let i = 0; i < nama.length; i++) {
    const p = path.join(dir, nama[i])
    const st = fs.statSync(p)
    if (st.isDirectory()) out = out.concat(daftarFile(p))
    else if (p.endsWith('.jsx') || p.endsWith('.js')) out.push(p)
  }
  return out
}

console.log('Mulai menyisir seluruh src dan mengganti semua teks Memuat sesi dengan skeleton...')
console.log('')

const RE_ELEM = /<(div|p|span|h1|h2|h3)[^>]*>\s*Memuat sesi[^<]*<\/\1>/g
const RE_STR = /['"]Memuat sesi[^'"]*['"]/g
let total = 0
const file = daftarFile(SRC)
for (let i = 0; i < file.length; i++) {
  let isi = fs.readFileSync(file[i], 'utf8').replace(/\r\n/g, '\n')
  if (!isi.includes('Memuat sesi')) continue
  const jumlahElem = (isi.match(RE_ELEM) || []).length
  RE_ELEM.lastIndex = 0
  isi = isi.replace(RE_ELEM, function () { return BLOK })
  const jumlahStr = (isi.match(RE_STR) || []).length
  RE_STR.lastIndex = 0
  isi = isi.replace(RE_STR, function () { return BLOK })
  const jumlah = jumlahElem + jumlahStr
  if (jumlah > 0) {
    fs.writeFileSync(file[i], isi, 'utf8')
    total += jumlah
    console.log('[BERHASIL] ' + jumlah + ' kemunculan diganti di ' + path.relative(root, file[i]))
  }
}
if (total === 0) console.log('[INFO] Tidak ada teks Memuat sesi yang tersisa di folder src')

/* Verifikasi akhir: sisir ulang */
let sisa = 0
for (let i = 0; i < file.length; i++) {
  const isi = fs.readFileSync(file[i], 'utf8')
  if (isi.includes('Memuat sesi')) {
    sisa++
    console.log('[SISA] Teks masih ada di ' + path.relative(root, file[i]))
  }
}
console.log('')
console.log('Verifikasi:')
console.log((sisa === 0 ? '[OK] ' : '[BELUM] ') + 'Seluruh teks Memuat sesi sudah hilang dari src (' + total + ' titik diganti)')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Script menyisir semua file .jsx dan .js di dalam src, jadi titik mana pun yang masih merender teks Memuat sesi pasti ketemu dan diganti, bukan hanya satu file.')
console.log('2. Pengganti adalah blok skeleton murni memakai kelas .skeleton bawaan proyek, lengkap dengan shimmer dan varian mode gelap, tanpa perlu import komponen tambahan.')
console.log('3. Bentuk skeleton meniru dashboard: kartu kepala profil, panel form kiri, dan grid empat kartu kanan, sehingga transisi ke dashboard asli terasa mulus.')
console.log('4. Pola pencarian mencakup elemen pembungkus div, p, span, maupun judul, serta string kutip polos bila teks dipakai di dalam ekspresi JSX.')
console.log('5. Setelah penggantian, script menyisir ulang dan melaporkan bila masih ada sisa, jadi tidak ada lagi kejutan teks muncul sesaat.')
console.log('')
console.log('Langkah uji:')
console.log('1. Keluar dari akun lalu masuk kembali dan perhatikan momen sebelum dashboard tampil.')
console.log('2. Hanya kerangka skeleton berkilau yang muncul, tanpa teks Memuat sesi sama sekali.')
console.log('3. Muat ulang halaman dashboard langsung lewat alamatnya: perilaku sama, skeleton saja.')
console.log('4. Aktifkan mode gelap lalu ulangi: skeleton menyesuaikan warna gelap dengan kilau lembut.')
console.log('5. Setelah sesi siap, dashboard asli muncul mulus tanpa kedip maupun lompatan tata letak.')