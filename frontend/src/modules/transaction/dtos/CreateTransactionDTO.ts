// author: Lucas Higuita
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';

export type CreateTransactionDTO = Omit<TransactionInterface, 'id' | 'createdAt' | 'updatedAt'>;
