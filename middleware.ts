import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Allow auth callback route
    if (req.nextUrl.pathname.startsWith("/auth/callback")) {
      return res
    }

    // If user is not signed in and the current path is not the home page redirect the user to the home page
    if (!session && req.nextUrl.pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    // If user is signed in and the current path is the home page redirect the user to the dashboard
    if (session && req.nextUrl.pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    return res
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
