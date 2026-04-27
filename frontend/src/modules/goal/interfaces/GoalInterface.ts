// author: Santiago Gómez
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

  // derived (provided by the backend, recomputed on every read; optional
  // because some flows construct GoalInterface objects locally without
  // hitting the API and do not need these values).
  progressPercentage?: number;
  remaining?: number;

  // relations
  userId: number;
  transactionIds: number[] | null;
}
