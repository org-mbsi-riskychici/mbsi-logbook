import { useEffect, useRef, useState } from 'react'

export default function Carousel(props) {
  const slides = props.slides || []
  const autoMs = props.autoMs || 4000
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const trackRef = useRef(null)
  const touchX = useRef(0)

  useEffect(function () {
    if (slides.length < 2 || paused) return undefined
    const t = setInterval(function () {
      setIdx(function (i) { return (i + 1) % slides.length })
    }, autoMs)
    return function () { clearInterval(t) }
  }, [slides.length, paused, autoMs])

  useEffect(function () {
    if (trackRef.current) trackRef.current.style.transform = 'translateX(-' + (idx * 100) + '%)'
  }, [idx])

  if (!slides.length) return null

  if (slides.length === 1) {
    const s = slides[0]
    return (
      <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900">
        {s.type === 'video'
          ? <video src={s.src} className="h-full w-full object-contain" muted preload="metadata" />
          : <img src={s.src} alt={s.title || 'Media'} className="h-full w-full object-contain" />}
      </div>
    )
  }

  return (
    <div
      className="media-carousel group"
      onMouseEnter={function () { setPaused(true) }}
      onMouseLeave={function () { setPaused(false) }}
      onTouchStart={function (e) { touchX.current = e.touches[0].clientX }}
      onTouchEnd={function (e) {
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) {
          setIdx(function (i) { return (i + (dx < 0 ? 1 : -1) + slides.length) % slides.length })
        }
      }}
    >
      <div ref={trackRef} className="carousel-track">
        {slides.map(function (s, i) {
          return (
            <div key={i} className="carousel-slide">
              {s.type === 'video'
                ? <video src={s.src} muted preload="metadata" />
                : <img src={s.src} alt={s.title || 'Media'} />}
              {s.title ? (
                <span className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded-lg bg-black/60 text-white text-xs max-w-[85%] truncate">
                  {s.title}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>

      <button
        onClick={function () { setIdx(function (i) { return (i - 1 + slides.length) % slides.length }) }}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
      >
        &#8249;
      </button>
      <button
        onClick={function () { setIdx(function (i) { return (i + 1) % slides.length }) }}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-black/40 text-white grid place-items-center opacity-100 xl:opacity-0 xl:group-hover:opacity-100 hover:bg-black/60"
      >
        &#8250;
      </button>

      <div className="absolute bottom-2 right-2 z-10 flex gap-1.5">
        {slides.map(function (s, i) {
          return (
            <button
              key={i}
              onClick={function () { setIdx(i) }}
              className={'carousel-dot h-2 w-2 rounded-full transition-all ' + (i === idx ? 'bg-white' : 'bg-white/40')}
            />
          )
        })}
      </div>
    </div>
  )
}
