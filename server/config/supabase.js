import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_PROJECT_URL
const supabaseKey = process.env.SUPABASE_KEY

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export const getSupabaseClient = (token) => {
  if (!token) return supabase
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  })
}