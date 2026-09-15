const fs = require('fs')
const path = require('path')
const root = process.cwd()
const FILE_CSS = 'src/index.css'
if (!fs.existsSync(path.join(root, FILE_CSS))) {
  console.log('[GAGAL] index.css tidak ditemukan')
  process.exit(1)
}
let css = fs.readFileSync(path.join(root, FILE_CSS), 'utf8').replace(/\r\n/g, '\n')

console.log('Mulai memperbaiki header popup yang ketutupan media...')
console.log('')

const BLOK_LAMA = `.anim-modal > div:first-child {
  position: sticky;
  top: 0;
  z-index: 5;
  background: inherit;
}`
const BLOK_BARU = `.anim-modal > div:first-child {
  position: sticky;
  top: 0;
  z-index: 40;
  background: inherit;
}
.anim-modal > * + * {
  position: relative;
  z-index: 1;
  isolation: isolate;
}`

if (css.includes('.anim-modal > * + *')) {
  console.log('[SUDAH ADA] Aturan pengurung isi popup sudah terpasang')
} else if (css.includes(BLOK_LAMA)) {
  css = css.replace(BLOK_LAMA, BLOK_BARU)
  fs.writeFileSync(path.join(root, FILE_CSS), css, 'utf8')
  console.log('[BERHASIL] z-index header dinaikkan dan isi popup dikurung')
} else {
  const re = /(\.anim-modal > div:first-child \{[^}]*?z-index: )\d+(;)/
  if (re.test(css)) {
    css = css.replace(re, '$140$2')
    if (!css.includes('.anim-modal > * + *')) {
      css = css.trimEnd() + '\n.anim-modal > * + * {\n  position: relative;\n  z-index: 1;\n  isolation: isolate;\n}\n'
    }
    fs.writeFileSync(path.join(root, FILE_CSS), css, 'utf8')
    console.log('[BERHASIL] z-index header dinaikkan lewat pola cadangan dan isi popup dikurung')
  } else {
    console.log('[TIDAK KETEMU] Blok header sticky di index.css')
  }
}

css = fs.readFileSync(path.join(root, FILE_CSS), 'utf8')
console.log('')
console.log('Verifikasi:')
console.log((css.includes('z-index: 40') ? '[OK] ' : '[BELUM] ') + 'z-index header sticky dinaikkan ke 40')
console.log((css.includes('.anim-modal > * + *') ? '[OK] ' : '[BELUM] ') + 'Isi popup dikurung dengan isolation isolate')
console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Penjelasan perbaikan:')
console.log('1. Lapisan dalam pemutar video dan media zoom memakai z-index bawaan bernilai puluhan, jadi header dengan z-index 5 kalah dan tertutup media saat digulir.')
console.log('2. z-index header sticky dinaikkan ke 40 supaya selalu berada di atas seluruh lapisan media di dalam popup.')
console.log('3. Aturan isolation isolate pada saudara header membuat semua z-index internal media terkurung di dalam area isi, sehingga tidak ada lagi lapisan yang bisa melompati header.')
console.log('4. Latar header tetap memakai background inherit, jadi media yang lewat di bawahnya tertutup rapat dan tidak tembus.')
console.log('5. Tidak ada file JSX yang disentuh, hanya dua aturan CSS, sehingga perilaku animasi dan gulir tidak berubah.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka detail logbook atau galeri yang memuat video maupun foto.')
console.log('2. Gulir isi popup ke bawah: media bergerak melewati bawah header, bukan menimpanya.')
console.log('3. Judul Detail dan tombol X tetap terlihat penuh dan bisa diklik kapan pun selama menggulir.')
console.log('4. Kontrol pemutar video tetap berfungsi normal karena pengurungan hanya membatasi prioritas tumpukan, bukan interaksi.')
console.log('5. Ulangi pada mode gelap: header tetap solid tanpa bayangan media yang tembus.')