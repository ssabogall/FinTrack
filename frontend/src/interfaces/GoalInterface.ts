import type { UserInterface } from '@/interfaces/UserInterface';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';

export interface GoalInterface {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;

  // relations
  user: UserInterface;
  transaction: TransactionInterface;
}