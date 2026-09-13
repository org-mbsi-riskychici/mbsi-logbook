const fs = require('fs')
const path = require('path')
const root = process.cwd()

function baca(rel) { return fs.readFileSync(path.join(root, rel), 'utf8').replace(/\r\n/g, '\n') }
function simpan(rel, isi) { fs.writeFileSync(path.join(root, rel), isi, 'utf8') }

console.log('Mulai menulis ulang PemutarVideo mengikuti referensi cropping YouTube...')
console.log('')

/* ===== 1. PemutarVideo.jsx: full rewrite dengan trik cropping ===== */
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
  try { if (p && typeof p.setPlaybackQualityRange === 'function') p.setPlaybackQualityRange('720', '1080') } catch (e) {}
}
function matikanSubtitel(p) {
  try { if (p && typeof p.unloadModule === 'function') p.unloadModule('captions') } catch (e) {}
  try { if (p && typeof p.setOption === 'function') p.setOption('captions', 'track', {}) } catch (e) {}
}

function IkonPlay({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M8 5v14l11-7z" /></svg> }
function IkonPause({ className }) { return <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-5 w-5'}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg> }
function IkonSuara({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}
function IkonBisu({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className || 'h-4 w-4'}>
      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  )
}
function IkonPenuh() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg> }
function IkonKecil() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg> }

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

  function resetTimerSembunyi() {
    if (timerSembunyi.current) clearTimeout(timerSembunyi.current)
    setSembunyi(false)
    if (memutar) {
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
    if (memutar) p.pauseVideo()
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
    else { if (bisu) { p.unMute(); setBisu(false) } }
  }

  function aturBisu() {
    const p = playerRef.current
    if (!p) return
    if (bisu) { p.unMute(); setBisu(false); p.setVolume(volume || 100) }
    else { p.mute(); setBisu(true) }
  }

  function aturPenuh() {
    const el = kotakRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else if (el.requestFullscreen) el.requestFullscreen()
  }

  const thumb = 'https://img.youtube.com/vi/' + youtubeId + '/maxresdefault.jpg'
  const thumbCadangan = 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg'
  const persen = durasi ? Math.min(100, (waktu / durasi) * 100) : 0
  const sembunyikanKontrol = dimulai && !gagal && memutar && sembunyi

  return (
    <div
      ref={kotakRef}
      className={'pemutar-referensi group relative overflow-hidden rounded-2xl bg-black shadow-xl ' + (props.className || 'aspect-video w-full')}
      style={{ maxWidth: penuh ? 'none' : undefined }}
      onMouseMove={dimulai ? resetTimerSembunyi : undefined}
      onMouseLeave={function () { if (memutar) { if (timerSembunyi.current) clearTimeout(timerSembunyi.current); setSembunyi(true) } }}
    >
      <div className="flex h-full flex-col">
        {/* Viewport video: area yang di-crop */}
        <div className="relative flex-1 overflow-hidden">
          <div ref={wadahRef} className="absolute" style={{ top: -60, left: -2, width: 'calc(100% + 4px)', height: 'calc(100% + 120px)', pointerEvents: 'none' }} />

          {/* Poster awal dengan tombol play tengah minimalis */}
          {!dimulai ? (
            <button
              type="button"
              onClick={mulai}
              className="absolute inset-0 z-20 flex items-center justify-center"
              style={{
                backgroundImage: 'url(' + thumb + ')',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: 'default'
              }}
            >
              <div className="grid h-12 w-12 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md transition hover:scale-110 hover:border-bsi-500 hover:bg-bsi-600">
                <IkonPlay className="ml-0.5 h-5 w-5" />
              </div>
              {props.title ? <p className="absolute bottom-3 left-4 right-4 truncate text-left text-sm font-semibold text-white drop-shadow-md">{props.title}</p> : null}
            </button>
          ) : null}

          {/* Overlay transparan penangkap klik saat video jalan */}
          {dimulai && !selesai && !gagal ? (
            <button
              type="button"
              aria-label="Putar atau jeda video"
              onClick={jungkir}
              className="absolute inset-0 z-10 h-full w-full bg-transparent"
              style={{ cursor: sembunyikanKontrol ? 'none' : 'default' }}
            />
          ) : null}

          {/* Ikon jeda besar di tengah saat dijeda manual */}
          {dimulai && !memutar && !buffer && !selesai && !gagal ? (
            <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-md">
                <IkonPlay className="ml-0.5 h-6 w-6" />
              </span>
            </div>
          ) : null}

          {/* Layar akhir */}
          {selesai ? (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/85 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <button type="button" title="Putar ulang"
                  onClick={function () { const p = playerRef.current; if (p) { p.seekTo(0, true); p.playVideo() } setSelesai(false) }}
                  className="grid h-14 w-14 place-items-center rounded-full bg-gold-500 text-slate-900 shadow-lg transition hover:scale-105">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
                <p className="text-xs font-semibold text-slate-200">Putar ulang</p>
              </div>
            </div>
          ) : null}

          {/* Layar gagal */}
          {gagal ? (
            <div className="absolute inset-0 z-30 grid place-items-center bg-black/90">
              <div className="flex flex-col items-center gap-2 px-6 text-center">
                <p className="text-sm font-semibold text-slate-200">Video tidak dapat dimuat</p>
                <p className="text-xs text-slate-400">Periksa koneksi atau ketersediaan video di saluran.</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Panel kontrol kustom (di luar viewport, jadi tidak ikut ter-crop) */}
        {dimulai && !gagal ? (
          <div
            className={'relative z-30 flex items-center gap-3 bg-slate-900/95 px-4 py-2.5 transition-opacity duration-400 ' + (sembunyikanKontrol ? 'opacity-0' : 'opacity-100')}
          >
            {/* Tombol play/pause */}
            <button type="button" onClick={jungkir} title={memutar ? 'Jeda' : 'Putar'}
              className="grid h-8 w-8 place-items-center rounded-full bg-bsi-700 text-white transition hover:bg-bsi-600">
              {memutar ? <IkonPause className="h-4 w-4" /> : <IkonPlay className="ml-0.5 h-4 w-4" />}
            </button>

            {/* Progress bar */}
            <div className="flex flex-1 items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={persen}
                onChange={geser}
                className="pemutar-progress h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-700 outline-none"
                style={{
                  background: 'linear-gradient(to right, #166534 0%, #166534 ' + persen + '%, #475569 ' + persen + '%, #475569 100%)'
                }}
              />
            </div>

            {/* Waktu */}
            <span className="min-w-[84px] text-center text-[11px] font-semibold tabular-nums text-slate-300">
              {formatWaktu(waktu)} / {formatWaktu(durasi)}
            </span>

            {/* Tombol bisu */}
            <button type="button" onClick={aturBisu} title={bisu ? 'Nyalakan suara' : 'Bisukan'}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              {bisu ? <IkonBisu /> : <IkonSuara />}
            </button>

            {/* Slider volume */}
            <input
              type="range"
              min="0"
              max="100"
              value={bisu ? 0 : volume}
              onChange={aturVolume}
              className="pemutar-volume h-1 w-16 cursor-pointer appearance-none rounded-full bg-slate-700 outline-none"
              style={{
                background: 'linear-gradient(to right, #eab308 0%, #eab308 ' + (bisu ? 0 : volume) + '%, #475569 ' + (bisu ? 0 : volume) + '%, #475569 100%)'
              }}
            />

            {/* Buffer indikator */}
            {buffer ? <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" /> : null}

            {/* Layar penuh */}
            <button type="button" onClick={aturPenuh} title={penuh ? 'Keluar layar penuh' : 'Layar penuh'}
              className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
              {penuh ? <IkonKecil /> : <IkonPenuh />}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  )
}
`)
console.log('[BERHASIL] src/components/PemutarVideo.jsx ditulis ulang mengikuti referensi')

/* ===== 2. CSS khusus untuk slider dan cropping ===== */
const FILE_CSS = 'src/index.css'
if (fs.existsSync(path.join(root, FILE_CSS))) {
  let css = baca(FILE_CSS)
  const aturan = `/* Pemutar video referensi: iframe cropping & slider custom */
.pemutar-referensi iframe {
  pointer-events: none;
  border: 0;
  background: transparent;
}
.pemutar-referensi:fullscreen {
  border-radius: 0;
  max-width: none;
  width: 100vw;
  height: 100vh;
}
.pemutar-progress::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-progress::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #166534;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}
.pemutar-volume::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #eab308;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0,0,0,0.4);
}`
  if (css.includes('.pemutar-referensi iframe')) {
    console.log('[SUDAH ADA] Aturan CSS pemutar-referensi')
  } else {
    css = css.trimEnd() + '\n\n' + aturan + '\n'
    simpan(FILE_CSS, css)
    console.log('[BERHASIL] Aturan CSS pemutar-referensi ditambahkan')
  }
}

console.log('')
console.log('Selesai. Hard refresh browser dengan Ctrl + Shift + R.')
console.log('')
console.log('Perubahan yang mengikuti referensimu:')
console.log('1. Trik cropping: iframe diposisikan top -60px, tinggi +120px sehingga chip channel, logo YouTube, dan judul bawaan terpotong keluar dari viewport.')
console.log('2. Poster memakai gambar maxresdefault resolusi tinggi dengan tombol play bulat minimalis ala referensimu, hover berubah jadi hijau BSI.')
console.log('3. Kontrol berada di luar viewport (di bawahnya), jadi tidak ikut ter-crop dan tetap terlihat jelas.')
console.log('4. Auto-hide kontrol setelah 2,5 detik tanpa aktivitas mouse saat video berjalan; kursor jadi none saat sembunyi.')
console.log('5. Slider volume terpisah dari tombol bisu, persis seperti di referensimu, dengan aksen emas BSI.')
console.log('6. Progress bar dengan thumb bulat putih berpinggiran hijau BSI.')
console.log('7. Fullscreen pada container, bukan iframe, sehingga cropping dan kontrol tetap aktif.')