<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { ref } from 'vue';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import { Formatters } from '@/utils/Formatters';

interface Props {
  category: CategoryInterface;
  transactionCount: number;
  totalAmount: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'edit', category: CategoryInterface): void;
  (e: 'delete', id: number): void;
}>();

const showConfirm = ref(false);

const isIncome = (type: string): boolean => type === 'income';

const requestDelete = (): void => {
  showConfirm.value = true;
};

const confirmDelete = (): void => {
  showConfirm.value = false;
  emit('delete', props.category.id);
};

const cancelDelete = (): void => {
  showConfirm.value = false;
};
</script>

<template>
  <article
    class="rounded-2xl border-t-4 border border-slate-200 bg-white shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition relative"
    :style="{ borderTopColor: category.color }"
  >
    <!-- Delete confirmation overlay -->
    <div
      v-if="showConfirm"
      class="absolute inset-0 z-10 rounded-2xl bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div
        class="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xl"
      >
        <i class="fas fa-trash-alt" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-[#0B2C3D]">Delete this category?</p>
        <p class="text-xs text-slate-500">This action cannot be undone.</p>
      </div>
      <div class="flex gap-2 w-full">
        <button
          type="button"
          class="flex-1 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium py-2 hover:bg-slate-50 transition"
          @click="cancelDelete"
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg bg-red-500 text-white text-xs font-medium py-2 hover:bg-red-600 transition"
          @click="confirmDelete"
        >
          Delete
        </button>
      </div>
    </div>

    <!-- Header -->
    <header class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          :style="{ backgroundColor: category.color + '20', color: category.color }"
        >
          <i
            :class="[
              'fas text-sm',
              isIncome(category.type) ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down',
            ]"
          />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-[#0B2C3D]">{{ category.name }}</h3>
          <span
            class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold mt-0.5"
            :class="
              isIncome(category.type) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
            "
          >
            {{ isIncome(category.type) ? 'Income' : 'Expense' }}
          </span>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-[#0B2C3D] hover:bg-slate-100 transition"
          title="Edit"
          @click="emit('edit', category)"
        >
          <i class="fas fa-pencil-alt text-xs" />
        </button>
        <button
          type="button"
          class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition"
          title="Delete"
          @click="requestDelete"
        >
          <i class="fas fa-trash-alt text-xs" />
        </button>
      </div>
    </header>

    <!-- Stats -->
    <div class="space-y-1.5 text-sm">
      <div class="flex justify-between">
        <span class="text-slate-500">Transactions</span>
        <span class="font-semibold text-[#0B2C3D]">{{ transactionCount }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-slate-500">Total amount</span>
        <span
          class="font-semibold"
          :class="isIncome(category.type) ? 'text-green-600' : 'text-red-500'"
        >
          {{ Formatters.formatCurrency(totalAmount) }}
        </span>
      </div>
    </div>
  </article>
</template>
