const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai memasang animasi panel filter mobile dan tablet...')
console.log('')

/* ===== 1. FilterBar.jsx: bungkus panel dengan struktur filter-wrap, filter-dalam, filter-isi ===== */
const FILE_F = 'src/components/FilterBar.jsx'
if (!ada(FILE_F)) {
  console.log('[GAGAL] FilterBar.jsx tidak ditemukan')
  process.exit(1)
}
let f = baca(FILE_F)

const BLOK_BARU = `      <div className={'filter-wrap' + (props.open ? ' filter-wrap-buka' : '')}>
        <div className="filter-dalam">
          <div className="filter-isi flex flex-wrap items-center gap-3">
            {props.children}
            {props.activeCount > 0 ? (
              <button onClick={props.onReset}
                className="inline-flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100">
                {ICONS.close}<span>Reset</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

`

if (f.includes('filter-wrap')) {
  console.log('[SUDAH ADA] Struktur filter-wrap di FilterBar.jsx')
} else {
  const mulai = f.indexOf("<div className={props.open ? 'anim-page mt-4' : 'hidden xl:block xl:mt-4'}>")
  const akhir = f.indexOf('export function SortSelect', mulai)
  if (mulai !== -1 && akhir !== -1) {
    f = f.slice(0, mulai) + BLOK_BARU + f.slice(akhir)
    simpan(FILE_F, f)
    console.log('[BERHASIL] Panel filter dibungkus struktur animasi filter-wrap')
  } else {
    console.log('[TIDAK KETEMU] Blok panel filter di FilterBar.jsx')
  }
}

/* ===== 2. index.css: aturan expand collapse plus kemunculan berurutan tiap kontrol ===== */
const FILE_CSS = 'src/index.css'
const CSS_BLOK = `/* filter-mobile-v1: panel filter mengembang dan merapat mulus di mobile dan tablet, tiap kontrol muncul berurutan */
.filter-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka { grid-template-rows: 1fr; }
.filter-dalam {
  overflow: hidden;
  min-height: 0;
  visibility: hidden;
  transition: visibility 0.36s;
}
.filter-wrap-buka .filter-dalam { visibility: visible; }
.filter-isi {
  margin-top: 1rem;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka .filter-isi {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.34s ease 0.06s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.04s;
}
.filter-isi > * {
  opacity: 0;
  transform: translateY(-6px);
  transition: opacity 0.16s ease, transform 0.2s cubic-bezier(0.32, 0.72, 0, 1);
}
.filter-wrap-buka .filter-isi > * {
  opacity: 1;
  transform: translateY(0);
}
.filter-wrap-buka .filter-isi > *:nth-child(1) { transition-delay: 0.08s; }
.filter-wrap-buka .filter-isi > *:nth-child(2) { transition-delay: 0.14s; }
.filter-wrap-buka .filter-isi > *:nth-child(3) { transition-delay: 0.2s; }
.filter-wrap-buka .filter-isi > *:nth-child(4) { transition-delay: 0.26s; }
.filter-wrap-buka .filter-isi > *:nth-child(5) { transition-delay: 0.32s; }
.filter-wrap-buka .filter-isi > *:nth-child(6) { transition-delay: 0.38s; }
@media (min-width: 1280px) {
  .filter-wrap { grid-template-rows: 1fr; }
  .filter-dalam { visibility: visible; }
  .filter-isi { opacity: 1; transform: none; }
  .filter-isi > * { opacity: 1; transform: none; transition: none; }
}
`
if (!ada(FILE_CSS)) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('filter-mobile-v1')) {
    console.log('[SUDAH ADA] CSS filter-mobile-v1 di index.css')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_BLOK)
    console.log('[BERHASIL] CSS animasi panel filter ditambahkan di index.css')
  }
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const f2 = baca(FILE_F)
const c2 = ada(FILE_CSS) ? baca(FILE_CSS) : ''
console.log((f2.includes('filter-wrap') ? '[OK] ' : '[BELUM] ') + 'Struktur filter-wrap terpasang di FilterBar.jsx')
console.log((f2.includes('filter-dalam') && f2.includes('filter-isi') ? '[OK] ' : '[BELUM] ') + 'Lapisan dalam dan isi panel tersedia')
console.log((!f2.includes("anim-page mt-4") ? '[OK] ' : '[BELUM] ') + 'Kelas lama anim-page dan hidden xl:block sudah diganti')
console.log((c2.includes('filter-mobile-v1') ? '[OK] ' : '[BELUM] ') + 'CSS filter-mobile-v1 tersedia')
console.log((c2.includes('.filter-wrap-buka .filter-isi > *:nth-child(1)') ? '[OK] ' : '[BELUM] ') + 'Kemunculan berurutan tiap kontrol tersedia')
console.log((c2.includes('@media (min-width: 1280px)') ? '[OK] ' : '[BELUM] ') + 'Desktop tetap terbuka penuh tanpa animasi')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja animasi baru:')
console.log('1. Div pembungkus panel kini memakai grid rows 0fr ke 1fr, jadi saat tombol Filter diketuk panel mengembang dari tinggi nol sampai tinggi aslinya dengan perlambatan alami, bukan muncul sekonyongkonyong.')
console.log('2. Saat ditutup, tinggi panel merapat kembali ke nol sambil isi memudar, sehingga tidak ada lompatan layout pada kartu di bawahnya.')
console.log('3. Seluruh isi panel memudar dan bergeser turun lembut sebagai satu kesatuan dengan kurva yang sama seperti menu mobile yang kamu suka.')
console.log('4. Setiap kontrol di dalamnya, yaitu filter mahasiswa atau kegiatan, filter kategori, pilihan bulan atau rentang waktu, sortir, sampai tombol Reset, muncul berurutan dengan jeda 60 milidetik sehingga terasa mengalir dari kiri ke kanan.')
console.log('5. Saat panel menutup, semua kontrol memudar cepat dalam 160 milidetik tanpa jeda, jadi gerakan keluar terasa tegas dan tidak bertele tele.')
console.log('6. Transisi bisa dipotong di tengah: mengetuk tombol Filter saat panel masih setengah terbuka akan membalikkan gerakan dari posisi terakhir, persis seperti menu mobile v2.')
console.log('7. Di layar lebar 1280 piksel ke atas, panel tetap selalu terbuka dan seluruh animasi dimatikan lewat media query, jadi tampilan desktop tidak berubah sama sekali.')
console.log('8. Pengguna dengan preferensi reduce motion tetap mendapat perilaku instan karena aturan global proyek memotong durasi transisi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Persempit jendela di bawah 1280 piksel lalu buka halaman Logbook, Galeri, Daftar Hadir, atau dashboard.')
console.log('2. Ketuk tombol Filter: panel mengembang mulus dan kontrol filter serta sortir muncul berurutan dari kiri ke kanan.')
console.log('3. Ketuk tombol Filter lagi saat panel masih bergerak: gerakan berbalik mulus dari posisi terakhir tanpa lompatan.')
console.log('4. Tutup panel sepenuhnya: tinggi merapat ke nol dan kontrol memudar cepat, kartu di bawahnya tidak melompat.')
console.log('5. Ganti mode waktu antara Bulan dan Rentang Waktu saat panel terbuka: animasi FLIP yang sudah ada tetap bekerja normal di dalam panel.')
console.log('6. Lebarkan jendela ke ukuran desktop: panel langsung terbuka penuh tanpa animasi dan tanpa jarak yang berubah.')