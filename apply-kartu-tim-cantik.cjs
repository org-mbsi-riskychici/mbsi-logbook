const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

if (d.indexOf('Profil tim magang') === -1) {
  console.log('[TIDAK KETEMU] Section Profil tim magang di DospemPage')
  process.exit(1)
}

if (d.indexOf('grid grid-cols-3 gap-3') !== -1 && d.indexOf('rounded-3xl border border-slate-200 bg-white p-5') !== -1) {
  console.log('[SUDAH ADA] Kartu tim versi baru sudah terpasang')
  process.exit(0)
}

const regexKartuLama = /<div key=\{p\.id\} className="card-hover flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/

const KARTU_BARU = `<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-2 inline-flex px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-3 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Logbook</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Media</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-xs font-semibold text-slate-500">Hadir</p>
<p className="mt-1 text-xl font-black text-bsi-800">{totalHadir}</p>
</div>
</div>
</div>`

if (!regexKartuLama.test(d)) {
  console.log('[TIDAK KETEMU] Pola kartu tim lama untuk diganti')
  process.exit(1)
}

d = d.replace(regexKartuLama, KARTU_BARU)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Kartu Profil tim magang ditata ulang sesuai lampiran')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Tampilan baru kartu tim:')
console.log('1. Baris atas: foto profil kotak melengkung di kiri, nama tebal berukuran besar, NIM di bawahnya, dan pil prodi hijau mint seperti lampiran.')
console.log('2. Baris bawah: tiga kotak statistik abu-abu muda berisi angka Logbook, Media, dan Hadir berwarna hijau tua, menggantikan lencana kecil sebelumnya.')
console.log('3. Angka取自 data publik yang sama sehingga tetap akurat: logbook publik, media galeri, dan catatan kehadiran per mahasiswa.')
console.log('4. Kartu memakai sudut lebih bulat (rounded-3xl) agar terasa lembut dan modern sesuai contoh gambar.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, gulir ke section Profil tim magang.')
console.log('2. Setiap kartu menampilkan foto, identitas, pil prodi, dan tiga kotak angka kontribusi.')
console.log('3. Mahasiswa tanpa foto tetap menampilkan inisial berwarna tema pada kotak avatar yang sama.')
console.log('4. Lebar layar kecil: grid kartu turun kolom namun tiga kotak statistik tetap sejajar rapi.')