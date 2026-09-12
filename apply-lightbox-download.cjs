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

console.log('Mulai menambahkan tombol unduh pada tampilan fullscreen...')
console.log('')

/* ===== 1. Icon download di icons.jsx ===== */
ganti(
  'src/components/icons.jsx',
  `  )
}

export const ICONS = {`,
  `  ),
  download: (
    <>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </>
  )
}

export const ICONS = {`,
  'Icon download ditambahkan'
)

/* ===== 2. State dan fungsi unduh di komponen Lightbox ===== */
ganti(
  'src/components/ui.jsx',
  `export function Lightbox(props) {
  useBodyScrollLock(true)
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])`,
  `export function Lightbox(props) {
  useBodyScrollLock(true)
  const [busyUnduh, setBusyUnduh] = useState(false)
  useEffect(function () {
    function onKey(e) {
      if (e.key === 'Escape') props.onClose()
    }
    document.addEventListener('keydown', onKey)
    return function () { document.removeEventListener('keydown', onKey) }
  }, [])
  async function unduh() {
    if (busyUnduh) return
    setBusyUnduh(true)
    let nama = 'media'
    try {
      nama = new URL(props.src).pathname.split('/').pop() || 'media'
    } catch (e) {
      nama = (props.title || 'media') + '.jpg'
    }
    try {
      const res = await fetch(props.src)
      if (!res.ok) throw new Error('status ' + res.status)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = nama
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(function () { URL.revokeObjectURL(url) }, 2000)
    } catch (err) {
      window.open(props.src, '_blank')
    }
    setBusyUnduh(false)
  }`,
  'Fungsi unduh dengan blob dan cadangan tab baru'
)

/* ===== 3. Tombol unduh berdampingan dengan tombol tutup ===== */
ganti(
  'src/components/ui.jsx',
  `      <button
        type="button"
        title="Tutup (Esc)"
        onClick={props.onClose}
        className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
      >
        <SizedIcon name="close" size={18} />
      </button>`,
  `      <div className="absolute right-4 top-4 flex gap-2">
        <button
          type="button"
          title={busyUnduh ? 'Menyiapkan unduhan...' : 'Unduh media'}
          onClick={unduh}
          disabled={busyUnduh}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-50"
        >
          <SizedIcon name="download" size={18} />
        </button>
        <button
          type="button"
          title="Tutup (Esc)"
          onClick={props.onClose}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          <SizedIcon name="close" size={18} />
        </button>
      </div>`,
  'Tombol unduh tampil di pojok kanan atas Lightbox'
)

console.log('')
console.log('Selesai. Vite akan memuat ulang otomatis.')
console.log('')
console.log('Langkah uji:')
console.log('1. Buka foto mana pun hingga tampil fullscreen, baik dari carousel, detail logbook, maupun detail galeri.')
console.log('2. Perhatikan ada dua tombol bulat di pojok kanan atas: unduh dan tutup.')
console.log('3. Klik tombol unduh: file harus terunduh dengan nama asli dari penyimpanan.')
console.log('4. Saat unduhan diproses tombol meredup sesaat supaya tidak diklik ganda.')
console.log('5. Uji juga pada video: tombol unduh menyimpan file videonya.')
console.log('6. Tutup fullscreen seperti biasa lewat tombol silang, klik latar, atau Esc.')