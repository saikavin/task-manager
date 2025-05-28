"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Chrome, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  const handleSignIn = async (provider: "google" | "github") => {
    try {
      setLoading(provider)
      setError(null)

      console.log(`Attempting to sign in with ${provider}`)

      // Get the correct redirect URL - use production URL if available
      const getRedirectUrl = () => {
        if (typeof window !== "undefined") {
          // Check if we're in production/deployment
          const hostname = window.location.hostname
          if (hostname.includes("vercel.app") || hostname.includes("your-domain.com")) {
            return `${window.location.origin}/auth/callback`
          }
          // For local development
          if (hostname === "localhost") {
            return `${window.location.origin}/auth/callback`
          }
        }
        // Fallback
        return `${window.location.origin}/auth/callback`
      }

      const redirectTo = getRedirectUrl()
      console.log("Redirect URL:", redirectTo)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        console.error("OAuth error:", error)
        setError(error.message)
        toast({
          title: "Authentication Error",
          description: error.message,
          variant: "destructive",
        })
      } else {
        console.log("OAuth initiated successfully:", data)
        // The user will be redirected to the OAuth provider
      }
    } catch (error) {
      console.error("Sign in error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to sign in"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>Sign in to access your AI-powered task manager</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={() => handleSignIn("google")}
          variant="outline"
          className="w-full"
          size="lg"
          disabled={loading !== null}
        >
          {loading === "google" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="mr-2 h-4 w-4" />
          )}
          Continue with Google
        </Button>

        <Button
          onClick={() => handleSignIn("github")}
          variant="outline"
          className="w-full"
          size="lg"
          disabled={loading !== null}
        >
          {loading === "github" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          Continue with GitHub
        </Button>

        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>OAuth providers must be configured in Supabase</p>
          <div className="text-xs bg-muted p-2 rounded">
            <p>Current redirect: {typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : ""}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
