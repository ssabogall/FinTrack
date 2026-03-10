<script setup lang="ts">
// external imports
import { ref, watch } from 'vue';

// internal imports
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import type { GoalInterface } from '@/interfaces/GoalInterface';

interface Props {
  categories: CategoryInterface[];
  goals?: GoalInterface[];
  loading?: boolean;
  error?: string | null;
  initialValues?: {
    type?: string;
    amount?: number;
    description?: string;
    categoryId?: number | null;
    date?: string;
    goalId?: number | null;
  };
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
  initialValues: () => ({}),
});

const emit = defineEmits<{
  (
    e: 'submit',
    payload: {
      type: string;
      amount: number;
      description: string;
      categoryId: number | null;
      date: string;
      goalId: number | null;
    },
  ): void;
  (e: 'cancel'): void;
}>();

const type = ref(props.initialValues.type ?? 'expense');
const amount = ref<number | ''>(props.initialValues.amount ?? '');
const description = ref(props.initialValues.description ?? '');
const categoryId = ref<number | null>(props.initialValues.categoryId ?? null);
const date = ref(props.initialValues.date ?? new Date().toISOString().substring(0, 10));
const goalId = ref<number | null>(props.initialValues.goalId ?? null);

watch(
  () => props.initialValues,
  (values) => {
    type.value = values.type ?? 'expense';
    amount.value = values.amount ?? '';
    description.value = values.description ?? '';
    categoryId.value = values.categoryId ?? null;
    date.value = values.date ?? new Date().toISOString().substring(0, 10);
    goalId.value = values.goalId ?? null;
  },
);

const handleCategoryChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value;
  categoryId.value = value ? Number(value) : null;
};

const handleGoalChange = (event: Event): void => {
  const value = (event.target as HTMLSelectElement).value;
  goalId.value = value ? Number(value) : null;
};

const handleSubmit = (): void => {
  emit('submit', {
    type: type.value,
    amount: Number(amount.value),
    description: description.value,
    categoryId: categoryId.value,
    date: date.value,
    goalId: goalId.value,
  });
};
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    @click.self="emit('cancel')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md">
      <div class="px-6 pt-6 pb-2 flex items-start justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[#0B2C3D]">
            {{ props.initialValues.type !== undefined ? 'Edit Transaction' : 'New Transaction' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{
              props.initialValues.type !== undefined
                ? 'Update the transaction details.'
                : 'Record a new income or expense'
            }}
          </p>
        </div>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 transition"
          @click="emit('cancel')"
        >
          <i class="fas fa-times" />
        </button>
      </div>

      <form class="px-6 pb-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Type -->
        <div class="space-y-1">
          <label for="tx-type" class="block text-sm font-medium text-slate-700">Type</label>
          <select
            id="tx-type"
            v-model="type"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <!-- Amount -->
        <div class="space-y-1">
          <label for="tx-amount" class="block text-sm font-medium text-slate-700">Amount</label>
          <input
            id="tx-amount"
            v-model="amount"
            type="number"
            min="0.01"
            step="0.01"
            required
            placeholder="0.00"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <!-- Description -->
        <div class="space-y-1">
          <label for="tx-description" class="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="tx-description"
            v-model="description"
            rows="2"
            required
            placeholder="Describe the transaction..."
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent resize-none"
          />
        </div>

        <!-- Category -->
        <div class="space-y-1">
          <label for="tx-category" class="block text-sm font-medium text-slate-700">Category</label>
          <select
            id="tx-category"
            :value="categoryId ?? ''"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
            @change="handleCategoryChange"
          >
            <option value="">Select a category</option>
            <option v-for="cat in props.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Goal (optional) -->
        <div v-if="props.goals && props.goals.length" class="space-y-1">
          <label for="tx-goal" class="block text-sm font-medium text-slate-700">
            Goal <span class="text-slate-400 font-normal">(optional)</span>
          </label>
          <select
            id="tx-goal"
            :value="goalId ?? ''"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
            @change="handleGoalChange"
          >
            <option value="">No goal</option>
            <option v-for="goal in props.goals" :key="goal.id" :value="goal.id">
              {{ goal.name }}
            </option>
          </select>
        </div>

        <!-- Date -->
        <div class="space-y-1">
          <label for="tx-date" class="block text-sm font-medium text-slate-700">Date</label>
          <input
            id="tx-date"
            v-model="date"
            type="date"
            required
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
          />
        </div>

        <!-- Error -->
        <p v-if="props.error" class="text-sm text-red-600">{{ props.error }}</p>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2 hover:bg-slate-50 transition"
            @click="emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="props.loading"
            class="rounded-lg bg-[#E5A00D] text-white text-sm font-medium px-5 py-2 hover:bg-[#D49500] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span v-if="!props.loading">Save</span>
            <span v-else>Saving...</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
