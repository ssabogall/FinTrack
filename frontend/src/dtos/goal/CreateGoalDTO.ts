// author: Santiago Sabogal
import type { GoalInterface } from '@/interfaces/GoalInterface';

export type CreateGoalDTO = Omit<
  GoalInterface,
  'id' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt' | 'transactionIds'
>;
