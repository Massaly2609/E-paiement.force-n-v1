
export type UserRole = 'ADMIN' | 'CONSULTANT' | 'MENTOR' | 'VALIDATION';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

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
