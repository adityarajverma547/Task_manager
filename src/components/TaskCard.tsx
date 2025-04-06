"use client"

import { useState } from "react"
import type { Task, Comment } from "../types"
import { format } from "date-fns"
import { Edit2, Trash2, MessageSquare, Paperclip, Clock, Tag, GripVertical } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onDeleteAttachment?: (taskId: string, attachmentIndex: number) => void
  theme?: "light" | "dark"
}

export function TaskCard({ task, onEdit, onDelete, onDeleteAttachment, theme = "light" }: TaskCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showAttachments, setShowAttachments] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-gray-100 text-gray-800"
      case 2:
        return "bg-blue-100 text-blue-800"
      case 3:
        return "bg-yellow-100 text-yellow-800"
      case 4:
        return "bg-orange-100 text-orange-800"
      case 5:
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return "Low"
      case 2:
        return "Medium-Low"
      case 3:
        return "Medium"
      case 4:
        return "Medium-High"
      case 5:
        return "High"
      default:
        return "Medium"
    }
  }

  const isOverdue = new Date(task.due_date) < new Date() && task.status !== "completed"
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white"
  const textColor = theme === "dark" ? "text-white" : "text-gray-900"
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200"

  const renderAttachments = () => {
    if (!task.attachments || task.attachments.length === 0) return null

    return (
      <div className="mt-4 space-y-2">
        <button
          onClick={() => setShowAttachments(!showAttachments)}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <Paperclip size={14} />
          {task.attachments.length} attachments
        </button>

        {showAttachments && (
          <div className="space-y-2 mt-2">
            {task.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate">{attachment.name || attachment.url}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    View
                  </a>
                  {onDeleteAttachment && (
                    <button
                      onClick={() => onDeleteAttachment(task.id, index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${bgColor} ${textColor} p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow border ${borderColor} relative`}
    >
      {/* Drag handle */}
      <div 
        className="absolute top-2 left-2 cursor-move p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700" 
        {...attributes} 
        {...listeners}
      >
        <GripVertical size={16} className="text-gray-400" />
      </div>

      <div className="flex justify-between items-start mb-2 pl-6">
        <div>
          <h3 className="text-lg font-semibold">{task.title}</h3>
          {task.project && <span className="text-sm text-gray-500">Project: {task.project}</span>}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              onEdit(task)
            }}
            className="text-blue-500 hover:text-blue-700"
            aria-label="Edit task"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent event bubbling
              onDelete(task.id)
            }}
            className="text-red-500 hover:text-red-700"
            aria-label="Delete task"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-300 mb-3">{task.description}</p>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-2 py-1 rounded text-sm ${
              task.status === "completed"
                ? "bg-green-100 text-green-800"
                : task.status === "in-progress"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {task.status}
          </span>

          <span className={`px-2 py-1 rounded text-sm ${getPriorityColor(task.priority)}`}>
            {getPriorityLabel(task.priority)}
          </span>
        </div>

        {task.labels?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.labels.map((label) => (
              <span
                key={label}
                className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
              >
                <Tag size={12} />
                {label}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm">
          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-500" : "text-gray-500"}`}>
            <Clock size={14} />
            Due: {format(new Date(task.due_date), "MMM d, yyyy")}
            {isOverdue && " (Overdue)"}
          </span>

          {task.attachments?.length > 0 && (
            <span
              className="flex items-center gap-1 text-gray-500 cursor-pointer"
              onClick={() => setShowAttachments(!showAttachments)}
            >
              <Paperclip size={14} />
              {task.attachments.length} files
            </span>
          )}

          {task.comments?.length > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
            >
              <MessageSquare size={14} />
              {task.comments.length} comments
            </button>
          )}
        </div>

        {showComments && task.comments?.length > 0 && (
          <div className="mt-4 space-y-2">
            {task.comments.map((comment: Comment) => (
              <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{comment.user_email}</span>
                  <span className="text-gray-500">{format(new Date(comment.created_at), "MMM d, HH:mm")}</span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            ))}
          </div>
        )}

        {showAttachments && renderAttachments()}
      </div>
    </div>
  )
}