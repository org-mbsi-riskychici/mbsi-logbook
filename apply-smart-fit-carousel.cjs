const fs = require('fs')
const path = require('path')

const root = process.cwd()
const FILE = 'src/components/Carousel.jsx'

if (!fs.existsSync(path.join(root, FILE))) {
  console.log('File ' + FILE + ' tidak ditemukan.')
  process.exit(1)
}

let isi = fs.readFileSync(path.join(root, FILE), 'utf8').replace(/\r\n/g, '\n')

/* ===== 1. Slide tunggal memakai SmartFit ===== */
const regexTunggal = /\{s\.type === 'video'\s*\n\s*\? <video src=\{s\.src\} className="h-full w-full object-contain" muted preload="metadata" \/>\s*\n\s*: <img src=\{s\.src\} alt=\{s\.title \|\| 'Media'\} className="h-full w-full cursor-zoom-in object-contain" onClick=\{function \(\) \{ setZoom\(s\) \}\} \/>\}/
const gantiTunggal = `<SmartFit src={s.src} type={s.type} alt={s.title || 'Media'} onClick={function () { setZoom(s) }} />`

if (isi.includes(gantiTunggal)) {
  console.log('[SUDAH ADA] Slide carousel tunggal memakai SmartFit')
} else if (regexTunggal.test(isi)) {
  isi = isi.replace(regexTunggal, gantiTunggal)
  console.log('[BERHASIL] Slide carousel tunggal memakai SmartFit')
} else {
  console.log('[TIDAK KETEMU] Blok media slide tunggal di Carousel.jsx')
}

/* ===== 2. Slide ganda memakai SmartFit ===== */
const regexGanda = /\{s\.type === 'video'\s*\n\s*\? <video src=\{s\.src\} muted preload="metadata" \/>\s*\n\s*: <img\s*\n\s*src=\{s\.src\}\s*\n\s*alt=\{s\.title \|\| 'Media'\}\s*\n\s*className="cursor-zoom-in"\s*\n\s*onClick=\{function \(\) \{\s*\n\s*if \(moved\.current\) \{ moved\.current = false; return \}\s*\n\s*setZoom\(s\)\s*\n\s*\}\}\s*\n\s*\/>\}/
const gantiGanda = `<SmartFit
                  src={s.src}
                  type={s.type}
                  alt={s.title || 'Media'}
                  onClick={function () {
                    if (moved.current) { moved.current = false; return }
                    setZoom(s)
                  }}
                />`

if (isi.includes(gantiGanda)) {
  console.log('[SUDAH ADA] Slide carousel ganda memakai SmartFit')
} else if (regexGanda.test(isi)) {
  isi = isi.replace(regexGanda, gantiGanda)
  console.log('[BERHASIL] Slide carousel ganda memakai SmartFit')
} else {
  console.log('[TIDAK KETEMU] Blok media slide ganda di Carousel.jsx')
}

fs.writeFileSync(path.join(root, FILE), isi, 'utf8')

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka kartu logbook yang punya beberapa foto campur landscape dan potret.')
console.log('2. Foto landscape pada carousel harus penuh tanpa ruang kosong di samping.')
console.log('3. Foto potret pada carousel tampil utuh dengan sisi buram dari foto yang sama.')
console.log('4. Klik foto atau tombol perbesar: lightbox tetap membuka media utuh seperti sebelumnya.')
console.log('5. Geser slide di HP untuk memastikan swipe dan penjaga gerak tetap aman.')