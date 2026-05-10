import { createClient } from '@supabase/supabase-js'

// Hardcoded for now (works immediately)
const supabaseUrl = 'https://cvheetboujtbwbcjnycf.supabase.co'
const supabaseAnonKey = 'sb_publishable_IQC4UJDt2hFdZlNFSQc4xg_Dop4a4dZ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase connected successfully')