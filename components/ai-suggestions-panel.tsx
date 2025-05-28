"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Brain, Loader2, Lightbulb, Target, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  due_date: string | null
  status: "Open" | "Complete"
}

interface AiSuggestionsPanelProps {
  tasks: Task[]
}

export function AiSuggestionsPanel({ tasks }: AiSuggestionsPanelProps) {
  const [prompt, setPrompt] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleGetSuggestion = async (customPrompt?: string) => {
    const promptToUse = customPrompt || prompt
    if (!promptToUse.trim()) {
      toast({
        title: "Info",
        description: "Please enter a prompt or use a quick suggestion",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptToUse,
          context: `Current tasks: ${tasks.map((t) => `${t.title} (${t.status})`).join(", ")}`,
        }),
      })

      if (response.ok) {
        const { suggestion: aiSuggestion } = await response.json()
        setSuggestion(aiSuggestion)
      } else {
        toast({
          title: "Error",
          description: "Failed to get AI suggestion",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI suggestion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const quickPrompts = [
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "Suggest new tasks based on my current ones",
      prompt: "Based on my current tasks, suggest 3 new related tasks that would help me be more productive.",
    },
    {
      icon: <Target className="h-4 w-4" />,
      text: "Help prioritize my tasks",
      prompt: "Help me prioritize my current tasks. Which ones should I focus on first and why?",
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      text: "Plan my week",
      prompt: "Help me create a weekly plan based on my current tasks. Suggest a schedule and timeline.",
    },
  ]

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Assistant
        </CardTitle>
        <CardDescription>Get intelligent suggestions for your tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Ask for task suggestions, productivity tips, or planning help..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <Button onClick={() => handleGetSuggestion()} disabled={loading || !prompt.trim()} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Get AI Suggestion
          </Button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Quick Suggestions:</p>
          {quickPrompts.map((item, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleGetSuggestion(item.prompt)}
              disabled={loading}
            >
              <div className="flex items-start gap-2">
                {item.icon}
                <span className="text-xs">{item.text}</span>
              </div>
            </Button>
          ))}
        </div>

        {suggestion && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">AI Suggestion:</p>
            <p className="text-sm whitespace-pre-wrap">{suggestion}</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="mt-4 p-3 border rounded-lg">
            <p className="text-sm font-medium mb-2">Your Tasks Summary:</p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                Total: {tasks.length} | Open: {tasks.filter((t) => t.status === "Open").length} | Complete:{" "}
                {tasks.filter((t) => t.status === "Complete").length}
              </p>
              {tasks
                .filter((t) => t.status === "Open")
                .slice(0, 3)
                .map((task) => (
                  <p key={task.id} className="text-xs truncate">
                    • {task.title}
                  </p>
                ))}
              {tasks.filter((t) => t.status === "Open").length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{tasks.filter((t) => t.status === "Open").length - 3} more...
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
