<!-- author: Santiago Sabogal -->
<script setup lang="ts">
// external imports
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// internal imports
import GoalForm from '@/modules/goal/components/GoalForm.vue';
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';
import { GoalService } from '@/modules/goal/services/GoalService';
import { Formatters } from '@/shared/utils/Formatters';

const route = useRoute();
const router = useRouter();

const goalId = computed((): number => Number(route.params.id));

const goal = ref<GoalInterface | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const success = ref<boolean>(false);
const hydrating = ref<boolean>(true);

const initialValues = computed(() => {
  if (!goal.value) return {};
  return {
    name: goal.value.name,
    description: goal.value.description,
    targetAmount: goal.value.targetAmount,
    startDate: Formatters.toDateInputValue(goal.value.startDate),
    endDate: Formatters.toDateInputValue(goal.value.endDate),
  };
});

const handleSubmit = async (payload: {
  name: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
}): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    await GoalService.updateGoal(goalId.value, {
      name: payload.name,
      description: payload.description,
      targetAmount: payload.targetAmount,
      startDate: payload.startDate,
      endDate: payload.endDate,
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

const loadGoal = async (): Promise<void> => {
  hydrating.value = true;
  try {
    goal.value = await GoalService.getGoalById(goalId.value);
  } catch {
    goal.value = null;
  } finally {
    hydrating.value = false;
  }
};

onMounted(loadGoal);
</script>

<template>
  <section class="max-w-xl mx-auto py-6">
    <!-- Hydrating skeleton -->
    <div
      v-if="hydrating"
      class="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-8 space-y-4"
    >
      <div class="h-5 w-2/3 rounded bg-slate-100 animate-pulse" />
      <div class="h-4 w-full rounded bg-slate-100 animate-pulse" />
      <div class="h-10 w-full rounded bg-slate-100 animate-pulse" />
      <div class="h-10 w-full rounded bg-slate-100 animate-pulse" />
      <div class="h-10 w-full rounded bg-slate-100 animate-pulse" />
    </div>

    <!-- Goal not found -->
    <div
      v-else-if="!goal"
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
    <div v-else class="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-8 space-y-6">
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
