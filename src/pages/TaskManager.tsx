"use client"

import { useState, useEffect } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "../components/TaskCard"
import { TaskForm } from "../components/TaskForm"
import type { Task, User } from "../types"
import { supabase } from "../lib/supabase"
import { LogOut, Plus, Search, Moon, Sun } from "lucide-react"
import toast from "react-hot-toast"

interface TaskManagerProps {
  user: User
}

export function TaskManager({ user }: TaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<Task["status"] | "all">("all")
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    fetchTasks()
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark"
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    }
  }, [])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user.id).order("order")

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      toast.error("Failed to fetch tasks")
      console.error("Error fetching tasks:", error.message)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)

        // Update order in database
        newItems.forEach(async (task, index) => {
          try {
            const { error } = await supabase.from("tasks").update({ order: index }).eq("id", task.id)

            if (error) throw error
          } catch (error: any) {
            toast.error("Failed to update task order")
            console.error("Error updating task order:", error.message)
          }
        })

        return newItems
      })
    }
  }

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = {
        ...taskData,
        user_id: user.id,
        order: tasks.length,
        theme,
      }

      const { error } = await supabase.from("tasks").insert([newTask])

      if (error) throw error

      toast.success("Task created successfully")
      setIsFormOpen(false)
      fetchTasks()
    } catch (error: any) {
      toast.error("Failed to create task")
      console.error("Error creating task:", error.message)
    }
  }

  const handleUpdateTask = async (taskData: Partial<Task>) => {
    if (!editingTask) return

    try {
      const { error } = await supabase.from("tasks").update(taskData).eq("id", editingTask.id)

      if (error) throw error

      toast.success("Task updated successfully")
      setEditingTask(null)
      setIsFormOpen(false) // Close the form after update
      fetchTasks()
    } catch (error: any) {
      toast.error("Failed to update task")
      console.error("Error updating task:", error.message)
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      // Confirm deletion
      if (!window.confirm("Are you sure you want to delete this task?")) {
        return
      }

      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error

      toast.success("Task deleted successfully")
      fetchTasks()
    } catch (error: any) {
      toast.error("Failed to delete task")
      console.error("Error deleting task:", error.message)
    }
  }

  // Add a new function to handle attachment deletion
  const handleDeleteAttachment = async (taskId: string, attachmentIndex: number) => {
    try {
      // First get the current task
      const { data: taskData, error: fetchError } = await supabase
        .from("tasks")
        .select("attachments")
        .eq("id", taskId)
        .single()

      if (fetchError) throw fetchError

      // Remove the attachment at the specified index
      const updatedAttachments = [...(taskData.attachments || [])]
      updatedAttachments.splice(attachmentIndex, 1)

      // Update the task with the new attachments array
      const { error: updateError } = await supabase
        .from("tasks")
        .update({ attachments: updatedAttachments })
        .eq("id", taskId)

      if (updateError) throw updateError

      toast.success("Attachment deleted successfully")
      fetchTasks()
    } catch (error: any) {
      toast.error("Failed to delete attachment")
      console.error("Error deleting attachment:", error.message)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50"
  const textColor = theme === "dark" ? "text-white" : "text-gray-900"

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Task Manager</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-2 text-sm border rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
              />
            </div>
          </div>

          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Task["status"] | "all")}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus size={20} className="mr-2" />
              Add Task
            </button>
          </div>
        </div>

        {(isFormOpen || editingTask) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-semibold p-6 border-b dark:border-gray-700">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>
              <TaskForm
                task={editingTask || undefined}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setIsFormOpen(false)
                  setEditingTask(null)
                }}
                theme={theme}
              />
            </div>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filteredTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="grid gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={setEditingTask}
                  onDelete={handleDeleteTask}
                  onDeleteAttachment={handleDeleteAttachment}
                  theme={theme}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No tasks found. Create a new task to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}

