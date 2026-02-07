export type ApplicationStatus = 
  | 'WISHLIST'
  | 'APPLIED'
  | 'INTERVIEWING'
  | 'OFFER'
  | 'REJECTED';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  user_id: string;
  company_name: string;
  job_title: string;
  status: ApplicationStatus;
  job_url: string | null;
  location: string | null;
  applied_date: string | null;
  rejection_reason: string | null;
  created_at: string;
  last_updated: string;
}

export interface Note {
  id: string;
  application_id: string;
  content: string;
  created_at: string;
}

// For creating new applications (without auto-generated fields)
export interface CreateApplicationInput {
  company_name: string;
  job_title: string;
  status?: ApplicationStatus;
  job_url?: string;
  location?: string;
  applied_date?: string;
  rejection_reason?: string;
}

// For updating applications
export interface UpdateApplicationInput {
  company_name?: string;
  job_title?: string;
  status?: ApplicationStatus;
  job_url?: string;
  location?: string;
  rejection_reason?: string;
  applied_date?: string;
}

// Column configuration for Kanban board
export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  color: string;
}

export const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'WISHLIST', title: 'Wishlist', color: 'bg-slate-100' },
  { id: 'APPLIED', title: 'Applied', color: 'bg-slate-100' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'bg-slate-100' },
  { id: 'OFFER', title: 'Offer', color: 'bg-slate-100' },
  { id: 'REJECTED', title: 'Rejected', color: 'bg-slate-100' },
];
