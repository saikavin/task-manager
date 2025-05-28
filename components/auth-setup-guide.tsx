"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, ExternalLink, Copy, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  url?: string
}

export function AuthSetupGuide() {
  const { toast } = useToast()
  const [showSecrets, setShowSecrets] = useState(false)
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "deploy",
      title: "Deploy to Vercel",
      description: "Get your production URL first",
      completed: false,
      url: "https://vercel.com",
    },
    {
      id: "google-console",
      title: "Google Cloud Console",
      description: "Create OAuth credentials",
      completed: false,
      url: "https://console.cloud.google.com/",
    },
    {
      id: "github-oauth",
      title: "GitHub OAuth App",
      description: "Create GitHub OAuth application",
      completed: false,
      url: "https://github.com/settings/developers",
    },
    {
      id: "supabase-config",
      title: "Configure Supabase",
      description: "Add OAuth providers to Supabase",
      completed: false,
      url: "https://supabase.com/dashboard",
    },
  ])

  const toggleStep = (stepId: string) => {
    setSteps(steps.map((step) => (step.id === stepId ? { ...step, completed: !step.completed } : step)))
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    })
  }

  const currentUrl = typeof window !== "undefined" ? window.location.origin : "your-app.vercel.app"
  const supabaseUrl = "https://pwbrwodmwsksnhuffmew.supabase.co/auth/v1/callback"

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔐 Authentication Setup Guide
            <Badge variant="outline">Required for OAuth</Badge>
          </CardTitle>
          <CardDescription>Follow these steps to enable Google and GitHub authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Progress:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(steps.filter((s) => s.completed).length / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {steps.filter((s) => s.completed).length}/{steps.length}
            </span>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card key={step.id} className={step.completed ? "border-green-200 bg-green-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => toggleStep(step.id)} className="mt-1">
                      {step.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">
                          Step {index + 1}: {step.title}
                        </h3>
                        {step.url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={step.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </a>
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{step.description}</p>

                      {/* Step-specific content */}
                      {step.id === "deploy" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            1. Push your code to GitHub
                            <br />
                            2. Connect to Vercel and deploy
                            <br />
                            3. Note your production URL
                          </p>
                          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                            <code className="text-sm flex-1">{currentUrl}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(currentUrl, "Production URL")}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {step.id === "google-console" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            1. Create/select a project
                            <br />
                            2. Enable Google+ API
                            <br />
                            3. Create OAuth 2.0 Client ID
                            <br />
                            4. Add these URLs:
                          </p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Authorized JavaScript origins:</label>
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <code className="text-sm flex-1">{currentUrl}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(currentUrl, "JavaScript origin")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium">Authorized redirect URIs:</label>
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <code className="text-sm flex-1">{supabaseUrl}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(supabaseUrl, "Redirect URI")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === "github-oauth" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            1. Go to Settings → Developer settings → OAuth Apps
                            <br />
                            2. Click "New OAuth App"
                            <br />
                            3. Fill in the details:
                          </p>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs font-medium">Homepage URL:</label>
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <code className="text-sm flex-1">{currentUrl}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(currentUrl, "Homepage URL")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium">Authorization callback URL:</label>
                              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
                                <code className="text-sm flex-1">{supabaseUrl}</code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(supabaseUrl, "Callback URL")}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {step.id === "supabase-config" && (
                        <div className="space-y-2">
                          <p className="text-sm">
                            1. Go to Authentication → Providers
                            <br />
                            2. Enable Google and GitHub
                            <br />
                            3. Add your OAuth credentials from previous steps
                          </p>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <p className="text-sm text-yellow-800">
                              <strong>Important:</strong> You'll need the Client ID and Client Secret from both Google
                              and GitHub to complete this step.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Completion */}
          {steps.every((s) => s.completed) && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-green-800">
                    🎉 Authentication setup complete! You can now test Google and GitHub login.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📋 Quick Reference
            <Button variant="ghost" size="sm" onClick={() => setShowSecrets(!showSecrets)} className="ml-auto">
              {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSecrets ? "Hide" : "Show"} URLs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showSecrets && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Your URLs:</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Production URL:</strong> {currentUrl}
                  </div>
                  <div>
                    <strong>Supabase Callback:</strong> {supabaseUrl}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">What you need to collect:</h4>
                <ul className="text-sm space-y-1">
                  <li>• Google Client ID and Client Secret</li>
                  <li>• GitHub Client ID and Client Secret</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
