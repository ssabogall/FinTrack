// author: Santiago Sabogal
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

export type UpdateGoalDTO = Partial<
  Pick<GoalInterface, 'name' | 'description' | 'targetAmount' | 'startDate' | 'endDate'>
>;
