<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Chart } from 'chart.js';

import type { GoalInterface } from '@/interfaces/GoalInterface';
import { Formatters } from '@/utils/Formatters';
import { GoalStatusHelper } from '@/utils/GoalStatusHelper';
import type { GoalStatus } from '@/utils/GoalStatusHelper';
import { ChartUtils } from '@/utils/ChartUtils';

interface Props {
  goal: GoalInterface;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'delete', id: number): void;
}>();

const router = useRouter();

const showConfirm = ref(false);

const isCompleted = computed((): boolean => props.goal.status === 'Completed');

const navigateToEdit = (): void => {
  router.push({ name: 'goal.edit', params: { id: props.goal.id } });
};

const requestDelete = (): void => {
  showConfirm.value = true;
};

const confirmDelete = (): void => {
  showConfirm.value = false;
  emit('delete', props.goal.id);
};

const cancelDelete = (): void => {
  showConfirm.value = false;
};

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const percentage = computed((): number => {
  if (props.goal.targetAmount <= 0) return 0;
  return Math.min(Math.round((props.goal.currentAmount / props.goal.targetAmount) * 100), 100);
});

const goalStatus = computed(
  (): GoalStatus => GoalStatusHelper.compute(props.goal.currentAmount, props.goal.targetAmount),
);

const statusColor = computed((): string => GoalStatusHelper.color(goalStatus.value));

const statusBgColor = computed((): string => GoalStatusHelper.bgColor(goalStatus.value));

const statusIcon = computed((): string => GoalStatusHelper.icon(goalStatus.value));

const remaining = computed((): number => {
  return Math.max(props.goal.targetAmount - props.goal.currentAmount, 0);
});

const buildChart = (): void => {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = ChartUtils.buildGoalProgressDoughnut(
    canvasRef.value,
    props.goal.currentAmount,
    remaining.value,
    statusColor.value,
  );
};

onMounted(() => buildChart());

watch(
  () => props.goal,
  () => buildChart(),
  { deep: true },
);
</script>

<template>
  <article
    class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition relative"
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
        <p class="text-sm font-semibold text-[#0B2C3D]">Delete this goal?</p>
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
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-[#0B2C3D] truncate">{{ goal.name }}</h3>
        <p v-if="goal.description" class="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {{ goal.description }}
        </p>
      </div>
      <span
        class="shrink-0 inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
        :style="{ backgroundColor: statusBgColor, color: statusColor }"
      >
        <i :class="['fas', statusIcon, 'text-[10px]']" />
        {{ goalStatus }}
      </span>
    </header>

    <!-- Chart + amounts -->
    <div class="flex items-center gap-6">
      <!-- Doughnut -->
      <div class="relative shrink-0">
        <canvas ref="canvasRef" width="100" height="100" />
        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span class="text-lg font-bold text-[#0B2C3D]">{{ percentage }}%</span>
        </div>
      </div>

      <!-- Amounts -->
      <div class="flex-1 space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Saved</span>
          <span class="font-semibold text-[#0B2C3D]">
            ${{ goal.currentAmount.toLocaleString() }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Target</span>
          <span class="font-semibold text-[#0B2C3D]">
            ${{ goal.targetAmount.toLocaleString() }}
          </span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-slate-500">Remaining</span>
          <span class="font-medium" :style="{ color: statusColor }">
            ${{ remaining.toLocaleString() }}
          </span>
        </div>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: percentage + '%', backgroundColor: statusColor }"
      />
    </div>

    <!-- Dates + actions -->
    <footer
      class="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-100"
    >
      <span>{{ Formatters.formatShortDate(goal.startDate) }}</span>

      <div class="flex items-center gap-3">
        <!-- Edit -->
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-medium text-[#0B2C3D] hover:text-[#1FA971] transition"
          @click="navigateToEdit"
        >
          <i class="fas fa-pencil-alt text-[10px]" />
          <span>Edit</span>
        </button>

        <!-- Delete — disabled if completed -->
        <button
          type="button"
          class="inline-flex items-center gap-1 text-xs font-medium transition"
          :class="
            isCompleted ? 'text-slate-300 cursor-not-allowed' : 'text-red-400 hover:text-red-600'
          "
          :disabled="isCompleted"
          :title="isCompleted ? 'Completed goals cannot be deleted' : 'Delete goal'"
          @click="requestDelete"
        >
          <i class="fas fa-trash-alt text-[10px]" />
          <span>Delete</span>
        </button>
      </div>

      <span>{{ Formatters.formatShortDate(goal.endDate) }}</span>
    </footer>
  </article>
</template>
