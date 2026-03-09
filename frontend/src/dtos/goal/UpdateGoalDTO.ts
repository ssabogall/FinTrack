import type { GoalInterface } from '@/interfaces/GoalInterface';

export type UpdateGoalDTO = Partial<
  Pick<GoalInterface, 'name' | 'description' | 'targetAmount' | 'startDate' | 'endDate'>
>;
