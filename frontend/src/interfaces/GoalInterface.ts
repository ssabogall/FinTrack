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
  userId: number;
  transactionIds: number[] | null;
}