<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import GoalForm from '@/componets/goals/GoalForm.vue';
import { GoalService } from '@/services/GoalService';

const route = useRoute();
const router = useRouter();

const goalId = computed((): number => Number(route.params.id));

const goal = computed(() => GoalService.getById(goalId.value));

const toDateInput = (date: Date | string): string => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString().substring(0, 10);
};

const initialValues = computed(() => {
  if (!goal.value) return {};
  return {
    name: goal.value.name,
    description: goal.value.description,
    targetAmount: goal.value.targetAmount,
    startDate: toDateInput(goal.value.startDate),
    endDate: toDateInput(goal.value.endDate),
  };
});

const loading = ref(false);
const error = ref<string | null>(null);
const success = ref(false);

const handleSubmit = (payload: {
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}): void => {
  loading.value = true;
  error.value = null;

  try {
    GoalService.update(goalId.value, {
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: new Date(payload.startDate),
      endDate: new Date(payload.endDate),
    });

    success.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
};

const goBack = (): void => {
  router.push({ name: 'goal.index' });
};
</script>

<template>
  <section class="max-w-xl mx-auto py-6">
    <!-- Goal not found -->
    <div
      v-if="!goal"
      class="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center space-y-3"
    >
      <p class="text-sm font-medium text-red-600">Goal not found.</p>
      <button
        type="button"
        class="rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-5 py-2 hover:bg-[#0d3a52] transition"
        @click="goBack"
      >
        Back to goals
      </button>
    </div>

    <!-- Success state -->
    <div
      v-else-if="success"
      class="rounded-2xl border border-[#1FA971]/30 bg-[#1FA971]/10 px-6 py-8 text-center space-y-4"
    >
      <div
        class="w-14 h-14 rounded-full bg-[#1FA971] text-white flex items-center justify-center mx-auto text-2xl"
      >
        <i class="fas fa-check" />
      </div>
      <h3 class="text-lg font-semibold text-[#0B2C3D]">Goal updated successfully!</h3>
      <p class="text-sm text-slate-500">Your changes have been saved.</p>
      <button
        type="button"
        class="rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-5 py-2 hover:bg-[#0d3a52] transition"
        @click="goBack"
      >
        Back to goals
      </button>
    </div>

    <!-- Edit form -->
    <div
      v-else
      class="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-8 space-y-6"
    >
      <header class="space-y-1">
        <h2 class="text-xl font-semibold text-[#0B2C3D]">Edit savings goal</h2>
        <p class="text-sm text-slate-500">Update the details of your goal.</p>
      </header>

      <GoalForm
        :loading="loading"
        :error="error"
        :initial-values="initialValues"
        submit-label="Update goal"
        @submit="handleSubmit"
      />
    </div>
  </section>
</template>
