"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import type { Task } from "../types"
import { X, Paperclip, Upload } from "lucide-react"
import "./task-form.css" // Import the CSS file

interface TaskFormProps {
  task?: Task
  onSubmit: (task: Partial<Task>) => void
  onCancel: () => void
  theme?: "light" | "dark"
}

export function TaskForm({ task, onSubmit, onCancel, theme = "light" }: TaskFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    due_date: new Date().toISOString().split("T")[0],
    priority: 3,
    project: "",
    labels: [] as string[],
    assigned_to: [] as string[],
    attachments: [] as any[],
  })
  const [newLabel, setNewLabel] = useState("")
  const [uploadingFile, setUploadingFile] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        due_date: new Date(task.due_date).toISOString().split("T")[0],
        priority: task.priority,
        project: task.project || "",
        labels: task.labels || [],
        assigned_to: task.assigned_to || [],
        attachments: task.attachments || [],
      })
    }
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const addLabel = () => {
    if (newLabel && !formData.labels.includes(newLabel)) {
      setFormData({ ...formData, labels: [...formData.labels, newLabel] })
      setNewLabel("")
    }
  }

  const removeLabel = (label: string) => {
    setFormData({ ...formData, labels: formData.labels.filter((l) => l !== label) })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingFile(true)

    try {
      // In a real application, you would upload the file to a storage service
      // For this example, we'll simulate an upload by creating an object with file details
      const newAttachments = Array.from(files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file), // In a real app, this would be the URL from your storage service
        uploaded_at: new Date().toISOString(),
      }))

      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...newAttachments],
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      // Handle error (show toast, etc.)
    } finally {
      setUploadingFile(false)
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removeAttachment = (index: number) => {
    const updatedAttachments = [...formData.attachments]
    updatedAttachments.splice(index, 1)
    setFormData({ ...formData, attachments: updatedAttachments })
  }

  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white"
  const textColor = theme === "dark" ? "text-white" : "text-gray-700"
  const inputBg = theme === "dark" ? "bg-gray-700" : "bg-white"
  const borderColor = theme === "dark" ? "border-gray-600" : "border-gray-300"
  const themeClass = theme === "dark" ? "dark-theme" : "light-theme"

  return (
    <div className={`task-form-container ${themeClass} rounded-lg shadow-lg`}>
      <form 
        ref={formRef} 
        onSubmit={handleSubmit} 
        className={`form-appear space-y-4 ${bgColor} ${textColor} p-6 rounded-lg`}
      >
        <div className="form-section">
          <div className="form-field">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
              required
            />
          </div>

          <div className="form-field mt-4">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
              rows={3}
            />
          </div>
        </div>

        <div className="form-section grid grid-cols-2 gap-4">
          <div className="form-field">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task["status"] })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-field">
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
            >
              <option value="1">Low</option>
              <option value="2">Medium-Low</option>
              <option value="3">Medium</option>
              <option value="4">Medium-High</option>
              <option value="5">High</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <div className="form-field">
            <label className="block text-sm font-medium mb-1">Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
              placeholder="Project or category name"
            />
          </div>

          <div className="form-field mt-4">
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className={`w-full rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <label className="block text-sm font-medium mb-1">Labels</label>
          <div className="flex gap-2 mb-2 flex-wrap">
            {formData.labels.map((label) => (
              <span
                key={label}
                className="label-chip bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {label}
                <button type="button" onClick={() => removeLabel(label)} className="hover:text-blue-600">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className={`flex-1 rounded-md ${borderColor} ${inputBg} shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2`}
              placeholder="Add a label"
            />
            <button
              type="button"
              onClick={addLabel}
              className="animated-button px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        <div className="form-section">
          <label className="block text-sm font-medium mb-1">Attachments</label>
          <div className="space-y-2">
            {formData.attachments.map((attachment, index) => (
              <div 
                key={index} 
                className="attachment-item flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <Paperclip size={14} className="flex-shrink-0" />
                  <span className="text-sm truncate">{attachment.name}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => removeAttachment(index)} 
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" multiple />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
              className={`animated-button flex items-center gap-2 px-4 py-2 ${borderColor} rounded-md hover:bg-gray-50 dark:hover:bg-gray-700`}
            >
              <Upload size={16} />
              {uploadingFile ? "Uploading..." : "Upload Files"}
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className={`animated-button px-4 py-2 ${borderColor} rounded-md hover:bg-gray-50 dark:hover:bg-gray-700`}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="animated-button px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {task ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  )
}