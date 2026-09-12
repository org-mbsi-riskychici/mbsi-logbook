const fs = require('fs')
const path = require('path')

const root = process.cwd()

function baca(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n')
}

function simpan(rel, isi) {
  fs.writeFileSync(path.join(root, rel), isi, 'utf8')
}

function ganti(rel, cari, gantiDengan, label) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.log('[LEWATI] File tidak ditemukan: ' + rel)
    return
  }
  let isi = baca(rel)
  if (isi.includes(gantiDengan)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  if (!isi.includes(cari)) {
    console.log('[TIDAK KETEMU] ' + label + ' di ' + rel)
    return
  }
  isi = isi.replace(cari, gantiDengan)
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

function tambahkan(rel, penanda, blok, label) {
  if (!fs.existsSync(path.join(root, rel))) {
    console.log('[LEWATI] File tidak ditemukan: ' + rel)
    return
  }
  let isi = baca(rel)
  if (isi.includes(penanda)) {
    console.log('[SUDAH ADA] ' + label)
    return
  }
  isi = isi + '\n' + blok
  simpan(rel, isi)
  console.log('[BERHASIL] ' + label)
}

console.log('Mulai menerapkan animasi transisi halus pada tombol mata...')
console.log('')

/* ===== 1. CSS transisi garis dan pupil icon mata ===== */
tambahkan(
  'src/index.css',
  '.eye-icon .eye-slash',
  `
/* ===== Animasi icon mata ===== */
.eye-icon .eye-slash {
  stroke-dasharray: 29;
  stroke-dashoffset: 0;
  opacity: 1;
  transition: stroke-dashoffset .35s ease, opacity .3s ease;
}
.eye-icon.terbuka .eye-slash {
  stroke-dashoffset: 29;
  opacity: 0;
}
.eye-icon .eye-pupil {
  transform-origin: 12px 12px;
  transition: transform .35s ease, opacity .35s ease;
}
.eye-icon.terbuka .eye-pupil {
  transform: scale(1);
  opacity: 1;
}
.eye-icon:not(.terbuka) .eye-pupil {
  transform: scale(.7);
  opacity: .6;
}
`,
  'CSS animasi icon mata ditambahkan'
)

/* ===== 2. Komponen EyeToggle di icons.jsx ===== */
tambahkan(
  'src/components/icons.jsx',
  'export function EyeToggle',
  `
export function EyeToggle(props) {
  return (
    <svg
      width={props.size || 18}
      height={props.size || 18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={'eye-icon ' + (props.open ? 'terbuka' : '')}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" className="eye-pupil" />
      <line x1="2" y1="2" x2="22" y2="22" className="eye-slash" />
    </svg>
  )
}
`,
  'Komponen EyeToggle ditambahkan'
)

/* ===== 3. LoginPage memakai EyeToggle ===== */
ganti(
  'src/pages/LoginPage.jsx',
  `import { SizedIcon } from '../components/icons.jsx'`,
  `import { EyeToggle } from '../components/icons.jsx'`,
  'Import EyeToggle di LoginPage'
)

ganti(
  'src/pages/LoginPage.jsx',
  `<SizedIcon name={lihatKode ? 'eyeOff' : 'eye'} size={18} />`,
  `<EyeToggle open={lihatKode} size={18} />`,
  'Tombol mata memakai EyeToggle beranimasi'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka halaman login dalam keadaan keluar.')
console.log('2. Perhatikan icon mata menampilkan garis miring sebagai penanda kode tertutup.')
console.log('3. Klik tombol mata: garis miring mundur perlahan lalu memudar, kode terlihat.')
console.log('4. Klik lagi: garis miring tergambar kembali dari ujung ke ujung, kode tertutup.')
console.log('5. Pastikan perpindahan terasa halus tanpa pergantian icon yang mendadak.')