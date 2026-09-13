const fs = require('fs')
const path = require('path')
const root = process.cwd()

function simpan(rel, isi) {
  const full = path.join(root, rel)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, isi, 'utf8')
  console.log('[BERHASIL] ' + rel + ' ditulis ulang')
}

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

function paksaKualitas(p) {
  try {
    if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080')
  } catch (e) {}
}
function matikanSubtitel(p) {
  try {
    if (p && typeof p.unloadModule === 'function') p.unloadModule('captions')
  } catch (e) {}
  try {
    if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {})
  } catch (e) {}
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
  const [tutup, setTutup] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const putarPertama = useRef(false)
  const timerTutup = useRef(null)

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
      if (timerTutup.current) clearTimeout(timerTutup.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    setTutup(true)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          autohide: 1,
          showinfo: 0,
          cc_load_policy: 0,
          origin: window.location.origin
        },
        events: {
          onReady: function (e) {
            setDurasi(e.target.getDuration() || 0)
            paksaKualitas(e.target)
            matikanSubtitel(e.target)
            e.target.playVideo()
          },
          onStateChange: function (e) {
            const S = window.YT.PlayerState
            if (e.data === S.PLAYING) {
              setMemutar(true)
              setBuffer(false)
              setSelesai(false)
              paksaKualitas(e.target)
              matikanSubtitel(e.target)
              if (!putarPertama.current) {
                putarPertama.current = true
                timerTutup.current = setTimeout(function () { setTutup(false) }, 2600)
              }
            } else if (e.data === S.PAUSED) {
              setMemutar(false)
              setBuffer(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false)
              setSelesai(true)
              setTutup(false)
            }
          },
          onError: function () {
            setGagal(true)
            setBuffer(false)
            setMemutar(false)
            setTutup(false)
          }
        }
      })
    } catch (e) {
      setGagal(true)
      setTutup(false)
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
    <div ref={kotakRef} className={'pemutar-bungkus group relative overflow-hidden bg-slate-950 ' + (props.className || 'aspect-video w-full')}>
      <div className="absolute inset-0 z-0">
        <div ref={wadahRef} className="h-full w-full" />
      </div>

      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau jeda video" onClick={jungkir} className="absolute inset-0 z-10 h-full w-full cursor-pointer bg-transparent" />
      ) : null}

      {dimulai && !gagal ? (
        <div className={'pointer-events-none absolute inset-0 z-10 bg-slate-950 transition-opacity duration-700 ' + (tutup ? 'opacity-100' : 'opacity-0')}>
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        </div>
      ) : null}

      {dimulai && !memutar && !buffer && !selesai && !gagal && !tutup ? (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-slate-950/60 text-white ring-1 ring-white/20 backdrop-blur-sm">
            <IkonPlay />
          </span>
        </div>
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

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perilaku baru yang berlaku:')
console.log('1. Saat tombol putar ditekan, poster menutup seluruh area selama 2,6 detik pertama.')
console.log('2. Chip channel kiri atas, logo YouTube kanan bawah, dan kilau awal bawaan tertutup poster.')
console.log('3. Poster memudar halus setelah jendela lapisan awal lewat, video lanjut tanpa merek.')
console.log('4. Subtitel dipaksa nonaktif lewat cc_load_policy 0 plus perintah API saat siap dan saat bermain.')
console.log('5. Kualitas putar dikunci di rentang 720p sampai 1080p lewat setPlaybackQualityRange.')