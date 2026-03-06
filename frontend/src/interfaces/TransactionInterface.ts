export interface TransactionInterface {
  id: number;
  amount: number;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;

  // relations
  userId: number;
  categoryIds: number[] | null;
  goalIds: number[] | null;
}