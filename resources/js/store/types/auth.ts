import { DatabaseStatus } from ".";

export enum UserRoles {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export interface AuthState {
  id: number;
  name: string;
  last_name: string;
  email: string;
  role: UserRoles;
  status: DatabaseStatus;
}