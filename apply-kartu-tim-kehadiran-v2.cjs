const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_D = 'src/pages/DospemPage.jsx'

if (!fs.existsSync(path.join(root, FILE_D))) {
  console.log('[GAGAL] DospemPage.jsx tidak ditemukan')
  process.exit(1)
}

let d = fs.readFileSync(path.join(root, FILE_D), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai mengganti kartu Profil Tim dengan versi rekap kehadiran...')
console.log('')

if (d.indexOf('Profil tim magang') === -1) {
  console.log('[TIDAK KETEMU] Section Profil tim magang di DospemPage')
  process.exit(1)
}

if (d.indexOf('Rekap Kehadiran') !== -1) {
  console.log('[SUDAH ADA] Desain kartu rekap kehadiran sudah terpasang')
  process.exit(0)
}

if (d.indexOf(".from('daftar_hadir').select('id, mahasiswa_id, status')") === -1) {
  console.log('[PERINGATAN] Query status belum ada, mencoba memperbarui dulu')
  d = d.replace(".from('daftar_hadir').select('id, mahasiswa_id')", ".from('daftar_hadir').select('id, mahasiswa_id, status')")
}

/* Jangkar baru: dari awal kartu sampai penutup callback map, versi kartu apa pun pasti cocok */
const regexKartu = /<div key=\{p\.id\}[\s\S]*?\n\)\s*\n\}\)\}/

if (!regexKartu.test(d)) {
  console.log('[TIDAK KETEMU] Blok kartu di dalam people.map')
  process.exit(1)
}

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
<p className="text-base font-black text-emerald-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Masuk' }).length}</p>
</div>
<div className="rounded-xl bg-amber-50 p-2 text-center">
<p className="text-[10px] font-bold text-amber-600 uppercase">Izin</p>
<p className="text-base font-black text-amber-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Izin' }).length}</p>
</div>
<div className="rounded-xl bg-red-50 p-2 text-center">
<p className="text-[10px] font-bold text-red-600 uppercase">Bolos</p>
<p className="text-base font-black text-red-700">{hadirRows.filter(function (x) { return x.mahasiswa_id === p.id && x.status === 'Bolos' }).length}</p>
</div>
</div>
</div>
</div>
)
})}`

d = d.replace(regexKartu, KARTU_BARU)
fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')

console.log('[BERHASIL] Kartu Profil Tim diganti dengan versi rekap kehadiran tiga status')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Isi kartu baru sesuai pratinjau yang kamu setujui:')
console.log('1. Baris identitas: avatar kotak melengkung, nama tebal besar, NIM, dan pil prodi hijau mint.')
console.log('2. Baris kontribusi: dua kotak abu-abu untuk Logbook dan Media.')
console.log('3. Baris kehadiran: tiga kotak berwarna Masuk hijau, Izin kuning, Bolos merah, dihitung terpisah dari kolom status.')
console.log('4. Variabel totalLog dan totalGal tetap dipakai dari callback map yang sudah ada, sehingga tidak ada state baru yang perlu ditambah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka menu Tim & Dospem, gulir ke section Profil tim magang.')
console.log('2. Setiap kartu menampilkan identitas, dua kotak kontribusi, lalu tiga kotak rekap kehadiran.')
console.log('3. Isi daftar hadir dengan status Izin atau Bolos, refresh, dan pastikan angka bertambah pada kotak yang sesuai warna.')
console.log('4. Mahasiswa tanpa catatan kehadiran menampilkan tiga kotak bernilai nol dengan rapi.')