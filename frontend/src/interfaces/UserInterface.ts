import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import type { GoalInterface } from '@/interfaces/GoalInterface';

export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  // relations
  transaction: TransactionInterface[];
  goal: GoalInterface[];
}