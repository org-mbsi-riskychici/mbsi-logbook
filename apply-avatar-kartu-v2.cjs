const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang foto profil pada semua lingkaran inisial...')
console.log('')

/* Kumpulkan semua file jsx di bawah src */
const daftar = []
function jalan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  entries.forEach(function (e) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) { jalan(full); return }
    if (/\.jsx$/.test(e.name)) daftar.push(full)
  })
}
jalan(path.join(root, 'src'))

/* Hanya menarget isi lingkaran: {initials} atau {inisial} yang diikuti penutup div */
const regexIsi = /\{\s*(initials|inisial)\s*\}\s*<\/div>/g

let totalFile = 0
let totalSub = 0
daftar.forEach(function (full) {
  const rel = path.relative(root, full).replace(/\\/g, '/')
  let isi = baca(rel)
  if (!regexIsi.test(isi)) return
  regexIsi.lastIndex = 0
  let jumlah = 0
  const hasil = isi.replace(regexIsi, function (m, varName) {
    jumlah++
    return `{typeof p !== 'undefined' && p && p.foto_profil ? <img src={p.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover" /> : ` +
      `typeof m !== 'undefined' && m && m.foto_profil ? <img src={m.foto_profil} alt="Foto profil" className="h-full w-full rounded-full object-cover" /> : ` +
      varName + '}</div>'
  })
  if (jumlah === 0) return
  simpan(rel, hasil)
  totalFile++
  totalSub += jumlah
  console.log('[BERHASIL] ' + jumlah + ' lingkaran inisial mendukung foto profil di ' + rel)
})

if (totalFile === 0) {
  console.log('[TIDAK KETEMU] Tidak ada file yang memuat pola {initials} atau {inisial}')
  console.log('')
  console.log('Bila baris ini muncul, kirim isi fungsi PersonChip dari src/components/cards.jsx')
  console.log('supaya aku kunci polanya persis pada bentuk yang dipakai proyekmu.')
}

console.log('')
console.log('Ringkasan: ' + totalSub + ' lingkaran diperbarui pada ' + totalFile + ' file.')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Langkah uji:')
console.log('1. Upload foto profil dari dashboard bila belum.')
console.log('2. Buka beranda: kartu Profil Mahasiswa menampilkan foto bulat pengganti inisial.')
console.log('3. Buka logbook, galeri, dan daftar hadir: PersonChip menampilkan foto kecil pemilik.')
console.log('4. Mahasiswa tanpa foto tetap melihat inisial berwarna tema seperti semula.')
console.log('5. Hapus foto dari dashboard: semua permukaan kembali ke inisial dengan mulus.')