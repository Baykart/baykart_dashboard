import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Create a single supabase client for the entire app
export const supabase = createSupabaseClient(
  import.meta.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
) 