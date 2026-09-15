const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }
function ada(rel) { return fs.existsSync(path.join(root, rel)) }

console.log('Mulai mengganti animasi menu mobile menjadi versi halus v2...')
console.log('')

/* ===== 1. index.css: buang blok menu-mobile-v1, pasang menu-mobile-v2 ===== */
const FILE_CSS = 'src/index.css'
if (!ada(FILE_CSS)) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = baca(FILE_CSS)

const CSS_V2 = `/* menu-mobile-v2: tinggi menu diinterpolasi persis lewat grid rows, transisi bisa dipotong di tengah jadi terasa halus seperti aplikasi native */
.menu-mobile-wrap {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.36s cubic-bezier(0.32, 0.72, 0, 1);
}
.menu-mobile-wrap.menu-mobile-buka { grid-template-rows: 1fr; }
.menu-mobile-dalam {
  overflow: hidden;
  min-height: 0;
  visibility: hidden;
  transition: visibility 0.36s;
}
.menu-mobile-buka .menu-mobile-dalam { visibility: visible; }
.menu-mobile-isi {
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.2s ease, transform 0.24s cubic-bezier(0.32, 0.72, 0, 1);
}
.menu-mobile-buka .menu-mobile-isi {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.34s ease 0.08s, transform 0.4s cubic-bezier(0.32, 0.72, 0, 1) 0.05s;
}
`

if (css.includes('menu-mobile-v2')) {
  console.log('[SUDAH ADA] CSS menu-mobile-v2 di index.css')
} else {
  const mulai = css.indexOf('/* menu-mobile-v1')
  if (mulai !== -1) {
    let akhir = css.indexOf('\n/*', mulai + 10)
    if (akhir === -1) akhir = css.length
    css = css.slice(0, mulai) + CSS_V2 + css.slice(akhir)
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Blok menu-mobile-v1 diganti menjadi menu-mobile-v2')
  } else {
    simpan(FILE_CSS, css.trimEnd() + '\n\n' + CSS_V2)
    console.log('[BERHASIL] CSS menu-mobile-v2 ditambahkan (blok v1 tidak ditemukan)')
  }
}

/* ===== 2. Layout.jsx: MenuMobile selalu terpasang, tanpa timer, tanpa unmount ===== */
const FILE_L = 'src/components/Layout.jsx'
if (!ada(FILE_L)) {
  console.log('[GAGAL] Layout.jsx tidak ditemukan')
  process.exit(1)
}
let l = baca(FILE_L)

const KOMPONEN_V2 = `function MenuMobile(props) {
  return (
    <div className={'menu-mobile-wrap xl:hidden' + (props.open ? ' menu-mobile-buka' : '')}>
      <div className="menu-mobile-dalam">
        <div className="menu-mobile-isi border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          {props.children}
        </div>
      </div>
    </div>
  )
}
`

if (l.includes('menu-mobile-wrap')) {
  console.log('[SUDAH ADA] MenuMobile versi v2 di Layout.jsx')
} else {
  const mulaiFn = l.indexOf('function MenuMobile(props) {')
  const mulaiExport = l.indexOf('export default function Layout')
  if (mulaiFn !== -1 && mulaiExport !== -1 && mulaiExport > mulaiFn) {
    l = l.slice(0, mulaiFn) + KOMPONEN_V2 + l.slice(mulaiExport)
    simpan(FILE_L, l)
    console.log('[BERHASIL] Komponen MenuMobile diganti menjadi versi selalu terpasang')
  } else {
    console.log('[TIDAK KETEMU] Blok komponen MenuMobile di Layout.jsx')
  }
}

/* ===== 3. Verifikasi ===== */
console.log('')
console.log('Verifikasi:')
const c2 = baca(FILE_CSS)
const l2 = baca(FILE_L)
console.log((c2.includes('menu-mobile-v2') ? '[OK] ' : '[BELUM] ') + 'CSS menu-mobile-v2 terpasang')
console.log((!c2.includes('menuMobileIn') && !c2.includes('menuMobileOut') ? '[OK] ' : '[BELUM] ') + 'Keyframes max-height lama sudah dibuang')
console.log((c2.includes('grid-template-rows 0fr') || c2.includes('grid-template-rows: 0fr') ? '[OK] ' : '[BELUM] ') + 'Interpolasi tinggi lewat grid rows tersedia')
console.log((l2.includes('menu-mobile-wrap') ? '[OK] ' : '[BELUM] ') + 'Struktur wrapper menu v2 terpasang')
console.log((!l2.includes('menu-mobile-tutup') ? '[OK] ' : '[BELUM] ') + 'Logika timer dan kelas tutup lama sudah hilang')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Kenapa versi v2 terasa jauh lebih halus:')
console.log('1. Tinggi menu diinterpolasi persis dari nol sampai tinggi aslinya lewat trik grid rows 0fr ke 1fr, jadi kurva easing terasa proporsional sepanjang gerakan, tidak seperti max-height 480px yang membuat gerakan selesai lebih awal lalu terasa mengambang.')
console.log('2. Animasi memakai transition, bukan keyframes, sehingga kalau tombol Menu diketuk lagi di tengah animasi, gerakan berbalik mulus dari posisi terakhir tanpa melompat atau mengulang dari awal.')
console.log('3. Tidak ada lagi efek berurutan per tautan yang membuat panel terasa tersendat, seluruh isi memudar dan bergeser sebagai satu kesatuan dengan penundaan kecil yang lembut.')
console.log('4. Easing cubic-bezier(0.32, 0.72, 0, 1) meniru kurva perlambatan menu iOS, gerakan cepat di awal lalu meluncur pelan saat berhenti.')
console.log('5. Elemen menu kini selalu terpasang di DOM dengan visibility hidden saat tertutup, jadi tidak ada lagi lompatan layout saat elemen dilepas, dan tautan tetap tidak bisa difokuskan saat menu tertutup.')
console.log('6. Perubahan tinggi terkurung di wrapper grid, sementara isi hanya memakai opacity dan transform yang ringan bagi kompositor.')
console.log('7. Pengguna reduce motion tetap mendapat perilaku instan karena aturan global proyek memotong durasi transisi.')
console.log('')
console.log('Langkah uji:')
console.log('1. Persempit jendela di bawah 1280 piksel lalu ketuk tombol Menu: panel meluncur terbuka dengan perlambatan alami di ujung gerakan.')
console.log('2. Ketuk Menu lagi saat panel masih terbuka setengah: panel berbalik menutup mulus dari posisi tersebut, bukan melompat.')
console.log('3. Buka tutup berulang dengan cepat beberapa kali: gerakan selalu kontinu tanpa patahan maupun kedip.')
console.log('4. Gulir halaman saat menu terbuka lalu tutup: konten di bawah header tidak melompat karena tinggi merapat dengan mulus.')
console.log('5. Aktifkan mode gelap: warna panel menyesuaikan dan kehalusan animasi tetap sama.')