<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { Chart, ArcElement, DoughnutController, Tooltip } from 'chart.js';

import type { GoalInterface } from '@/interfaces/GoalInterface';
import { Formatters } from '@/utils/Formatters';

Chart.register(ArcElement, DoughnutController, Tooltip);

interface Props {
  goal: GoalInterface;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const percentage = computed((): number => {
  if (props.goal.targetAmount <= 0) return 0;
  return Math.min(
    Math.round((props.goal.currentAmount / props.goal.targetAmount) * 100),
    100,
  );
});

const statusColor = computed((): string => {
  if (percentage.value >= 100) return '#1FA971';
  if (percentage.value >= 50) return '#3B82F6';
  return '#F59E0B';
});

const remaining = computed((): number => {
  return Math.max(props.goal.targetAmount - props.goal.currentAmount, 0);
});

const buildChart = (): void => {
  if (!canvasRef.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvasRef.value, {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [props.goal.currentAmount, remaining.value],
          backgroundColor: [statusColor.value, '#E2E8F0'],
          borderWidth: 0,
          hoverOffset: 4,
        },
      ],
    },
    options: {
      cutout: '72%',
      responsive: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (ctx) => ` $${ctx.parsed.toLocaleString()}`,
          },
        },
        legend: { display: false },
      },
    },
  });
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
    class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col gap-4 hover:shadow-md transition"
  >
    <!-- Header -->
    <header class="flex items-start justify-between gap-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-[#0B2C3D] truncate">{{ goal.name }}</h3>
        <p v-if="goal.description" class="text-xs text-slate-500 mt-0.5 line-clamp-2">
          {{ goal.description }}
        </p>
      </div>
      <span
        class="shrink-0 text-xs font-medium px-2.5 py-1 rounded-full"
        :style="{ backgroundColor: statusColor + '20', color: statusColor }"
      >
        {{ percentage }}%
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

    <!-- Dates -->
    <footer class="flex justify-between text-xs text-slate-400 pt-1 border-t border-slate-100">
      <span>{{ Formatters.formatShortDate(goal.startDate) }}</span>
      <span>{{ Formatters.formatShortDate(goal.endDate) }}</span>
    </footer>
  </article>
</template>
