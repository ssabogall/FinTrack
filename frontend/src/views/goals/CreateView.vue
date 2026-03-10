<script setup lang="ts">
// external imports
import { ref } from 'vue';
import { useRouter } from 'vue-router';

// internal imports
import GoalForm from '@/components/goals/GoalForm.vue';
import { GoalService } from '@/services/GoalService';

// variables
const router = useRouter();

// reactive variables
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
  success.value = false;

  try {
    GoalService.createForCurrentUser(payload);

    success.value = true;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'An unexpected error occurred.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <section class="max-w-xl mx-auto py-6">
    <!-- Success state -->
    <div
      v-if="success"
      class="rounded-2xl border border-[#1FA971]/30 bg-[#1FA971]/10 px-6 py-8 text-center space-y-4"
    >
      <div
        class="w-14 h-14 rounded-full bg-[#1FA971] text-white flex items-center justify-center mx-auto text-2xl"
      >
        <i class="fas fa-check"></i>
      </div>
      <h3 class="text-lg font-semibold text-[#0B2C3D]">Goal created successfully!</h3>
      <p class="text-sm text-slate-500">Your savings goal has been saved.</p>
      <div class="flex gap-3 justify-center pt-2">
        <button
          type="button"
          class="rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-5 py-2 hover:bg-[#0d3a52] transition"
          @click="success = false"
        >
          Create another
        </button>
        <router-link
          :to="{ name: 'goal.index' }"
          class="rounded-lg border border-slate-300 text-slate-700 text-sm font-medium px-5 py-2 hover:bg-slate-50 transition"
        >
          View all goals
        </router-link>
      </div>
    </div>

    <!-- Form state -->
    <div v-else class="rounded-2xl border border-slate-200 bg-white shadow-sm px-8 py-8 space-y-6">
      <header class="space-y-1">
        <h2 class="text-xl font-semibold text-[#0B2C3D]">New savings goal</h2>
        <p class="text-sm text-slate-500">
          Define a target amount and a time frame to reach your goal.
        </p>
      </header>

      <GoalForm :loading="loading" :error="error" @submit="handleSubmit" />
    </div>
  </section>
</template>
