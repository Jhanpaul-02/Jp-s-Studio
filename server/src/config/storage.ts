import { createClient } from '@supabase/supabase-js'

let storageClient: ReturnType<typeof createClient> | null = null

export function getStorageClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !secretKey) {
    return null
  }

  storageClient ??= createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return storageClient
}