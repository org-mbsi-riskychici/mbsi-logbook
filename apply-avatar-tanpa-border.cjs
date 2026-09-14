const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai menghapus border dan menambahkan bayangan pada seluruh foto profil...')
console.log('')

/* ===== 1. ui.jsx: Avatar tanpa border, bayangan berlapis ===== */
const FILE_U = 'src/components/ui.jsx'
if (!ada(FILE_U)) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}
let u = baca(FILE_U)
let berubahU = false

if (u.includes("border: '3px solid #166534',")) {
  u = u.replace(/[ \t]*border: '3px solid #166534',\n/, '')
  berubahU = true
  console.log('[BERHASIL] Border hijau pada Avatar dihapus')
} else {
  console.log('[SUDAH ADA] Avatar tanpa border hijau')
}

if (u.includes("boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',")) {
  u = u.replace("boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',", "boxShadow: '0 1px 2px rgba(15, 23, 42, 0.10), 0 10px 28px rgba(15, 23, 42, 0.22)',")
  berubahU = true
  console.log('[BERHASIL] Bayangan berlapis dipasang pada Avatar')
} else if (u.includes('0 10px 28px rgba(15, 23, 42, 0.22)')) {
  console.log('[SUDAH ADA] Bayangan berlapis pada Avatar')
} else {
  console.log('[TIDAK KETEMU] Pola boxShadow lama pada Avatar')
}

if (berubahU) simpan(FILE_U, u)

/* ===== 2. Foto inline dan pratinjau: buang border putih, pindahkan bayangan ke wadah ===== */
const TARGET = [
  'src/components/cards.jsx',
  'src/components/ui.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/DospemPage.jsx',
  'src/pages/DashboardPage.jsx',
  'src/pages/AttendancePage.jsx',
  'src/pages/LogbookPage.jsx',
  'src/pages/GalleryPage.jsx'
]

TARGET.forEach(function (rel) {
  if (!ada(rel)) return
  let isi = baca(rel)
  const sebelum = isi

  /* border putih pada img foto profil dibuang, bayangan standar dipasang */
  isi = isi.split('rounded-[28%] object-cover border-2 border-white shadow-md').join('rounded-[28%] object-cover shadow-lg')
  isi = isi.split('rounded-full object-cover border-2 border-white shadow-md').join('rounded-[28%] object-cover shadow-lg')

  /* wadah ber-overflow-hidden tidak bisa menampilkan bayangan img, jadi bayangan ditaruh di wadahnya */
  isi = isi.split('rounded-[28%] overflow-hidden').join('rounded-[28%] overflow-hidden shadow-lg')

  if (isi !== sebelum) {
    simpan(rel, isi)
    console.log('[BERHASIL] Border putih dibuang dan bayangan dipasang di ' + rel)
  }
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Hasil akhir tampilan:')
console.log('1. Tidak ada lagi cincin hijau maupun border putih di foto profil mana pun, termasuk header, tab Profil, kartu publik, PersonChip, kartu kehadiran, dan pratinjau form upload.')
console.log('2. Foto memakai bayangan berlapis: bayangan tipis menempel untuk ketajaman tepi plus bayangan lebar yang lembut untuk kesan melayang.')
console.log('3. Bayangan pada foto inline ditaruh di wadah luarnya karena wadah ber-overflow hidden akan memotong bayangan yang berasal dari img di dalamnya.')
console.log('4. Bentuk kotak melengkung 28 persen tetap berlaku seragam di semua ukuran avatar.')
console.log('')
console.log('Bila bayangan terasa kurang kuat atau terlalu kuat, kabari aku: kekuatannya diatur dari satu nilai boxShadow di Avatar dan kelas shadow-lg pada foto inline.')