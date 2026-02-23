import type { UserInterface } from '@/interfaces/UserInterface';
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import type { GoalInterface } from '@/interfaces/GoalInterface';

export interface TransactionInterface {
  id: number;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // relations
  user: UserInterface;
  category: CategoryInterface;
  goal: GoalInterface;
}