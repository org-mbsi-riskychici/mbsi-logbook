const fs = require('fs')
const path = require('path')
const root = process.cwd()
function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }
function ganti(rel, cari, gantiDengan, label) {
  if (!ada(rel)) { console.log('[LEWATI] ' + rel + ' tidak ditemukan (' + label + ')'); return }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) { console.log('[SUDAH ADA] ' + label); return }
  if (!isi.includes(cari)) { console.log('[TIDAK KETEMU] ' + label + ' di ' + rel); return }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai revisi pagination: 12 data per halaman, limit 6 terbaru, dan kartu rata tengah...')
console.log('')

/* ===== 1. Ubah isi setiap halaman dari 10 menjadi 12 data ===== */
;['src/pages/LogbookPage.jsx', 'src/pages/GalleryPage.jsx', 'src/pages/AttendancePage.jsx'].forEach(function (rel) {
  ganti(rel, 'const PER_PAGE = 10', 'const PER_PAGE = 12', 'PER_PAGE menjadi 12')
})

/* ===== 2. CSS wadah fleksibel yang meratakan tengah baris kartu tidak penuh ===== */
const FILE_CSS = 'src/index.css'
const CSS_PUSAT = `/* grid-pusat: baris kartu yang tidak penuh otomatis rata tengah */
.grid-pusat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem; }
.grid-pusat-rapat { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; }
.kolom-kartu, .kolom-kartu-rapat { width: 100%; display: flex; }
.kolom-kartu > *, .kolom-kartu-rapat > * { width: 100%; }
@media (min-width: 768px) {
  .kolom-kartu { width: calc(50% - 0.625rem); }
  .kolom-kartu-rapat { width: calc(50% - 0.5rem); }
}
@media (min-width: 1280px) {
  .kolom-kartu { width: calc(33.3333% - 0.83333rem); }
  .kolom-kartu-rapat { width: calc(33.3333% - 0.66667rem); }
}
`
if (!ada(FILE_CSS)) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* grid-pusat */')) {
    console.log('[SUDAH ADA] CSS grid-pusat di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_PUSAT)
    console.log('[BERHASIL] CSS grid-pusat ditambahkan di index.css')
  }
}

/* ===== 3. LogbookPage: grid rata tengah ===== */
ganti('src/pages/LogbookPage.jsx',
`      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonLogbookCard key={i} /> })
          : paginatedLogs.map(function (l) {
              return <LogbookCard key={l.id} log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                onDetail={function () { setDetail(l) }} />
            })}
        {!loading && !logs.length ? <EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /> : null}
      </section>`,
`      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
          : paginatedLogs.map(function (l) {
              return (
                <div key={l.id} className="kolom-kartu">
                  <LogbookCard log={l} isOwner={mahasiswa && mahasiswa.id === l.mahasiswa_id}
                    onDetail={function () { setDetail(l) }} />
                </div>
              )
            })}
        {!loading && !logs.length ? <div className="w-full"><EmptyState title="Logbook tidak ditemukan" desc="Coba reset filter atau pilih filter lain." /></div> : null}
      </section>`,
'Grid LogbookPage rata tengah')

/* ===== 4. GalleryPage: grid rata tengah ===== */
ganti('src/pages/GalleryPage.jsx',
`      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <SkeletonGalleryCard key={i} /> })
          : paginatedItems.map(function (i) {
              return <GalleryCard key={i.id} item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                onDetail={function () { setDetail(i) }} />
            })}
        {!loading && !items.length ? <EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /> : null}
      </section>`,
`      <section className="grid-pusat mt-8">
        {loading
          ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonGalleryCard /></div> })
          : paginatedItems.map(function (i) {
              return (
                <div key={i.id} className="kolom-kartu">
                  <GalleryCard item={i} isOwner={mahasiswa && mahasiswa.id === i.mahasiswa_id}
                    onDetail={function () { setDetail(i) }} />
                </div>
              )
            })}
        {!loading && !items.length ? <div className="w-full"><EmptyState icon="camera" title="Belum ada media galeri" desc="Media galeri yang diunggah mahasiswa akan tampil di sini." /></div> : null}
      </section>`,
'Grid GalleryPage rata tengah')

/* ===== 5. AttendancePage: grid rata tengah ===== */
ganti('src/pages/AttendancePage.jsx',
`        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonAttendanceCard key={i} /> })
            : paginatedRows.map(function (r) {
                return <AttendanceCard key={r.id} row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                  onDetail={function () { setDetail(r) }} />
              })}
          {!loading && !rows.length ? <EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /> : null}
        </div>`,
`        <div className="grid-pusat-rapat mt-6">
          {loading
            ? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonAttendanceCard /></div> })
            : paginatedRows.map(function (r) {
                return (
                  <div key={r.id} className="kolom-kartu-rapat">
                    <AttendanceCard row={r} isOwner={mahasiswa && mahasiswa.id === r.mahasiswa_id}
                      onDetail={function () { setDetail(r) }} />
                  </div>
                )
              })}
          {!loading && !rows.length ? <div className="w-full"><EmptyState icon="clipboard" title="Belum ada data kehadiran" desc="Data kehadiran akan tampil setelah mahasiswa mengisi daftar hadir." /></div> : null}
        </div>`,
'Grid AttendancePage rata tengah')

