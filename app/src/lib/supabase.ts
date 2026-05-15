// Supabase client configuration
// In production, replace with your actual Supabase URL and anon key

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export { SUPABASE_URL, SUPABASE_ANON_KEY }

// Mock Supabase client for demo purposes
// Replace with actual createClient when you have a Supabase project
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        order: () => ({
          limit: () => ({ data: [], error: null }),
          data: [],
          error: null,
        }),
        data: [],
        error: null,
      }),
      order: () => ({
        limit: () => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      limit: () => ({ data: [], error: null }),
      data: [],
      error: null,
    }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
  }),
}
