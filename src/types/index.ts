export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  members: string[];
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  assignedTo: string;
  dueDate: Date;
  createdAt: Date;
}

export interface MoodboardItem {
  id: string;
  projectId: string;
  type: 'image' | 'link';
  content: string;
  position: {
    x: number;
    y: number;
  };
  createdBy: string;
  createdAt: Date;
}