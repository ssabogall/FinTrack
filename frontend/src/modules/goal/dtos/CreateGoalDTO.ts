// author: Santiago Sabogal
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

export type CreateGoalDTO = Omit<
  GoalInterface,
  'id' | 'currentAmount' | 'status' | 'createdAt' | 'updatedAt' | 'transactionIds'
>;
