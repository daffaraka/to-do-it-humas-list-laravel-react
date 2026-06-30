export type ColumnId = 'new' | 'progress' | 'done';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface Role {
  id: string;
  name: string;
}

export type ActiveDepartmentType = string | 'all'; // ID of department or 'all'

export interface Board {
  id: string;
  title: string;
  description: string | null;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  departmentId: string;
  department?: Department;
  kpiId?: string | null;
  kpi?: Kpi;
  createdAt: string;
  updatedAt: string;
  tasks?: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  documentLink: string;
  requestDate: string | null;
  pic: string;
  columnId: ColumnId;
  boardId: string;
  departmentId: string;
  department?: Department;
  position: number;
  labels: CardLabel[];
  checklist: ChecklistItem[];
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export const COLUMNS: Column[] = [
  { id: 'new', title: 'New' },
  { id: 'progress', title: 'Progress' },
  { id: 'done', title: 'Selesai' },
];

export const AVAILABLE_LABELS: CardLabel[] = [
  { id: 'l1', name: 'Bug', color: '#ef4444' },
  { id: 'l2', name: 'Feature', color: '#6366f1' },
  { id: 'l3', name: 'Enhancement', color: '#8b5cf6' },
  { id: 'l4', name: 'Documentation', color: '#06b6d4' },
  { id: 'l5', name: 'Design', color: '#ec4899' },
  { id: 'l6', name: 'Urgent', color: '#f59e0b' },
  { id: 'l8', name: 'Frontend', color: '#3b82f6' },
];

export interface Kpi {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department?: Department;
  userId: string;
  user?: { id: string; name: string };
  targetDate: string;
  createdAt: string;
  updatedAt: string;
  boards?: Board[];
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  user?: { id: string; name: string; role?: Role };
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}
