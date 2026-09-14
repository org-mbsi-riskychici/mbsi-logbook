const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Diagnosis dan penguncian bentuk bulat versi 3...')
console.log('')

const FILE_U = 'src/components/ui.jsx'
if (!fs.existsSync(path.join(root, FILE_U))) {
  console.log('[GAGAL] ui.jsx tidak ditemukan')
  process.exit(1)
}

let u = baca(FILE_U)

/* ===== 1. Diagnosis: cetak fungsi Avatar yang aktif saat ini ===== */
const idxAvatar = u.indexOf('function Avatar(')
if (idxAvatar === -1) {
  console.log('[DIAGNOSIS] Fungsi Avatar tidak ditemukan di ui.jsx sama sekali.')
} else {
  console.log('[DIAGNOSIS] Isi fungsi Avatar saat ini:')
  console.log(u.slice(idxAvatar - 7, idxAvatar + 700))
  console.log('')
}

/* ===== 2. Tandai img foto profil di dalam Avatar dengan data-fp ===== */
if (idxAvatar === -1) {
  console.log('[LEWATI] Penandaan img dilewati karena Avatar tidak ditemukan')
} else if (u.includes('data-fp=')) {
  console.log('[SUDAH ADA] Penanda data-fp pada img Avatar')
} else {
  let brace = 0
  let akhir = -1
  let inString = false
  let stringChar = ''
  for (let i = idxAvatar; i < u.length; i++) {
    const ch = u[i]
    const prev = i > 0 ? u[i - 1] : ''
    if (inString) {
      if (ch === stringChar && prev !== '\\') inString = false
      continue
    }
    if (ch === '"' || ch === "'" || ch === '`') { inString = true; stringChar = ch; continue }
    if (ch === '{') brace++
    if (ch === '}') {
      brace--
      if (brace === 0) { akhir = i + 1; break }
    }
  }
  if (akhir === -1) {
    console.log('[GAGAL] Batas fungsi Avatar tidak terbaca')
  } else {
    let potongan = u.slice(idxAvatar, akhir)
    const potonganBaru = potongan.replace('<img ', '<img data-fp="1" ')
    if (potonganBaru === potongan) {
      console.log('[TIDAK KETEMU] Tag img di dalam fungsi Avatar')
    } else {
      u = u.slice(0, idxAvatar) + potonganBaru + u.slice(akhir)
      simpan(FILE_U, u)
      console.log('[BERHASIL] Tag img foto profil ditandai data-fp')
    }
  }
}

/* ===== 3. CSS palu bulat: paksa seluruh rantai wadah menjadi lingkaran ===== */
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[LEWATI] index.css tidak ditemukan')
} else {
  let css = baca(FILE_CSS)
  if (css.includes('/* bulat-v3 */')) {
    console.log('[SUDAH ADA] Aturan CSS bulat-v3')
  } else {
    css = css.trimEnd() + '\n\n' + `/* bulat-v3: paksa foto profil bulat sempurna tanpa peduli markup wadah */
img[data-fp] {
  border-radius: 9999px !important;
  object-fit: cover !important;
  object-position: center !important;
  width: 100% !important;
  height: 100% !important;
}
*:has(> img[data-fp]) {
  display: inline-grid !important;
  place-items: center !important;
  position: relative !important;
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  overflow: hidden !important;
  box-shadow: 0 0 0 3px #166534, 0 3px 10px rgba(15, 23, 42, 0.3) !important;
}
*:has(> * > img[data-fp]) {
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
}
*:has(> * > * > img[data-fp]) {
  background: transparent !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 9999px !important;
  box-shadow: none !important;
}
`
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS bulat-v3 dipasang')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Cara kerja versi ini:')
console.log('1. Tag img foto profil diberi atribut data-fp sehingga bisa dibidik CSS tanpa bergantung kelas atau nama variabel.')
console.log('2. Wadah tingkat pertama, kedua, dan ketiga di atas foto dipaksa transparan, tanpa padding, tanpa border, dan beradius penuh, sehingga kotak hijau squircle apa pun akan lenyap.')
console.log('3. Cincin hijau dibuat lewat box-shadow pada wadah langsung foto, yang tidak mungkin terpotong oleh overflow wadah mana pun, jadi hasilnya lingkaran sempurna merata 360 derajat.')
console.log('4. Fallback inisial tidak terpengaruh karena aturan hanya aktif bila ada img beratribut data-fp.')
console.log('')
console.log('Bila setelah hard refresh masih tidak berubah, salin seluruh keluaran [DIAGNOSIS] dari terminal ke chat supaya aku bisa melihat kode Avatar yang sebenarnya aktif di proyekmu.')