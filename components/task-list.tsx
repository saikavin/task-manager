"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Calendar } from "lucide-react"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string
  due_date: string | null
  status: "Open" | "Complete"
  created_at: string
  updated_at: string
}

interface TaskListProps {
  tasks: Task[]
  loading: boolean
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onStatusToggle: (taskId: string, currentStatus: string) => void
}

export function TaskList({ tasks, loading, onEdit, onDelete, onStatusToggle }: TaskListProps) {
  const handleDelete = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onDelete(taskId)
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No tasks yet</p>
        <p className="text-gray-400 text-sm">Create your first task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className={`transition-all ${task.status === "Complete" ? "opacity-75" : ""}`}>
          <CardContent className="p-4">
            <div className="flex items-start space-x-4">
              <Checkbox
                checked={task.status === "Complete"}
                onCheckedChange={() => onStatusToggle(task.id, task.status)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`font-medium ${task.status === "Complete" ? "line-through text-gray-500" : ""}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant={task.status === "Complete" ? "secondary" : "default"}>{task.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => onEdit(task)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {task.description && (
                  <p className={`text-sm text-gray-600 mb-2 ${task.status === "Complete" ? "line-through" : ""}`}>
                    {task.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Due: {format(new Date(task.due_date), "MMM dd, yyyy")}</span>
                    </div>
                  )}
                  <span>Created: {format(new Date(task.created_at), "MMM dd, yyyy")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
