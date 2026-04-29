import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: SupabaseClient | null = null

function initializeSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = initializeSupabase()
    if (!_supabase) {
      // Return a mock object that returns errors for all operations
      return {
        from: () => ({
          select: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          insert: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          update: async () => ({ data: null, error: new Error('Supabase not initialized') }),
          delete: async () => ({ data: null, error: new Error('Supabase not initialized') }),
        }),
        rpc: async () => ({ data: null, error: new Error('Supabase not initialized') }),
      } as any
    }
  }
  return _supabase
}

export const supabase = getSupabase()
