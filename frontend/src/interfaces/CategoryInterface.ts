import type { TransactionInterface } from '@/interfaces/TransactionInterface';

export interface CategoryInterface {
  id: number;
  name: string;
  color: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;

  // relations
  transaction: TransactionInterface[];
}