import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let _supabase: SupabaseClient | null = null

// Create a chainable mock that gracefully handles missing Supabase env vars
function createMockQueryBuilder() {
  const notInitializedError = { message: 'Supabase not initialized', code: 'NOT_INITIALIZED' }
  const mockResult = { data: null, error: notInitializedError, count: null }

  const chainable: any = {
    select: () => chainable,
    insert: () => chainable,
    update: () => chainable,
    delete: () => chainable,
    eq: () => chainable,
    neq: () => chainable,
    gt: () => chainable,
    gte: () => chainable,
    lt: () => chainable,
    lte: () => chainable,
    like: () => chainable,
    ilike: () => chainable,
    is: () => chainable,
    in: () => chainable,
    contains: () => chainable,
    containedBy: () => chainable,
    range: () => chainable,
    order: () => chainable,
    limit: () => chainable,
    offset: () => chainable,
    single: () => Promise.resolve(mockResult),
    maybeSingle: () => Promise.resolve(mockResult),
    then: (resolve: any) => resolve(mockResult),
  }

  return chainable
}

function createMockClient(): SupabaseClient {
  return {
    from: () => createMockQueryBuilder(),
    rpc: () => Promise.resolve({ data: null, error: { message: 'Supabase not initialized', code: 'NOT_INITIALIZED' } }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as any
}

function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[v0] Supabase env vars not set. Using mock client.')
    return createMockClient()
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey)
  return _supabase
}

export const supabase = getSupabase()

// Re-export for diagnostics
export { getSupabase }
