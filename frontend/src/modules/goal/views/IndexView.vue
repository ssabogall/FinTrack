<!-- author: Santiago Sabogal -->
<script setup lang="ts">
// external imports
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

// internal imports
import GoalDistributionChart from '@/modules/goal/components/GoalDistributionChart.vue';
import GoalCard from '@/modules/goal/components/GoalCard.vue';
import GoalProgressChart from '@/modules/goal/components/GoalProgressChart.vue';
import GoalSummaryCards from '@/modules/goal/components/GoalSummaryCards.vue';
import { GoalService } from '@/modules/goal/services/GoalService';

// variables
const router = useRouter();

// reactive variables
const deleteError = ref<string | null>(null);
const statusFilter = ref<'all' | 'active' | 'completed'>('all');

// selectors
const allGoals = computed(() => GoalService.getForCurrentUser());

const goals = computed(() => {
  if (statusFilter.value === 'completed') {
    return allGoals.value.filter((g) => g.status === 'Completed');
  }
  if (statusFilter.value === 'active') {
    return allGoals.value.filter((g) => g.status !== 'Completed');
  }
  return allGoals.value;
});

const summary = computed(() => GoalService.getSummaryForCurrentUser());
const progressChart = computed(() => GoalService.getProgressChartForCurrentUser());
const distributionChart = computed(() => GoalService.getDistributionChartForCurrentUser());

const navigateToCreate = (): void => {
  router.push({ name: 'goal.create' });
};

const handleDelete = (id: number): void => {
  deleteError.value = null;
  try {
    GoalService.delete(id);
  } catch (err) {
    deleteError.value = err instanceof Error ? err.message : 'Could not delete goal.';
  }
};
</script>

<template>
  <section class="space-y-6">
    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-[#0B2C3D]">Savings Goals</h2>
        <p class="text-sm text-slate-500">Set and track your financial objectives</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[#E5A00D] text-white text-sm font-medium px-4 py-2 hover:bg-[#D49500] transition"
        @click="navigateToCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>New goal</span>
      </button>
    </header>

    <GoalSummaryCards
      :total-target="summary.totalTarget"
      :total-saved="summary.totalSaved"
      :active-count="summary.activeCount"
      :completed-count="summary.completedCount"
    />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2">
        <GoalProgressChart
          :labels="progressChart.labels"
          :saved="progressChart.saved"
          :remaining="progressChart.remaining"
        />
      </div>
      <GoalDistributionChart
        :labels="distributionChart.labels"
        :amounts="distributionChart.amounts"
        :colors="distributionChart.colors"
      />
    </div>

    <!-- Delete error -->
    <p
      v-if="deleteError"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ deleteError }}
    </p>

    <div class="flex items-center justify-end">
      <select
        v-model="statusFilter"
        class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
      >
        <option value="all">All goals</option>
        <option value="active">Active goals</option>
        <option value="completed">Completed goals</option>
      </select>
    </div>

    <!-- Empty state -->
    <div
      v-if="goals.length === 0"
      class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center space-y-3"
    >
      <div
        class="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl"
      >
        <i class="fas fa-bullseye" />
      </div>
      <p class="text-sm font-medium text-slate-600">No savings goals yet</p>
      <p class="text-xs text-slate-400">Create your first goal to start tracking your progress.</p>
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-4 py-2 hover:bg-[#0d3a52] transition"
        @click="navigateToCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>Create goal</span>
      </button>
    </div>

    <!-- Goals grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <GoalCard v-for="goal in goals" :key="goal.id" :goal="goal" @delete="handleDelete" />
    </div>
  </section>
</template>
