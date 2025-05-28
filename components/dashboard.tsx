"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TaskList } from "./task-list"
import { CreateTaskDialog } from "./create-task-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { AiSuggestionsPanel } from "./ai-suggestions-panel"
import { useToast } from "@/hooks/use-toast"
import { LogOut, Plus, Moon, Sun, Brain, AlertCircle, RefreshCw, Settings } from "lucide-react"
import { useTheme } from "next-themes"

interface Task {
  id: string
  title: string
  description: string
  due_date: string | null
  status: "Open" | "Complete"
  created_at: string
  updated_at: string
}

interface ApiError {
  error: string
  code?: string
  details?: string
}

export function Dashboard() {
  const { user, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showAiPanel, setShowAiPanel] = useState(false)

  const fetchTasks = async () => {
    try {
      setError(null)
      console.log("Fetching tasks...")

      const response = await fetch("/api/tasks")
      const data = await response.json()

      console.log("Tasks response:", { status: response.status, data })

      if (response.ok) {
        setTasks(data)
      } else {
        const apiError = data as ApiError
        console.error("API Error:", apiError)

        if (apiError.code === "TABLE_NOT_FOUND") {
          setError("Database setup required. Please set up the database tables first.")
        } else {
          setError(apiError.error || "Failed to fetch tasks")
        }

        toast({
          title: "Error",
          description: apiError.error || "Failed to fetch tasks",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Network error:", error)
      const errorMessage = "Network error: Unable to connect to the server"
      setError(errorMessage)
      toast({
        title: "Network Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const checkDebugInfo = async () => {
    try {
      const response = await fetch("/api/debug")
      const data = await response.json()
      console.log("Debug info:", data)

      toast({
        title: "Debug Info",
        description: "Check browser console for detailed debug information",
      })
    } catch (error) {
      console.error("Debug check failed:", error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleTaskCreated = (newTask: Task) => {
    setTasks([newTask, ...tasks])
    toast({
      title: "Success",
      description: "Task created successfully",
    })
  }

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
    toast({
      title: "Success",
      description: "Task updated successfully",
    })
  }

  const handleTaskDeleted = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
    toast({
      title: "Success",
      description: "Task deleted successfully",
    })
  }

  const handleStatusToggle = async (taskId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Open" ? "Complete" : "Open"
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        handleTaskUpdated(updatedTask)
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to update task status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const completedTasks = tasks.filter((task) => task.status === "Complete").length
  const openTasks = tasks.filter((task) => task.status === "Open").length

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">AI Todo Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAiPanel(!showAiPanel)}
                className={showAiPanel ? "bg-primary text-primary-foreground" : ""}
              >
                <Brain className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon" onClick={checkDebugInfo} title="Debug Info">
                <Settings className="h-4 w-4" />
              </Button>
              <Avatar>
                <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                <AvatarFallback>{user?.user_metadata?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">{user?.user_metadata?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={fetchTasks}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{openTasks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Tasks</CardTitle>
                    <CardDescription>Manage your tasks with AI assistance</CardDescription>
                  </div>
                  <CreateTaskDialog onTaskCreated={handleTaskCreated}>
                    <Button disabled={!!error}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </CreateTaskDialog>
                </div>
              </CardHeader>
              <CardContent>
                <TaskList
                  tasks={tasks}
                  loading={loading}
                  onEdit={setEditingTask}
                  onDelete={handleTaskDeleted}
                  onStatusToggle={handleStatusToggle}
                />
              </CardContent>
            </Card>
          </div>

          {showAiPanel && (
            <div className="lg:col-span-1">
              <AiSuggestionsPanel tasks={tasks} />
            </div>
          )}
        </div>
      </main>

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onTaskUpdated={handleTaskUpdated}
        />
      )}
    </div>
  )
}