/* ===== 6. HomePage: 6 logbook terbaru plus tombol lihat semua dan rata tengah ===== */
ganti('src/pages/HomePage.jsx',
`        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
            : logs.slice(0, 3).map(function (l) {
                return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
              })}
          {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /> : null}
        </div>
      </section>`,
`        <div className="grid-pusat mt-6">
          {loading
            ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
            : logs.slice(0, 6).map(function (l) {
                return (
                  <div key={l.id} className="kolom-kartu">
                    <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                  </div>
                )
              })}
          {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook yang sudah diatur sebagai siap dilihat akan tampil di sini." /></div> : null}
        </div>
        <div className="mt-8 flex justify-center">
          <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
        </div>
      </section>`,
'Beranda menampilkan 6 logbook terbaru dengan tombol lihat semua')

/* ===== 7. DospemPage: 6 logbook terbaru plus tombol lihat semua dan rata tengah ===== */
ganti('src/pages/DospemPage.jsx',
`         <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
           {loading
             ? [0, 1, 2].map(function (i) { return <SkeletonLogbookCard key={i} /> })
             : logs.map(function (l) {
                 return <LogbookCard key={l.id} log={l} onDetail={function () { setDetail(l) }} />
               })}
           {!loading && !logs.length ? <EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /> : null}
         </div>
       </section>`,
`         <div className="grid-pusat mt-6">
           {loading
             ? [0, 1, 2, 3, 4, 5].map(function (i) { return <div key={i} className="kolom-kartu"><SkeletonLogbookCard /></div> })
             : logs.slice(0, 6).map(function (l) {
                 return (
                   <div key={l.id} className="kolom-kartu">
                     <LogbookCard log={l} onDetail={function () { setDetail(l) }} />
                   </div>
                 )
               })}
           {!loading && !logs.length ? <div className="w-full"><EmptyState title="Belum ada logbook publik" desc="Logbook akan tampil setelah mahasiswa mengatur status siap dilihat." /></div> : null}
         </div>
         <div className="mt-8 flex justify-center">
           <Link to="/logbook" className="rounded-2xl bg-bsi-800 px-6 py-3 text-sm font-bold text-white hover:bg-bsi-900">Lihat semua logbook</Link>
         </div>
       </section>`,
'Tim & Dospem menampilkan 6 logbook terbaru dengan tombol lihat semua')

/* ===== 8. DospemPage: kartu profil tim ikut rata tengah ===== */
ganti('src/pages/DospemPage.jsx',
`<div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">`,
`<div className="grid-pusat-rapat mt-6">`,
'Wadah kartu profil tim menjadi grid-pusat-rapat')
ganti('src/pages/DospemPage.jsx',
`? [0, 1, 2].map(function (i) { return <SkeletonPersonCard key={i} /> })`,
`? [0, 1, 2].map(function (i) { return <div key={i} className="kolom-kartu-rapat"><SkeletonPersonCard /></div> })`,
'Skeleton profil tim dibungkus kolom')
ganti('src/pages/DospemPage.jsx',
`<div key={p.id} className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col">`,
`<div key={p.id} className="kolom-kartu-rapat">
<div className="card-hover rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">`,
'Kartu profil tim dibungkus kolom')
ganti('src/pages/DospemPage.jsx',
`</div>
 )
 })}`,
`</div>
 </div>
 )
 })}`,
'Penutup kartu profil tim disesuaikan')
ganti('src/pages/DospemPage.jsx',
`{!loading && !people.length ? <EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /> : null}`,
`{!loading && !people.length ? <div className="w-full"><EmptyState title="Belum ada data mahasiswa" desc="Profil tim akan tampil setelah mahasiswa terdaftar." /></div> : null}`,
'EmptyState profil tim melebar penuh')

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Isi revisi yang diterapkan:')
console.log('1. Setiap halaman pagination kini memuat 12 data per index, jadi satu baris penuh terdiri dari 4 baris kartu di layar lebar.')
console.log('2. Beranda menampilkan 6 logbook paling terbaru tanpa pagination, ditambah tombol Lihat semua logbook yang menuju halaman Logbook.')
console.log('3. Halaman Tim & Dospem menampilkan 6 logbook paling terbaru tanpa pagination, ditambah tombol Lihat semua logbook yang menuju halaman Logbook.')
console.log('4. Semua grid kartu memakai wadah fleksibel berpusat: bila kartu dalam satu baris hanya 1 atau 2, kartu tersebut berdiri di tengah, bukan menempel di kiri.')
console.log('5. Tinggi kartu dalam satu baris tetap sejajar karena pembungkus kolom meregangkan kartu secara otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka Logbook dengan 4 data: keempat kartu tetap 3 di baris pertama dan 1 kartu sisa berada tepat di tengah baris kedua.')
console.log('2. Tambah data sampai 13: halaman menampilkan 12 kartu dan tombol nomor 1 serta 2 muncul.')
console.log('3. Buka Beranda: maksimal 6 kartu terbaru tampil dan tombol hijau Lihat semua logbook berada di tengah bawah.')
console.log('4. Buka Tim & Dospem: kartu profil tim rata tengah bila jumlahnya kurang dari 3, dan section aktivitas hanya 6 logbook terbaru dengan tombol lihat semua.')
console.log('5. Uji mode gelap: tata letak pusat tidak berubah dan warna tetap mengikuti tema.')