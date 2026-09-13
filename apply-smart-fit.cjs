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

console.log('Mulai menerapkan tampilan media adaptif landscape potret...')
console.log('')

/* ===== 1. Komponen SmartFit di ui.jsx ===== */
tambahkan(
  'src/components/ui.jsx',
  'export function SmartFit',
  `
export function SmartFit(props) {
  const [ratio, setRatio] = useState(null)
  const isVideo = props.type === 'video'
  function bacaUkuran(e) {
    const el = e.target
    const w = isVideo ? el.videoWidth : el.naturalWidth
    const h = isVideo ? el.videoHeight : el.naturalHeight
    if (w && h) setRatio(w / h)
  }
  const cover = ratio !== null && ratio > 1
  const potret = ratio !== null && ratio <= 1
  return (
    <>
      {potret && !isVideo ? (
        <img src={props.src} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl" />
      ) : null}
      {isVideo ? (
        <video
          src={props.src}
          muted={props.controls ? false : true}
          preload="metadata"
          controls={props.controls || false}
          onLoadedMetadata={bacaUkuran}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain')}
        />
      ) : (
        <img
          src={props.src}
          alt={props.alt || 'Media'}
          onLoad={bacaUkuran}
          onClick={props.onClick || undefined}
          className={'absolute inset-0 h-full w-full ' + (cover ? 'object-cover' : 'object-contain') + (props.onClick ? ' cursor-zoom-in' : '')}
        />
      )}
    </>
  )
}
`,
  'Komponen SmartFit ditambahkan di ui.jsx'
)

/* ===== 2. ZoomableMedia memakai SmartFit ===== */
ganti(
  'src/components/ui.jsx',
  `      {isVideo ? (
        <video src={props.src} controls className="absolute inset-0 h-full w-full object-contain" />
      ) : (
        <img
          src={props.src}
          alt={props.title || 'Media'}
          onClick={function (e) { e.stopPropagation(); setOpen(true) }}
          className="absolute inset-0 h-full w-full cursor-zoom-in object-contain"
        />
      )}`,
  `      <SmartFit
        src={props.src}
        type={props.type}
        alt={props.title || 'Media'}
        controls={isVideo}
        onClick={isVideo ? null : function (e) { e.stopPropagation(); setOpen(true) }}
      />`,
  'ZoomableMedia memakai SmartFit'
)

/* ===== 3. cards.jsx: import SmartFit ===== */
ganti(
  'src/components/cards.jsx',
  `import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall, ZoomableMedia } from './ui.jsx'`,
  `import { StatusBadge, CategoryBadge, AttendanceBadge, btnSmall, ZoomableMedia, SmartFit } from './ui.jsx'`,
  'Import SmartFit di cards.jsx'
)

/* ===== 4. cards.jsx: media kartu galeri memakai SmartFit ===== */
ganti(
  'src/components/cards.jsx',
  `      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        {item.media_type === 'video'
          ? <video src={item.media_path} muted preload="metadata" className="absolute inset-0 h-full w-full object-contain" />
          : <img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-contain" />}
      </div>`,
  `      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
        <SmartFit src={item.media_path} type={item.media_type} alt={item.judul} />
      </div>`,
  'Media kartu galeri memakai SmartFit'
)

/* ===== 5. Carousel.jsx: import SmartFit ===== */
ganti(
  'src/components/Carousel.jsx',
  `import { Lightbox } from './ui.jsx'`,
  `import { Lightbox, SmartFit } from './ui.jsx'`,
  'Import SmartFit di Carousel.jsx'
)

/* ===== 6. Carousel.jsx: slide tunggal memakai SmartFit ===== */
ganti(
  'src/components/Carousel.jsx',
  `        {s.type === 'video'
          ? <video src={s.src} className="h-full w-full object-contain" muted preload="metadata" />
          : <img src={s.src} alt={s.title || 'Media'} className="h-full w-full object-contain" />}`,
  `        <div className="relative h-full w-full">
          <SmartFit src={s.src} type={s.type} alt={s.title || 'Media'} />
        </div>`,
  'Slide carousel tunggal memakai SmartFit'
)

/* ===== 7. Carousel.jsx: slide ganda memakai SmartFit ===== */
ganti(
  'src/components/Carousel.jsx',
  `              {s.type === 'video'
                ? <video src={s.src} muted preload="metadata" />
                : <img src={s.src} alt={s.title || 'Media'} />}`,
  `              <SmartFit src={s.src} type={s.type} alt={s.title || 'Media'} />`,
  'Slide carousel ganda memakai SmartFit'
)

/* ===== 8. index.css: hapus object-fit paksa pada slide carousel ===== */
ganti(
  'src/index.css',
  `.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #020617; }`,
  `.carousel-slide img, .carousel-slide video { position: absolute; inset: 0; width: 100%; height: 100%; background: #020617; }`,
  'CSS slide carousel tidak memaksa object-fit lagi'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka galeri yang punya foto landscape 4:3 atau 3:2: kartu harus penuh tanpa ruang kosong di samping.')
console.log('2. Buka foto potret 3:4 atau 9:16: foto tampil utuh, sisi kanan kiri terisi buraman foto yang sama.')
console.log('3. Buka video 16:9: memenuhi bingkai. Video 9:16 tampil utuh dengan sisi gelap.')
console.log('4. Foto persegi tampil utuh dengan sisi buram, tidak terpotong.')
console.log('5. Perbesar media lewat lightbox: media tetap tampil utuh apa adanya.')