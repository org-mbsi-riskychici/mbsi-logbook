import { useEffect, useRef, useState } from 'react'

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
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }
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
  const [volume, setVolume] = useState(100)
  const [bisu, setBisu] = useState(false)
  const [penuh, setPenuh] = useState(false)
  const [sembunyi, setSembunyi] = useState(false)
  const [thumbPakaiHq, setThumbPakaiHq] = useState(false)
  const kotakRef = useRef(null)
  const wadahRef = useRef(null)
  const playerRef = useRef(null)
  const timerSembunyi = useRef(null)

  useEffect(function () {
    const iv = setInterval(function () {
      const p = playerRef.current
      if (p && p.getCurrentTime) {
        setWaktu(p.getCurrentTime() || 0)
        const d = p.getDuration ? p.getDuration() : 0
        if (d) setDurasi(d)
      }
    }, 250)
    return function () { clearInterval(iv) }
  }, [])

  useEffect(function () {
    function saatPenuh() { setPenuh(Boolean(document.fullscreenElement)) }
    document.addEventListener('fullscreenchange', saatPenuh)
    return function () {
      document.removeEventListener('fullscreenchange', saatPenuh)
      if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy() } catch (e) {}
        playerRef.current = null
      }
    }
  }, [])

  function sedangMain() {
    const p = playerRef.current
    return Boolean(p && p.getPlayerState && window.YT && p.getPlayerState() === window.YT.PlayerState.PLAYING)
  }

  function resetTimerSembunyi() {
    if (!dimulai) return
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (sedangMain()) {
      timerSembunyi.current = setTimeout(function () { setSembunyi(true) }, 2500)
    }
  }

  async function mulai() {
    setDimulai(true)
    setGagal(false)
    try {
      const YT = await muatApiYouTube()
      if (!wadahRef.current) return
      playerRef.current = new YT.Player(wadahRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1, controls: 0, modestbranding: 1, rel: 0, fs: 0,
          disablekb: 1, iv_load_policy: 3, playsinline: 1, autohide: 1,
          showinfo: 0, cc_load_policy: 0, origin: window.location.origin
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
              setMemutar(true); setBuffer(false); setSelesai(false)
              paksaKualitas(e.target); matikanSubtitel(e.target)
              resetTimerSembunyi()
            } else if (e.data === S.PAUSED) {
              setMemutar(false); setBuffer(false); setSembunyi(false)
            } else if (e.data === S.BUFFERING) {
              setBuffer(true)
            } else if (e.data === S.ENDED) {
              setMemutar(false); setSelesai(true); setSembunyi(false)
            }
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
    if (sedangMain()) p.pauseVideo()
    else p.playVideo()
  }

  function geser(ev) {
    const p = playerRef.current
    if (!p || !durasi) return
    const nilai = Number(ev.target.value)
    p.seekTo((nilai / 100) * durasi, true)
    setWaktu((nilai / 100) * durasi)
  }

  function aturVolume(ev) {
    const p = playerRef.current
    const nilai = Number(ev.target.value)
    setVolume(nilai)
    if (!p) return
    p.setVolume(nilai)
    if (nilai === 0) { p.mute(); setBisu(true) }
    else if (bisu) { p.unMute(); setBisu(false) }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); p.setVolume(volume || 100); setBisu(false) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = thumbPakaiHq
    ? 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
    : 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const kontrolSembunyi = dimulai && !gagal && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ cursor: kontrolSembunyi ? 'none' : 'default' }}
      onMouseMove={resetTimerSembunyi}
      onMouseLeave={function () { if (sedangMain()) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      {/* Wadah player: setelah diisi YouTube, iframe diposisikan CSS dengan margin crop 70px */}
      <div ref={wadahRef} className="h-full w-full" />

      {/* Perisai penangkap klik */}
      {dimulai && !selesai && !gagal ? (
        <button type="button" aria-label="Putar atau Jeda Video" onClick={jungkir}
          className="absolute inset-0 z-10 h-full w-full bg-transparent" style={{ cursor: kontrolSembunyi ? 'none' : 'default' }} />
      ) : null}

      {/* Poster awal dengan tombol putar minimalis */}
      {!dimulai ? (
        <div className="absolute inset-0 z-20">
          <img src={thumb} alt={props.title || 'Pratinjau video'} onError={function () { setThumbPakaiHq(true) }}
            className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={mulai} title="Putar Video"
              className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
              <IkonPlay className="ml-0.5 h-5 w-5" />
            </button>
          </div>
          {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
        </div>
      ) : null}

      {/* Layar akhir dengan putar ulang */}
      {selesai ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <button type="button" title="Putar Ulang"
              onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
              className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
              <IkonUlang />
            </button>
            <p className="text-xs font-semibold text-slate-200">Putar Ulang</p>
          </div>
        </div>
      ) : null}

      {/* Layar gagal */}
      {gagal ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
          <div className="flex flex-col items-center gap-2 px-6 text-center">
            <p className="text-sm font-semibold text-slate-200">Video Tidak Dapat Dimuat</p>
            <p className="text-xs text-slate-300">Periksa koneksi atau ketersediaan video di saluran.</p>
          </div>
        </div>
      ) : null}

      {/* Panel kontrol overlay di atas video */}
      {dimulai && !gagal ? (
        <div className={'absolute inset-x-0 bottom-0 z-30 flex items-center gap-2 sm:gap-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 sm:px-4 pb-3 pt-10 transition-opacity duration-300 ' + (kontrolSembunyi ? 'pointer-events-none opacity-0' : 'opacity-100')}>
          <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
            {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
          </button>
          <input type="range" min="0" max="100" step="0.1" value={persen} onChange={geser} title="Geser Durasi"
            className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, rgba(255,255,255,0.25) ' + persen + '%, rgba(255,255,255,0.25) 100%)' }} />
          <span className="min-w-[64px] sm:min-w-[84px] shrink-0 text-center text-[10px] sm:text-[11px] font-semibold tabular-nums text-slate-200">{formatWaktu(waktu)} / {formatWaktu(durasi)}</span>
          <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan Suara' : 'Bisukan'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {bisu ? <IkonBisu /> : <IkonSuara />}
          </button>
          <input type="range" min="0" max="100" value={bisu ? 0 : volume} onChange={aturVolume} title="Volume"
            className="pemutar-volume hidden sm:block h-1 w-16 shrink-0 cursor-pointer appearance-none rounded-full outline-none"
            style={{ background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) ' + (bisu ? 0 : volume) + '%, rgba(255,255,255,0.25) 100%)' }} />
          {buffer ? <span className="inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}
          <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar Layar Penuh' : 'Layar Penuh'}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            {penuh ? <IkonKecil /> : <IkonPenuh />}
          </button>
        </div>
      ) : null}
    </div>
  )
}
