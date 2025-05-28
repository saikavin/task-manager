import { createRouteHandlerServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")

    console.log("Auth callback received:", {
      code: !!code,
      error,
      errorDescription,
      url: requestUrl.toString(),
    })

    if (error) {
      console.error("OAuth error in callback:", error, errorDescription)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin),
      )
    }

    if (code) {
      const supabase = createRouteHandlerServerClient()

      try {
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (exchangeError) {
          console.error("Error exchanging code for session:", exchangeError)
          return NextResponse.redirect(
            new URL(`/?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin),
          )
        }

        if (data.user) {
          console.log("Successfully authenticated user:", data.user.email)

          // Set a success cookie to help with client-side state
          const response = NextResponse.redirect(new URL("/dashboard", requestUrl.origin))
          response.cookies.set("auth-success", "true", {
            maxAge: 60, // 1 minute
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
          })

          return response
        }
      } catch (exchangeError) {
        console.error("Exception during code exchange:", exchangeError)
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent("Authentication failed")}`, requestUrl.origin),
        )
      }
    }

    // No code or error, redirect to home
    console.log("No code received, redirecting to home")
    return NextResponse.redirect(new URL("/", requestUrl.origin))
  } catch (error) {
    console.error("Unexpected error in auth callback:", error)
    return NextResponse.redirect(new URL("/?error=Authentication failed", request.url))
  }
}
