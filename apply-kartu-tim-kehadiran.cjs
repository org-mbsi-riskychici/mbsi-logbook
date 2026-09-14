const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')
let berubah = false

console.log('Mulai menerapkan desain kartu Profil Tim dengan rekap kehadiran...')
console.log('')

/* ===== 1. Update Query: ambil kolom status dari daftar_hadir ===== */
if (d.includes(".from('daftar_hadir').select('id, mahasiswa_id')")) {
  d = d.replace(".from('daftar_hadir').select('id, mahasiswa_id')", ".from('daftar_hadir').select('id, mahasiswa_id, status')")
  berubah = true
  console.log('[BERHASIL] Query daftar_hadir diperbarui untuk mengambil kolom status')
} else if (d.includes(".from('daftar_hadir').select('id, mahasiswa_id, status')")) {
  console.log('[SUDAH ADA] Query daftar_hadir sudah mengambil kolom status')
} else {
  console.log('[TIDAK KETEMU] Pola query daftar_hadir untuk diperbarui')
}

/* ===== 2. Update Markup: ganti kartu lama dengan desain baru ===== */
// Cari pola kartu lama (dari apply-kartu-tim-cantik.cjs)
const regexKartuLama = /<div key=\{p\.id\} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/

const KARTU_BARU = `<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-sm text-slate-500">NIM {p.nim}</p>
{p.prodi ? <span className="mt-1.5 inline-flex px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">{p.prodi}</span> : null}
</div>
</div>
<div className="mt-4 grid grid-cols-2 gap-3">
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Logbook</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalLog}</p>
</div>
<div className="rounded-2xl bg-slate-50 p-3">
<p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Media</p>
<p className="mt-0.5 text-xl font-black text-bsi-800">{totalGal}</p>
</div>
</div>
<div className="mt-3 pt-3 border-t border-slate-100">
<p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rekap Kehadiran</p>
<div className="grid grid-cols-3 gap-2">
<div className="rounded-xl bg-emerald-50 p-2 text-center">
<p className="text-[10px] font-bold text-emerald-600 uppercase">Masuk</p>
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function(x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>`

if (regexKartuLama.test(d)) {
  d = d.replace(regexKartuLama, KARTU_BARU)
  berubah = true
  console.log('[BERHASIL] Markup kartu Profil Tim diganti dengan desain rekap kehadiran')
} else if (d.includes('Rekap Kehadiran')) {
  console.log('[SUDAH ADA] Desain kartu rekap kehadiran sudah terpasang')
} else {
  console.log('[TIDAK KETEMU] Pola kartu Profil Tim lama. Pastikan script apply-kartu-tim-cantik.cjs sudah dijalankan sebelumnya.')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan yang diterapkan:')
console.log('1. Query Supabase kini mengambil kolom status dari tabel daftar_hadir.')
console.log('2. Kotak kontribusi Logbook dan Media tetap ada di bagian tengah kartu.')
console.log('3. Bagian bawah kartu kini menampilkan 3 kotak Rekap Kehadiran (Masuk, Izin, Bolos) dengan kode warna hijau, kuning, dan merah.')
console.log('4. Perhitungan dilakukan langsung di dalam render menggunakan filter status, sehingga datanya selalu akurat dan real-time.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem dan lihat section Profil tim magang.')
console.log('2. Perhatikan kartu anggota: di bawah kotak Logbook dan Media, kini ada garis pemisah dan 3 kotak kecil berwarna untuk rekap kehadiran.')
console.log('3. Coba isi daftar hadir dengan status Izin atau Bolos, lalu refresh halaman Tim & Dospem untuk melihat angkanya bertambah di kotak yang sesuai.')