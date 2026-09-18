import { useEffect, useState } from 'react'
import { supabase } from './supabase.js'

const EMAIL_DOMAIN = '@mbsi.local'

export async function loginWithNim(nim, kode) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: nim.trim() + EMAIL_DOMAIN,
    password: kode
  })
  if (error) throw error
  return data
}

export async function logoutMahasiswa() {
  await supabase.auth.signOut()
}

async function cariMahasiswa(uid) {
  if (!uid) return null
  const { data } = await supabase
    .from('mahasiswa')
    .select('*')
    .eq('auth_uid', uid)
    .single()
  return data || null
}

export function useAuth() {
  const [mahasiswa, setMahasiswa] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(function () {
    let active = true

    async function sinkronkan(sessionUser) {
      try {
        let uid = sessionUser ? sessionUser.id : null

        if (!uid) {
          const { data } = await supabase.auth.getSession()
          uid = data.session ? data.session.user.id : null
        }

        if (!uid) {
          if (active) {
            setMahasiswa(null)
            setLoading(false)
          }
          return
        }

        const mhs = await cariMahasiswa(uid)
        if (active) {
          setMahasiswa(mhs)
          setLoading(false)
        }
      } catch (e) {
        if (active) setLoading(false)
      }
    }

    sinkronkan(null)

    function onVisibility() {
      if (document.visibilityState === 'visible') {
        sinkronkan(null)
      }
    }

    document.addEventListener('visibilitychange', onVisibility)

    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (event === 'SIGNED_OUT') {
        if (active) {
          setMahasiswa(null)
          setLoading(false)
        }
        return
      }

      sinkronkan(session && session.user ? session.user : null)
    })

    return function () {
      active = false
      document.removeEventListener('visibilitychange', onVisibility)
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { mahasiswa: mahasiswa, loading: loading }
}