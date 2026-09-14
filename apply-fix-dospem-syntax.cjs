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

console.log('Mulai memperbaiki struktur JSX yang tidak seimbang di DospemPage...')
console.log('')

/* ===== 1. Tulis ulang section Profil tim magang agar tag pembuka dan penutup seimbang ===== */
const startSection = '<section className="mt-10">\n<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>'
const endSection = '</section>\n      <section className="mt-10">\n        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>'

const startIdx = d.indexOf(startSection)
const endIdx = d.indexOf(endSection)

if (startIdx !== -1 && endIdx !== -1) {
  const newSection = `<section className="mt-10">
<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Profil tim magang</h2>
<p className="mt-2 max-w-3xl text-slate-500">Seluruh mahasiswa magang beserta kontribusi logbook, media galeri, dan catatan kehadiran masing-masing.</p>
<div className="grid-pusat-rapat mt-6">
{loading
? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })
: people.map(function (p) {
const totalLog = logs.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalGal = galRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
const totalHadir = hadirRows.filter(function (x) { return x.mahasiswa_id === p.id }).length
return (
<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
<div className="flex items-center gap-4">
<Avatar src={p.foto_profil || null} nama={p.nama} size="lg" />
<div className="min-w-0 flex-1">
<p className="truncate text-lg font-black text-slate-900">{p.nama}</p>
<p className="truncate text-xs text-slate-500">NIM {p.nim}</p>
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
</div>
)
})}
{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}
</div>
</section>
      `
  d = d.substring(0, startIdx) + newSection + d.substring(endIdx)
  berubah = true
  console.log('[BERHASIL] Section Profil tim magang ditulis ulang dengan struktur JSX yang seimbang')
} else {
  console.log('[TIDAK KETEMU] Batas section Profil tim magang, mencoba fallback...')
  const fallbackRegex = /(<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">[\s\S]*?)<\/div>(\s*\)\s*\}\)\})/
  if (fallbackRegex.test(d)) {
    d = d.replace(fallbackRegex, '$1</div>\n </div>$2')
    berubah = true
    console.log('[BERHASIL] Penutup kolom-kartu-rapat ditambahkan (fallback)')
  }
}

/* ===== 2. Pastikan section logbook dospem memiliki grid-pusat ===== */
const regexLogbook = /<section className="mt-10">\s*<h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan<\/h2>\s*<div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">/
if (regexLogbook.test(d)) {
  d = d.replace(regexLogbook, `<section className="mt-10">
        <h2 className="text-2xl lg:text-3xl font-black text-slate-900">Aktivitas yang sudah dipublikasikan</h2>
        <div className="grid-pusat mt-6">`)
  berubah = true
  console.log('[BERHASIL] Wadah grid logbook dospem diubah menjadi grid-pusat')
}

/* ===== 3. Pastikan ada tombol Lihat semua logbook sebelum Modal ===== */
if (!d.includes('Lihat semua logbook') && d.includes('<Modal open={!!detail}')) {
  d = d.replace(/<\/div>\s*<\/section>\s*(<Modal open=\{!!detail\})/, `</div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>
      $1`)
  berubah = true
  console.log('[BERHASIL] Tombol Lihat semua logbook ditambahkan')
}

if (berubah) {
  fs.writeFileSync(path.join(root, FILE_D), d, 'utf8')
}

console.log('')
console.log('Selesai. Vite akan otomatis memuat ulang (atau restart dev server: Ctrl+C lalu npm run dev -- --host).')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Script sebelumnya gagal menambahkan </div> penutup untuk pembungkus kolom kartu profil tim.')
console.log('2. Akibatnya, parser JSX mengira section berikutnya (Aktivitas yang sudah dipublikasikan) masih berada di dalam kartu, sehingga memicu error "Adjacent JSX elements".')
console.log('3. Script ini membuang section Profil tim magang yang rusak dan menulis ulangnya dari nol dengan tag pembuka dan penutup yang dijamin seimbang.')
console.log('4. Section logbook di bawahnya juga dipastikan memakai wadah rata tengah (grid-pusat) dan memiliki tombol Lihat semua logbook.')