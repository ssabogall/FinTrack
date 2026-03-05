export interface TransactionInterface {
  id: number;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // relations
  userId: number;
  categoryId: number | null;
  goalId: number | null;
}
