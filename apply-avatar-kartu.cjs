const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang foto profil pada lingkaran inisial...')
console.log('')

const TARGET = [
  'src/components/cards.jsx',
  'src/pages/HomePage.jsx',
  'src/pages/TimPage.jsx',
  'src/pages/DospemPage.jsx'
]

/* Div lingkaran yang isinya variabel initials atau inisial */
const regexDiv = /(<div\b[^>]*rounded-full[^>]*>)\s*\{(initials|inisial)\}\s*<\/div>/g

TARGET.forEach(function (rel) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan'); return }
  let isi = baca(rel)
  let jumlah = 0
  const hasil = isi.replace(regexDiv, function (m, buka, varName) {
    jumlah++
    return buka +
      `{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover border-2 border-white shadow-md" /> : ` +
      `typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover border-2 border-white shadow-md" /> : ` +
      varName + '}</div>'
  })
  if (jumlah === 0) { console.log('[TIDAK KETEMU] Lingkaran inisial di ' + rel); return }
  simpan(rel, hasil)
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial kini mendukung foto profil di ' + rel)
})

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cakupan perbaikan:')
console.log('1. PersonChip di cards.jsx dipakai oleh kartu logbook, kartu galeri, baris daftar hadir, dan detail, sehingga semuanya otomatis menampilkan foto.')
console.log('2. PersonCard di cards.jsx dipakai oleh grid Profil Mahasiswa di beranda, sehingga kartu publik ikut menampilkan foto.')
console.log('3. Div lingkaran berukuran tetap dipertahankan, jadi tidak ada perubahan tata letak sama sekali.')
console.log('4. Mahasiswa tanpa foto tetap melihat inisial berwarna tema seperti sebelumnya.')
console.log('5. Pengaman typeof membuat komponen tidak crash bila nama variabel mahasiswa berbeda antar fungsi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload foto profil dari dashboard seperti langkah sebelumnya.')
console.log('2. Buka beranda: kartu Profil Mahasiswa menampilkan foto bulat, bukan inisial.')
console.log('3. Buka logbook dan galeri: PersonChip di setiap kartu menampilkan foto kecil mahasiswa pemilik.')
console.log('4. Buka daftar hadir: baris kehadiran menampilkan foto mahasiswa.')
console.log('5. Hapus foto profil dari dashboard: semua permukaan kembali ke inisial berwarna tema.')