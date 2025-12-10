export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MENTOR' | 'VALIDATION';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type MissionStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
export type ReportStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  is_hidden: boolean;
  avatar_url?: string;
  balance?: number;
  created_at?: string;
  phone?: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  consultant_id: string;
  status: MissionStatus;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Report {
  id: string;
  mission_id: string;
  consultant_id: string;
  period: string; // Ex: "Octobre 2024"
  amount: number;
  status: ReportStatus;
  file_url: string;
  submitted_at: string;
  comment?: string;
}