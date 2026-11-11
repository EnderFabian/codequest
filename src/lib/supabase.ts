import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const cloudEnabled = Boolean(url && key)

export const supabase = cloudEnabled ? createClient(url, key) : null

const ACCOUNT_DOMAIN = 'cuenta.codequest.app'

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}

export function isValidUsername(value: string) {
  return /^[a-z0-9._-]{3,24}$/.test(normalizeUsername(value))
}

export function usernameToEmail(username: string) {
  const name = normalizeUsername(username)
  return name.includes('@') ? name : `${name}@${ACCOUNT_DOMAIN}`
}
