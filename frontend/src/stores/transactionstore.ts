// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { TransactionInterface } from '@/interfaces/TransactionInterface';

export const useTransactionStore = defineStore('transaction', () => {
  const transactions = ref<TransactionInterface[]>([]);

  return { transactions };
});

