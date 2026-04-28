// author: Santiago Gómez
export type GoalStatus = 'Active' | 'In Progress' | 'Completed';

export interface GoalInterface {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  status: GoalStatus;
  createdAt: Date;
  updatedAt: Date;

  // relations
  userId: number;
  transactionIds?: number[];
}
