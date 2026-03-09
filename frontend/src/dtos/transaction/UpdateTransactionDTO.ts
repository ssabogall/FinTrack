import type { TransactionInterface } from '@/interfaces/TransactionInterface';

export type UpdateTransactionDTO = Partial<
  Pick<TransactionInterface, 'amount' | 'description' | 'date' | 'categoryId' | 'goalId'>
>;
