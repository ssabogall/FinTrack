import type { UserRole } from '@/interfaces/UserInterface';

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}
