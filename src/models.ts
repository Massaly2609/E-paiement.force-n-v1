export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MENTOR' | 'VALIDATION';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  balance?: number;
}

export interface Mission {
  id: string;
  title: string;
  consultantName: string;
  status: 'ACTIVE' | 'COMPLETED' | 'PENDING';
  startDate: string;
  endDate: string;
}

export interface Report {
  id: string;
  missionId: string;
  missionTitle: string;
  consultantId: string;
  consultantName: string;
  period: string;
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';
  submittedAt: string;
  amount: number;
}

export interface Invoice {
  id: string;
  number: string;
  recipient: string;
  amount: number;
  status: 'UNPAID' | 'PAID' | 'PROCESSING';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

export interface KPI {
  label: string;
  value: string | number;
  trend: number; // percentage
  icon: string;
  color: string;
}