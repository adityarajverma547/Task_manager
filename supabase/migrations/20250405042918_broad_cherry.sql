/*
  # Add Task Features

  1. New Columns
    - `priority` (integer) - Task priority level (1-5)
    - `project` (text) - Project or category name
    - `labels` (text[]) - Array of labels/tags
    - `attachments` (jsonb) - Array of attachment URLs and metadata
    - `assigned_to` (uuid[]) - Array of user IDs for task assignment
    - `comments` (jsonb) - Array of comment objects with user info and timestamps

  2. Changes
    - Add new columns to tasks table
    - Add indexes for improved query performance
    - Update RLS policies
*/

-- Add new columns to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS priority integer DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS project text,
ADD COLUMN IF NOT EXISTS labels text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS assigned_to uuid[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comments jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS theme text DEFAULT 'light';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority);
CREATE INDEX IF NOT EXISTS tasks_project_idx ON tasks(project);
CREATE INDEX IF NOT EXISTS tasks_labels_idx ON tasks USING gin(labels);

-- Update RLS policies for new features
CREATE POLICY "Users can view tasks they are assigned to"
ON tasks FOR SELECT
TO authenticated
USING (
  auth.uid() = ANY(assigned_to) OR 
  auth.uid() = user_id
);

CREATE POLICY "Users can update tasks they are assigned to"
ON tasks FOR UPDATE
TO authenticated
USING (
  auth.uid() = ANY(assigned_to) OR 
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = ANY(assigned_to) OR 
  auth.uid() = user_id
);