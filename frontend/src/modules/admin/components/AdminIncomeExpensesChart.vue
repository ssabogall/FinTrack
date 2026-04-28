<!-- author: Santiago Gómez -->
<script setup lang="ts">
// external imports
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/shared/utils/ChartUtils';

interface Props {
  labels: string[];
  incomeData: number[];
  expenseData: number[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = async (): Promise<void> => {
  await nextTick();
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  if (props.labels.length === 0) return;

  chartInstance = ChartUtils.buildIncomeVsExpensesBar(
    canvasRef.value,
    props.labels,
    props.incomeData,
    props.expenseData,
  );
};

onMounted(async () => buildChart());
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.destroy();
});

watch(
  () => [props.labels, props.incomeData, props.expenseData],
  async () => buildChart(),
  { deep: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Income vs Expenses</h3>
      <p class="text-xs text-slate-500">Platform-wide financial overview (Last 7 months)</p>
    </header>

    <div v-if="labels.length === 0" class="py-8 text-center text-sm text-slate-400">
      No data available.
    </div>

    <div v-else class="h-64">
      <canvas ref="canvasRef" width="900" height="320" />
    </div>
  </div>
</template>
