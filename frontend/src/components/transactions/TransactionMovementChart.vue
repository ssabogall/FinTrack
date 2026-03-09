<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/utils/ChartUtils';

interface Props {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = ChartUtils.buildMovementTrendsLine(
    canvasRef.value,
    props.labels,
    props.incomeData,
    props.expenseData,
  );
};

onMounted(() => buildChart());

watch(
  () => [props.labels, props.incomeData, props.expenseData],
  () => buildChart(),
  {
    deep: true,
  },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Movement Trends</h3>
      <p class="text-xs text-slate-500">Income and expenses for the last 10 days</p>
    </header>
    <div class="h-72">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
