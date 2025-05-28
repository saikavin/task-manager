import { createRouteHandlerServerClient } from "@/lib/supabase-server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== DEBUG API ENDPOINT ===")

    // Check environment variables
    const envVars = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      KV_URL: !!process.env.KV_REST_API_URL,
      KV_TOKEN: !!process.env.KV_REST_API_TOKEN,
    }

    console.log("Environment variables:", envVars)

    // Test Supabase connection
    let supabaseTest = { connected: false, error: null, user: null }
    try {
      const supabase = createRouteHandlerServerClient()
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      supabaseTest = {
        connected: true,
        error: authError?.message || null,
        user: user ? { id: user.id, email: user.email } : null,
      }

      console.log("Supabase auth test:", supabaseTest)
    } catch (error) {
      supabaseTest = {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        user: null,
      }
      console.error("Supabase connection error:", error)
    }

    // Test database connection
    let dbTest = { connected: false, error: null, tablesExist: false }
    try {
      const supabase = createRouteHandlerServerClient()

      // Check if tasks table exists
      const { data, error } = await supabase.from("tasks").select("count(*)").limit(1)

      dbTest = {
        connected: true,
        error: error?.message || null,
        tablesExist: !error,
      }

      console.log("Database test:", dbTest)
    } catch (error) {
      dbTest = {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        tablesExist: false,
      }
      console.error("Database test error:", error)
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envVars,
      supabase: supabaseTest,
      database: dbTest,
      message: "Debug information collected successfully",
    })
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
