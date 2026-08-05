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
  kategoriProgramId?: string | null;
  kategori_program_id?: string | null;
  kategoriProgram?: KategoriProgramKerja | null;
  kategori_program?: KategoriProgramKerja | null;
  kpiId?: string | null;
  kpi_id?: string | null;
  kpi?: Kpi;
  startDate?: string | null;
  targetDate?: string | null;
  kondisiAktual?: string | null;
  targetAkhirTahun?: string | null;
  outputAkhir?: string | null;
  prioritas?: 'low' | 'medium' | 'high' | string | null;
  bobotBoard?: number | string | null;
  score?: number;
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
  board?: Board;
  departmentId: string;
  department?: Department;
  position: number;
  labels: CardLabel[];
  checklist: ChecklistItem[];
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  attachment?: string | null;
  new_date?: string | null;
  proses_date?: string | null;
  end_date?: string | null;
  collaborators?: { id: string; name: string }[];
  histories?: TaskUserHistory[];
}

export interface TaskUserHistory {
  id: string;
  task_id: string;
  user_id: string;
  user?: { id: string; name: string };
  action: 'new' | 'update' | 'selesai';
  created_at: string;
  updated_at: string;
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
  { id: 'l1', name: 'Bug', color: 'bg-red-500 text-white' },
  { id: 'l2', name: 'Feature', color: 'bg-indigo-500 text-white' },
  { id: 'l3', name: 'Enhancement', color: 'bg-purple-500 text-white' },
  { id: 'l4', name: 'Documentation', color: 'bg-cyan-500 text-white' },
  { id: 'l5', name: 'Design', color: 'bg-pink-500 text-white' },
  { id: 'l6', name: 'Urgent', color: 'bg-amber-500 text-white' },
  { id: 'l8', name: 'Frontend', color: 'bg-blue-500 text-white' },
  { id: 'l9', name: 'Publikasi', color: 'bg-emerald-500 text-white' },
  { id: 'l10', name: 'Meeting', color: 'bg-purple-500 text-white' },
];

export interface KategoriProgramKerja {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Kpi {
  id: string;
  title: string;
  description: string | null;
  departmentId: string;
  department?: Department;
  userId: string;
  user?: { id: string; name: string };
  targetDate: string;
  bobot_kpi?: number | string | null;
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
