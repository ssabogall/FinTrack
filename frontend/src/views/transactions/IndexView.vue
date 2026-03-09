<script setup lang="ts">
// external imports
import { computed, ref } from 'vue';

// internal imports
import TransactionExpenseChart from '@/components/transactions/TransactionExpenseChart.vue';
import TransactionFilters from '@/components/transactions/TransactionFilters.vue';
import TransactionFormModal from '@/components/transactions/TransactionFormModal.vue';
import TransactionMovementChart from '@/components/transactions/TransactionMovementChart.vue';
import TransactionSummaryCards from '@/components/transactions/TransactionSummaryCards.vue';
import TransactionTable from '@/components/transactions/TransactionTable.vue';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import { AuthService } from '@/services/AuthService';
import { TransactionService } from '@/services/TransactionService';
import { useCategoryStore } from '@/stores/categorystore';
import { Formatters } from '@/utils/Formatters';

// stores
const categoryStore = useCategoryStore();

// reactive state
const showModal = ref(false);
const editingTransaction = ref<TransactionInterface | null>(null);
const formError = ref<string | null>(null);
const formLoading = ref(false);
const deleteError = ref<string | null>(null);

const filterState = ref<{ search: string; type: string; categoryId: number | null }>({
  search: '',
  type: 'all',
  categoryId: null,
});

// computed
const currentUserId = computed((): number | null => AuthService.getCurrentUser()?.id ?? null);

const userTransactions = computed((): TransactionInterface[] => {
  if (!currentUserId.value) return [];
  return TransactionService.getByUser(currentUserId.value).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
});

const filteredTransactions = computed((): TransactionInterface[] => {
  let result = userTransactions.value;

  const { search, type, categoryId } = filterState.value;

  if (search) {
    const q = search.toLowerCase();
    result = result.filter((t) => t.description.toLowerCase().includes(q));
  }

  if (type === 'income') {
    result = result.filter((t) => t.amount > 0);
  } else if (type === 'expense') {
    result = result.filter((t) => t.amount < 0);
  }

  if (categoryId !== null) {
    result = result.filter((t) => t.categoryId === categoryId);
  }

  return result;
});

const totalIncome = computed((): number => {
  if (!currentUserId.value) return 0;
  return TransactionService.getTotalIncome(currentUserId.value);
});

const totalExpenses = computed((): number => {
  if (!currentUserId.value) return 0;
  return TransactionService.getTotalExpenses(currentUserId.value);
});

const balance = computed((): number => {
  if (!currentUserId.value) return 0;
  return TransactionService.getBalance(currentUserId.value);
});

// Movement trends chart data (last 10 days)
const trendLabels = computed((): string[] => {
  const labels: string[] = [];
  const today = new Date();
  for (let i = 9; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  return labels;
});

const trendIncomeData = computed((): number[] => {
  const today = new Date();
  return Array.from({ length: 10 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (9 - idx));
    const dayStr = d.toDateString();
    return userTransactions.value
      .filter((t) => t.amount > 0 && new Date(t.date).toDateString() === dayStr)
      .reduce((sum, t) => sum + t.amount, 0);
  });
});

const trendExpenseData = computed((): number[] => {
  const today = new Date();
  return Array.from({ length: 10 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (9 - idx));
    const dayStr = d.toDateString();
    return userTransactions.value
      .filter((t) => t.amount < 0 && new Date(t.date).toDateString() === dayStr)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  });
});

// Expenses by category
const expensesByCategory = computed(() => {
  const map = new Map<number, { name: string; amount: number; color: string }>();
  for (const tx of userTransactions.value) {
    if (tx.amount >= 0 || !tx.categoryId) continue;
    const cat = categoryStore.categories.find((c) => c.id === tx.categoryId);
    if (!cat) continue;
    const existing = map.get(cat.id);
    if (existing) {
      existing.amount += Math.abs(tx.amount);
    } else {
      map.set(cat.id, { name: cat.name, amount: Math.abs(tx.amount), color: cat.color });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
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

const handleFormSubmit = (payload: {
  type: string;
  amount: number;
  description: string;
  categoryId: number | null;
  date: string;
}): void => {
  formLoading.value = true;
  formError.value = null;

  try {
    const signedAmount =
      payload.type === 'income' ? Math.abs(payload.amount) : -Math.abs(payload.amount);

    if (editingTransaction.value) {
      // Update
      TransactionService.update(editingTransaction.value.id, {
        amount: signedAmount,
        description: payload.description,
        categoryId: payload.categoryId,
        date: new Date(payload.date),
      });
    } else {
      // Create
      if (!currentUserId.value) return;

      TransactionService.create({
        amount: signedAmount,
        description: payload.description,
        date: new Date(payload.date),
        userId: currentUserId.value,
        categoryId: payload.categoryId,
        goalId: null,
      });
    }

    closeModal();
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    formLoading.value = false;
  }
};

const handleDelete = (id: number): void => {
  deleteError.value = null;
  try {
    TransactionService.delete(id);
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Could not delete transaction.';
  }
};
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
    <TransactionFilters :categories="categoryStore.categories" @filter="handleFilter" />

    <!-- Transaction table -->
    <TransactionTable
      :transactions="filteredTransactions"
      :categories="categoryStore.categories"
      @edit="openEdit"
      @delete="handleDelete"
    />

    <!-- Form modal -->
    <Teleport to="body">
      <TransactionFormModal
        v-if="showModal"
        :categories="categoryStore.categories"
        :loading="formLoading"
        :error="formError"
        :initial-values="modalInitialValues"
        @submit="handleFormSubmit"
        @cancel="closeModal"
      />
    </Teleport>
  </section>
</template>
