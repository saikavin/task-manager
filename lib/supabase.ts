import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { SupabaseClient } from "@supabase/supabase-js"

// Singleton pattern to prevent multiple instances
let supabaseClient: SupabaseClient | null = null

export const createClient = () => {
  // Reset client if we're in a new browser session
  if (typeof window !== "undefined" && !supabaseClient) {
    supabaseClient = createClientComponentClient({
      cookieOptions: {
        name: "sb-auth-token",
        lifetime: 60 * 60 * 8, // 8 hours
        domain: undefined,
        path: "/",
        sameSite: "lax",
      },
    })
  }

  if (!supabaseClient) {
    supabaseClient = createClientComponentClient()
  }

  return supabaseClient
}

// Reset client function for testing
export const resetClient = () => {
  supabaseClient = null
}
