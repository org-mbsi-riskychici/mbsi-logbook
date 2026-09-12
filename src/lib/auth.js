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

export async function logoutPeserta() {
  await supabase.auth.signOut()
}

export function useAuth() {
  const [peserta, setPeserta] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      const { data } = await supabase.auth.getSession()
      const uid = data.session ? data.session.user.id : null
      if (!uid) {
        if (active) setLoading(false)
        return
      }
      const res = await supabase.from('peserta').select('*').eq('auth_uid', uid).single()
      if (active) {
        setPeserta(res.data)
        setLoading(false)
      }
    }
    load()
    const sub = supabase.auth.onAuthStateChange(function (event, session) {
      if (!session) setPeserta(null)
    })
    return function () {
      active = false
      sub.data.subscription.unsubscribe()
    }
  }, [])

  return { peserta: peserta, loading: loading }
}
