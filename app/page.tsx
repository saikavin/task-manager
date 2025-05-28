"use client"

import { useAuth } from "./providers"
import { LoginForm } from "@/components/login-form"
import { Loader2, AlertCircle, Settings } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get("error")
    if (error) {
      setAuthError(decodeURIComponent(error))
    }
  }, [searchParams])

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">AI Todo Manager</h1>
            <p className="text-gray-600 dark:text-gray-300">Intelligent task management with AI-powered suggestions</p>
          </div>

          {authError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}

          <LoginForm />

          <div className="mt-6 text-center">
            <Link href="/setup">
              <Button variant="outline" className="w-full">
                <Settings className="w-4 h-4 mr-2" />
                Need help setting up authentication?
              </Button>
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>First time? Follow the setup guide above to configure OAuth providers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
