// author: Santiago Gómez
export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;

  // relations
  categoryIds: number[] | null;
  goalIds: number[] | null;
  transactionIds: number[] | null;
}
