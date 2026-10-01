import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY
const adminUserIdFromEnv = process.env.ADMIN_USER_ID

if (!supabaseUrl || !supabasePublishableKey || !adminUserIdFromEnv) {
  throw new Error('Supabase Auth configuration is missing from the server environment')
}

export const adminUserId = adminUserIdFromEnv

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})