const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai memasang pemutar video kustom bertema BSI...')
console.log('')

/* ===== 1. Komponen PemutarVideo.jsx ===== */
simpan('src/components/PemutarVideo.jsx', `import { useEffect, useRef, useState } from 'react'

let janjiApi = null
function muatApiYouTube() {
  if (janjiApi) return janjiApi
  janjiApi = new Promise(function (resolve) {
    if (window.YT && window.YT.Player) { resolve(window.YT); return }
    const lama = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = function () {
      if (lama) lama()
      resolve(window.YT)
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    document.head.appendChild(tag)
  })
  return janjiApi
}

function formatWaktu(detik) {
  const d = isFinite(detik) && detik > 0 ? detik : 0
  const m = Math.floor(d / 60)
  const s = Math.floor(d % 60)
  return m + ':' + (s < 10 ? '0' : '') + s
}

function IkonPlay() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M8 5v14l11-7z" /></svg> }
function IkonPause() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 8.5a4 4 0 0 1 0 7M18.5 6a7 7 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonBisu() { return <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M3 10v4h4l5 5V5L7 10H3z" /><path d="M16 9l6 6M22 9l-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg> }
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
function IkonUlang() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg> }

export default function PemutarVideo(props) {
  const youtubeId = props.youtubeId
  const [dimulai, setDimulai] = useState(false)
  const [memutar, setMemutar] = useState(false)
  const [buffer, setBuffer] = useState(false)
  const [selesai, setSelesai] = useState(false)
  const [gagal, setGagal] = useState(false)
  const [waktu, setWaktu] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 400)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: { autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0, disablekb: 1, iv_load_policy: 3, playsinline: 1, origin: window.location.origin },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) { setMemutar(true); setBuffer(false); setSelesai(false) }
            else if (e.data === S.PAUSED) { setMemutar(false); setBuffer(false) }
            else if (e.data === S.BUFFERING) { setBuffer(true) }
            else if (e.data === S.ENDED) { setMemutar(false); setSelesai(true) }
          },
          onError: function () { setGagal(true); setBuffer(false); setMemutar(false) }
        }
      })
    } catch (e) {
      setGagal(true)
    }
  }

  function jungkir() {
    const p = playerRef.current
    if (!p) return
    if (memutar) p.pauseVideo()
    else p.playVideo()
  }

  function cari(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const kotak = ev.currentTarget.getBoundingClientRect()
    const rasio = Math.min(1, Math.max(0, (ev.clientX - kotak.left) / kotak.width))
    p.seekTo(rasio * durasi, true)
    setWaktu(rasio * durasi)
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false) } else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0

  return (
    <div ref={kotakRef} className={'group relative overflow-hidden bg-slate-950 ' + (props.className || 'aspect-video w-full')}>
      <div className="absolute inset-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />
      ) : null}

      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} className="absolute inset-0 h-full w-full object-cover opacity-85" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-slate-950/10" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar video"
              className="grid h-16 w-16 place-items-center rounded-full bg-bsi-700 text-white shadow-xl shadow-bsi-900/50 ring-4 ring-white/20 transition hover:scale-105 hover:bg-bsi-600">
              <IkonPlay />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-slate-950/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
          </div>
        </div>
      ) : null}

      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-950/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
            <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent px-3 pb-2.5 pt-10 transition-opacity duration-300 ' + (memutar ? 'opacity-0 group-hover:opacity-100 focus-within:opacity-100' : 'opacity-100')}>
          <div className="mb-2 cursor-pointer py-1" onClick={cari} title="Geser durasi">
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div className="absolute inset-y-0 left-0 rounded-full bg-gold-500" style={{ width: persen + '%' }} />
            </div>
          </div>
          <div className="flex items-center gap-2 text-white">
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'} className="grid h-9 w-9 place-items-center rounded-full bg-bsi-700 transition hover:bg-bsi-600">
              {memutar ? <IkonPause /> : <IkonPlay />}
            </button>
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>
            <span className="ml-1 text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
            <span className="flex-1" />
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis')

/* ===== 2. cards.jsx: pakai pemutar kustom ===== */
const FILE_C = 'src/components/cards.jsx'
let c = baca(FILE_C)
if (!c.includes("PemutarVideo.jsx")) {
  c = "import PemutarVideo from './PemutarVideo.jsx'\n" + c
  console.log('[BERHASIL] Import PemutarVideo ditambahkan di cards.jsx')
}
const regexIt = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ it\.youtube_id[^>]*?\/>/
const regexItem = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ item\.youtube_id[^>]*?\/>/
if (regexIt.test(c)) {
  c = c.replace(regexIt, `<PemutarVideo key={it.youtube_id} youtubeId={it.youtube_id} title={it.judul} className="aspect-video w-full rounded-2xl mb-3" />`)
  console.log('[BERHASIL] Iframe detail logbook diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe detail logbook')
}
if (regexItem.test(c)) {
  c = c.replace(regexItem, `<PemutarVideo key={item.youtube_id} youtubeId={item.youtube_id} title={item.judul} className="aspect-video w-full rounded-2xl" />`)
  console.log('[BERHASIL] Iframe detail galeri diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe detail galeri')
}
simpan(FILE_C, c)

/* ===== 3. ui.jsx: lightbox pakai pemutar kustom ===== */
const FILE_U = 'src/components/ui.jsx'
let u = baca(FILE_U)
if (!u.includes("PemutarVideo.jsx")) {
  u = "import PemutarVideo from './PemutarVideo.jsx'\n" + u
  console.log('[BERHASIL] Import PemutarVideo ditambahkan di ui.jsx')
}
const regexProps = /<iframe src=\{'https:\/\/www\.youtube-nocookie\.com\/embed\/' \+ props\.youtubeId[^>]*?\/>/
if (regexProps.test(u)) {
  u = u.replace(regexProps, `<PemutarVideo key={props.youtubeId} youtubeId={props.youtubeId} title={props.title || 'Video'} className="mx-auto aspect-video w-full rounded-2xl" />`)
  console.log('[BERHASIL] Iframe lightbox diganti pemutar kustom')
} else {
  console.log('[TIDAK KETEMU] Iframe lightbox')
}
simpan(FILE_U, u)

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Yang akan terlihat:')
console.log('1. Poster thumbnail dengan tombol putar hijau BSI dan judul video.')
console.log('2. Saat diputar, tidak ada kontrol maupun logo bawaan YouTube.')
console.log('3. Kontrol bar kaca muncul saat kursor diarahkan: putar, bisu, waktu, layar penuh.')
console.log('4. Garis progres emas bisa diklik untuk menggeser durasi.')
console.log('5. Akhir video menampilkan tombol putar ulang emas, bukan video terkait YouTube.')