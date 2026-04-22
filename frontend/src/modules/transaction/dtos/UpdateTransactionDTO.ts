// author: Lucas Higuita
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';

export type UpdateTransactionDTO = Partial<
  Pick<TransactionInterface, 'amount' | 'description' | 'date' | 'categoryId' | 'goalId'>
>;
