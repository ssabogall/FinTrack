// still dont know where to declare this type, but not here
export type UserRole = 'user' | 'admin';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  // relations
  transactionIds: number[] | null;
  goalIds: number[] | null;
}
