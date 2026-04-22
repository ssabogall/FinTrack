<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { ref } from 'vue';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import { Formatters } from '@/shared/utils/Formatters';

interface Props {
  transactions: TransactionInterface[];
  categories: CategoryInterface[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'edit', transaction: TransactionInterface): void;
  (e: 'delete', id: number): void;
}>();

const deleteConfirmId = ref<number | null>(null);
const openMenuId = ref<number | null>(null);

const getCategoryName = (categoryId: number | null): string => {
  if (!categoryId) return '—';
  const category = props.categories.find((c) => c.id === categoryId);
  return category?.name ?? '—';
};

const getCategoryColor = (categoryId: number | null): string => {
  if (!categoryId) return '#94A3B8';
  const category = props.categories.find((c) => c.id === categoryId);
  return category?.color ?? '#94A3B8';
};

const isIncome = (transaction: TransactionInterface): boolean => {
  return transaction.amount > 0;
};

const toggleMenu = (id: number): void => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const handleEdit = (transaction: TransactionInterface): void => {
  openMenuId.value = null;
  emit('edit', transaction);
};

const requestDelete = (id: number): void => {
  openMenuId.value = null;
  deleteConfirmId.value = id;
};

const confirmDelete = (): void => {
  if (deleteConfirmId.value !== null) {
    emit('delete', deleteConfirmId.value);
  }
  deleteConfirmId.value = null;
};

const cancelDelete = (): void => {
  deleteConfirmId.value = null;
};
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Transaction History</h3>
      <p class="text-xs text-slate-500">
        Showing {{ transactions.length }} transaction{{ transactions.length !== 1 ? 's' : '' }}
      </p>
    </header>

    <!-- Empty state -->
    <div
      v-if="transactions.length === 0"
      class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center space-y-2"
    >
      <i class="fas fa-receipt text-3xl text-slate-300" />
      <p class="text-sm text-slate-500">No transactions found.</p>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-slate-500 border-b border-slate-100">
            <th class="pb-3 font-medium">Description</th>
            <th class="pb-3 font-medium">Category</th>
            <th class="pb-3 font-medium">Date</th>
            <th class="pb-3 font-medium text-right">Amount</th>
            <th class="pb-3 w-12" />
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-50">
          <tr v-for="tx in transactions" :key="tx.id" class="group hover:bg-slate-50/50 transition">
            <!-- Description -->
            <td class="py-4 pr-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  :class="isIncome(tx) ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'"
                >
                  <i
                    :class="[
                      'fas text-xs',
                      isIncome(tx) ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
                    ]"
                  />
                </div>
                <span class="font-medium text-[#0B2C3D]">{{ tx.description }}</span>
              </div>
            </td>

            <!-- Category -->
            <td class="py-4 pr-4">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border"
                :style="{
                  color: getCategoryColor(tx.categoryId),
                  borderColor: getCategoryColor(tx.categoryId) + '40',
                  backgroundColor: getCategoryColor(tx.categoryId) + '10',
                }"
              >
                {{ getCategoryName(tx.categoryId) }}
              </span>
            </td>

            <!-- Date -->
            <td class="py-4 pr-4 text-slate-500">
              {{ Formatters.formatMediumDate(tx.date) }}
            </td>

            <!-- Amount -->
            <td
              class="py-4 text-right font-semibold"
              :class="isIncome(tx) ? 'text-green-600' : 'text-red-500'"
            >
              {{ isIncome(tx) ? '+' : '' }}{{ Formatters.formatCurrency(tx.amount) }}
            </td>

            <!-- Actions -->
            <td class="py-4 text-right relative">
              <button
                type="button"
                class="text-slate-400 hover:text-slate-600 transition p-1"
                @click="toggleMenu(tx.id)"
              >
                <i class="fas fa-ellipsis-h" />
              </button>

              <!-- Dropdown menu -->
              <div
                v-if="openMenuId === tx.id"
                class="absolute right-0 top-full mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1"
              >
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  @click="handleEdit(tx)"
                >
                  <i class="fas fa-pencil-alt text-xs text-slate-400" />
                  Edit
                </button>
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click="requestDelete(tx.id)"
                >
                  <i class="fas fa-trash-alt text-xs" />
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div
        v-if="deleteConfirmId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm space-y-4 text-center">
          <div
            class="w-14 h-14 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto text-2xl"
          >
            <i class="fas fa-trash-alt" />
          </div>
          <div class="space-y-1">
            <h3 class="text-base font-semibold text-[#0B2C3D]">Delete transaction?</h3>
            <p class="text-sm text-slate-500">This action cannot be undone.</p>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              class="flex-1 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium py-2 hover:bg-slate-50 transition"
              @click="cancelDelete"
            >
              Cancel
            </button>
            <button
              type="button"
              class="flex-1 rounded-lg bg-red-500 text-white text-sm font-medium py-2 hover:bg-red-600 transition"
              @click="confirmDelete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
