const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang fallback thumbnail YouTube...')
console.log('')

/* ===== 1. ui.jsx: komponen MediaYouTube dengan coba ulang otomatis ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (u.includes('export function MediaYouTube')) {
  console.log('[SUDAH ADA] Komponen MediaYouTube di ui.jsx')
} else {
  u = u.trimEnd() + '\n\n' + `export function MediaYouTube(props) {
  const [status, setStatus] = useState('muat')
  const [coba, setCoba] = useState(0)
  useEffect(function () {
    if (status !== 'tunggu') return undefined
    const t = setTimeout(function () {
      setCoba(function (c) { return c + 1 })
      setStatus('muat')
    }, 15000)
    return function () { clearTimeout(t) }
  }, [status])
  if (status === 'tunggu' || status === 'habis') {
    return (
      <div className={'grid place-items-center bg-slate-800 ' + (props.className || 'absolute inset-0 h-full w-full')}>
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <SizedIcon name="youtube" size={26} />
          <p className="px-2 text-center text-[11px] font-semibold">{status === 'habis' ? 'Thumbnail belum siap di YouTube' : 'Menyiapkan thumbnail YouTube...'}</p>
        </div>
      </div>
    )
  }
  return (
    <img
      src={props.src + (coba > 0 ? (String(props.src).indexOf('?') === -1 ? '?' : '&') + 'r=' + coba : '')}
      alt={props.alt || 'Thumbnail YouTube'}
      onClick={props.onClick || undefined}
      onError={function () { setStatus(coba >= 3 ? 'habis' : 'tunggu') }}
      onLoad={function () { setStatus('muat') }}
      className={props.className || 'absolute inset-0 h-full w-full object-cover'}
    />
  )
}
`
  simpan(FILE_U, u)
  console.log('[BERHASIL] Komponen MediaYouTube ditambahkan di ui.jsx')
}

/* ===== 2. ui.jsx: SmartFit delegasi thumbnail YouTube ke MediaYouTube ===== */
u = baca(FILE_U)
const anchorSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'`
const sisipSmart = `  const mediaRef = useRef(null)
  const isVideo = props.type === 'video'
  if (!isVideo && String(props.src || '').indexOf('i.ytimg.com') !== -1) {
    return <MediaYouTube src={props.src} alt={props.alt} onClick={props.onClick} className="absolute inset-0 h-full w-full object-cover" />
  }`
if (u.includes("i.ytimg.com') !== -1")) {
  console.log('[SUDAH ADA] Delegasi YouTube di SmartFit')
} else if (u.includes(anchorSmart)) {
  u = u.replace(anchorSmart, sisipSmart)
  simpan(FILE_U, u)
  console.log('[BERHASIL] SmartFit mendelegasikan thumbnail YouTube')
} else {
  console.log('[TIDAK KETEMU] Anchor SmartFit di ui.jsx')
}

/* ===== 3. cards.jsx: pakai MediaYouTube pada kartu media YouTube ===== */
const FILE_C = 'src/components/cards.jsx'
let c = baca(FILE_C)
let berubahC = false
if (!c.includes('MediaYouTube')) {
  c = c.replace(/import \{([^}]*)\} from '\.\/ui\.jsx'/, function (m, g) {
    return 'import {' + g + ', MediaYouTube } from \'./ui.jsx\''
  })
  berubahC = true
}
const imgYt = `<img src={item.media_path} alt={item.judul} className="absolute inset-0 h-full w-full object-cover" />`
if (c.includes(imgYt)) {
  c = c.replace(imgYt, `<MediaYouTube src={item.media_path} alt={item.judul} />`)
  berubahC = true
}
if (berubahC) {
  simpan(FILE_C, c)
  console.log('[BERHASIL] cards.jsx memakai MediaYouTube')
} else {
  console.log('[SUDAH ADA] cards.jsx sudah memakai MediaYouTube')
}

/* ===== 4. App.jsx: bungkam peringatan React Router ===== */
const FILE_A = 'src/App.jsx'
let a = baca(FILE_A)
if (a.includes('v7_startTransition')) {
  console.log('[SUDAH ADA] Future flag React Router')
} else if (a.includes('<BrowserRouter>')) {
  a = a.replace('<BrowserRouter>', '<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>')
  simpan(FILE_A, a)
  console.log('[BERHASIL] Future flag React Router dipasang')
} else {
  console.log('[TIDAK KETEMU] Baris BrowserRouter di App.jsx')
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru:')
console.log('1. Saat thumbnail YouTube belum siap, kartu menampilkan placeholder rapi berikon YouTube.')
console.log('2. Komponen mencoba ulang setiap 15 detik sampai empat kali, jadi gambar muncul sendiri.')
console.log('3. Bila setelah empat percobaan masih belum ada, placeholder permanen tampil tanpa gambar rusak.')
console.log('4. Peringatan React Router di konsol tidak muncul lagi.')
console.log('5. Baris CORS dan pesan internal pemain YouTube tetap ada tetapi tidak mengganggu fungsi.')