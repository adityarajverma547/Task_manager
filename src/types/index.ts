export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  user_id: string;
  created_at: string;
  order: number;
  priority: number;
  project: string;
  labels: string[];
  attachments: Attachment[];
  assigned_to: string[];
  comments: Comment[];
  theme: 'light' | 'dark';
}

export interface User {
  id: string;
  email: string;
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
  uploaded_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_email: string;
  content: string;
  created_at: string;
}