import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider(props) {
  const [dark, setDark] = useState(function () {
    const saved = localStorage.getItem('mbsi-theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(function () {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('mbsi-theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <ThemeContext.Provider value={{ dark: dark, toggle: function () {
const ganti = function () { setDark(function (d) { return !d }) }
if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const akar = document.documentElement
  const vt = document.startViewTransition(function () {
    akar.classList.add('vt-tema')
    ganti()
  })
  const lepas = function () { akar.classList.remove('vt-tema') }
  vt.finished.then(lepas, lepas)
  setTimeout(lepas, 600)
} else ganti()
} }}>
      {props.children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
