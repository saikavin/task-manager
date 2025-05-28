import { createRouteHandlerServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { prompt, context } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Get user's existing tasks for context
    const { data: tasks } = await supabase
      .from("tasks")
      .select("title, description, status, due_date")
      .eq("user_id", user.id)
      .limit(10)

    const systemPrompt = `You are a helpful AI assistant for a todo task management app. 
    Help users create better tasks, suggest improvements, or break down complex tasks.
    
    User's existing tasks: ${JSON.stringify(tasks || [])}
    
    Provide concise, actionable suggestions. If suggesting task breakdowns, format as a simple list.
    Keep responses under 200 words.`

    const { text } = await generateText({
      model: xai("grok-beta"),
      system: systemPrompt,
      prompt: `${prompt}${context ? `\n\nContext: ${context}` : ""}`,
      maxTokens: 300,
    })

    return NextResponse.json({ suggestion: text })
  } catch (error) {
    console.error("Error generating AI suggestion:", error)
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 })
  }
}
