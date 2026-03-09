<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import GoalCard from '@/components/goals/GoalCard.vue';
import { AuthService } from '@/services/AuthService';
import { GoalService } from '@/services/GoalService';

const router = useRouter();

const deleteError = ref<string | null>(null);

const goals = computed(() => {
  const currentUser = AuthService.getCurrentUser();
  if (!currentUser) return [];
  return GoalService.getAll().filter((goal) => goal.userId === currentUser.id);
});

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
        <h2 class="text-lg font-semibold text-[#0B2C3D]">My savings goals</h2>
        <p class="text-sm text-slate-500">Track your progress towards each goal.</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium px-4 py-2 hover:bg-[#0d3a52] transition"
        @click="navigateToCreate"
      >
        <i class="fas fa-plus text-xs" />
        <span>New goal</span>
      </button>
    </header>

    <!-- Delete error -->
    <p
      v-if="deleteError"
      class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2"
    >
      {{ deleteError }}
    </p>

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
