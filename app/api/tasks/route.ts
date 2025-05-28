import { createRouteHandlerServerClient } from "@/lib/supabase-server"
import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis with error handling
let redis: Redis | null = null
try {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redis = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
} catch (error) {
  console.warn("Redis initialization failed:", error)
}

export async function GET() {
  try {
    console.log("=== GET /api/tasks ===")

    // Check environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Missing Supabase environment variables")
      return NextResponse.json(
        {
          error: "Server configuration error: Missing Supabase credentials",
        },
        { status: 500 },
      )
    }

    const supabase = createRouteHandlerServerClient()
    console.log("Supabase client created")

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("Auth check:", {
      hasUser: !!user,
      userId: user?.id,
      authError: authError?.message,
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Authentication error: " + authError.message }, { status: 401 })
    }

    if (!user) {
      console.error("No authenticated user")
      return NextResponse.json({ error: "Unauthorized: No user found" }, { status: 401 })
    }

    // Try to get from cache first (if Redis is available)
    let cachedTasks = null
    if (redis) {
      try {
        const cacheKey = `tasks:${user.id}`
        cachedTasks = await redis.get(cacheKey)
        console.log("Cache check:", { cacheKey, hasCachedData: !!cachedTasks })

        if (cachedTasks) {
          return NextResponse.json(cachedTasks)
        }
      } catch (cacheError) {
        console.warn("Cache error (continuing without cache):", cacheError)
      }
    }

    // Fetch from database
    console.log("Fetching tasks from database for user:", user.id)
    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    console.log("Database query result:", {
      tasksCount: tasks?.length || 0,
      error: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
    })

    if (error) {
      console.error("Database error:", error)

      // Check if it's a table not found error
      if (error.code === "PGRST116" || error.message?.includes('relation "tasks" does not exist')) {
        return NextResponse.json(
          {
            error: "Database not set up: Tasks table does not exist. Please run the database setup first.",
            code: "TABLE_NOT_FOUND",
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        {
          error: "Database error: " + error.message,
          code: error.code,
          details: error.details,
        },
        { status: 500 },
      )
    }

    // Cache the results for 5 minutes (if Redis is available)
    if (redis && tasks) {
      try {
        const cacheKey = `tasks:${user.id}`
        await redis.setex(cacheKey, 300, JSON.stringify(tasks))
        console.log("Tasks cached successfully")
      } catch (cacheError) {
        console.warn("Failed to cache tasks:", cacheError)
      }
    }

    console.log("Returning tasks:", tasks?.length || 0)
    return NextResponse.json(tasks || [])
  } catch (error) {
    console.error("Unexpected error in GET /api/tasks:", error)
    return NextResponse.json(
      {
        error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== POST /api/tasks ===")

    const supabase = createRouteHandlerServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error in POST:", authError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, due_date } = body

    console.log("Creating task:", { title, description, due_date, userId: user.id })

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        description: description?.trim() || "",
        due_date: due_date || null,
        user_id: user.id,
        status: "Open",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating task:", error)
      return NextResponse.json(
        {
          error: "Failed to create task: " + error.message,
          code: error.code,
        },
        { status: 500 },
      )
    }

    // Invalidate cache
    if (redis) {
      try {
        await redis.del(`tasks:${user.id}`)
      } catch (cacheError) {
        console.warn("Failed to invalidate cache:", cacheError)
      }
    }

    console.log("Task created successfully:", task.id)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Unexpected error in POST /api/tasks:", error)
    return NextResponse.json(
      {
        error: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
