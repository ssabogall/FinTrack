// author: Santiago Gómez
// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<TransactionInterface[]>([]);

  return { transactions };
});
