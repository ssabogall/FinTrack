<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { computed, onMounted, ref } from 'vue';

// internal imports
import TransactionExpenseChart from '@/modules/transaction/components/TransactionExpenseChart.vue';
import TransactionFilters from '@/modules/transaction/components/TransactionFilters.vue';
import TransactionFormModal from '@/modules/transaction/components/TransactionFormModal.vue';
import TransactionMovementChart from '@/modules/transaction/components/TransactionMovementChart.vue';
import TransactionSummaryCards from '@/modules/transaction/components/TransactionSummaryCards.vue';
import TransactionTable from '@/modules/transaction/components/TransactionTable.vue';
import type { TransactionFilterDTO } from '@/modules/transaction/dtos/TransactionFilterDTO';
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import { AuthService } from '@/modules/auth/services/AuthService';
import { CategoryService } from '@/modules/category/services/CategoryService';
import { TransactionService } from '@/modules/transaction/services/TransactionService';
import { GoalService } from '@/modules/goal/services/GoalService';
import { TransactionUtils } from '@/modules/transaction/utils/TransactionUtils';
import { Formatters } from '@/shared/utils/Formatters';

const userCategories = ref<CategoryInterface[]>([]);
const userGoals = ref<GoalInterface[]>([]);
const transactions = ref<TransactionInterface[]>([]);

const loadUserGoals = async (): Promise<void> => {
  try {
    userGoals.value = await GoalService.getGoals();
  } catch {
    userGoals.value = [];
  }
};

const loadUserCategories = async (): Promise<void> => {
  try {
    userCategories.value = await CategoryService.getAll();
  } catch {
    userCategories.value = [];
  }
};

// reactive state
const showModal = ref(false);
const editingTransaction = ref<TransactionInterface | null>(null);
const formError = ref<string | null>(null);
const formLoading = ref(false);
const deleteError = ref<string | null>(null);

const filterState = ref<TransactionFilterDTO>({
  search: '',
  type: 'all',
  categoryId: null,
} as TransactionFilterDTO);

// computed
const currentUserId = computed((): number | null => AuthService.getCurrentUser()?.id ?? null);
const transactionUtils = computed(
  () =>
    new TransactionUtils({ transactions: transactions.value, categories: userCategories.value }),
);

const filteredTransactions = computed((): TransactionInterface[] => {
  return transactionUtils.value.getFiltered(filterState.value);
});

const totalIncome = computed((): number => {
  return transactionUtils.value.getTotalIncome();
});

const totalExpenses = computed((): number => {
  return transactionUtils.value.getTotalExpenses();
});

const balance = computed((): number => {
  return transactionUtils.value.getBalance();
});

// Movement trends chart data (last 10 days)
const movementTrend = computed(() => {
  return transactionUtils.value.getMovementTrend(10);
});

const trendLabels = computed((): string[] => movementTrend.value.labels);
const trendIncomeData = computed((): number[] => movementTrend.value.income);
const trendExpenseData = computed((): number[] => movementTrend.value.expenses);

// Expenses by category
const expensesByCategory = computed(() => {
  return transactionUtils.value.getExpensesByCategory();
});

// Modal initial values for editing
const modalInitialValues = computed(() => {
  if (!editingTransaction.value) return undefined;
  const tx = editingTransaction.value;
  return {
    type: tx.amount > 0 ? 'income' : 'expense',
    amount: Math.abs(tx.amount),
    description: tx.description,
    categoryId: tx.categoryId,
    date: Formatters.toDateInputValue(tx.date),
    goalId: tx.goalId,
  };
});

// handlers
const openCreate = (): void => {
  editingTransaction.value = null;
  formError.value = null;
  showModal.value = true;
};

const openEdit = (transaction: TransactionInterface): void => {
  editingTransaction.value = transaction;
  formError.value = null;
  showModal.value = true;
};

const closeModal = (): void => {
  showModal.value = false;
  editingTransaction.value = null;
  formError.value = null;
};

const handleFilter = (payload: {
  search: string;
  type: string;
  categoryId: number | null;
}): void => {
  filterState.value = payload;
};

const handleFormSubmit = async (payload: {
  type: string;
  amount: number;
  description: string;
  categoryId: number | null;
  date: string;
  goalId: number | null;
}): Promise<void> => {
  formLoading.value = true;
  formError.value = null;

  try {
    const signedAmount =
      payload.type === 'income' ? Math.abs(payload.amount) : -Math.abs(payload.amount);

    if (editingTransaction.value) {
      // Update
      await TransactionService.update(editingTransaction.value.id, {
        amount: signedAmount,
        description: payload.description,
        categoryId: payload.categoryId,
        date: payload.date,
        goalId: payload.goalId,
      });
    } else {
      // Create
      if (!currentUserId.value) return;

      await TransactionService.create({
        amount: signedAmount,
        description: payload.description,
        date: payload.date,
        categoryId: payload.categoryId,
        goalId: payload.goalId,
      });
    }

    transactions.value = await TransactionService.getTransactions();
    await loadUserGoals();
    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    formLoading.value = false;
  }
};

const handleDelete = async (id: number): Promise<void> => {
  deleteError.value = null;
  try {
    await TransactionService.delete(id);
    transactions.value = await TransactionService.getTransactions();
    await loadUserGoals();
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Could not delete transaction.';
  }
};

onMounted(async () => {
  if (AuthService.isAuthenticated()) {
    await loadUserCategories();
    transactions.value = await TransactionService.getTransactions();
    await loadUserGoals();
  }
});
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-[#0B2C3D]">Transactions</h2>
        <p class="text-sm text-slate-500">Manage your income and expenses</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[#E5A00D] text-white text-sm font-medium px-4 py-2 hover:bg-[#D49500] transition"
        @click="openCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>New Transaction</span>
      </button>
    </header>

    <!-- Delete error -->
    <p
      v-if="deleteError"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ deleteError }}
    </p>

    <!-- Summary cards -->
    <TransactionSummaryCards
      :total-income="totalIncome"
      :total-expenses="totalExpenses"
      :balance="balance"
    />

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2">
        <TransactionMovementChart
          :labels="trendLabels"
          :income-data="trendIncomeData"
          :expense-data="trendExpenseData"
        />
      </div>
      <TransactionExpenseChart :categories="expensesByCategory" />
    </div>

    <!-- Filters -->
    <TransactionFilters :categories="userCategories" @filter="handleFilter" />

    <!-- Transaction table -->
    <TransactionTable
      :transactions="filteredTransactions"
      :categories="userCategories"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <!-- Form modal -->
    <Teleport to="body">
      <TransactionFormModal
        v-if="showModal"
        :categories="userCategories"
        :goals="userGoals"
        :loading="formLoading"
        :error="formError"
        :initial-values="modalInitialValues"
        @submit="handleFormSubmit"
        @cancel="closeModal"
      />
    </Teleport>
  </section>
</template>
