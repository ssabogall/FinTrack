export interface CategoryInterface {
  id: number;
  name: string;
  color: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  // relations
  userId: number;
  transactionIds: number[] | null;
}
