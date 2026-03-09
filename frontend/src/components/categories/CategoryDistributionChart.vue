<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/utils/ChartUtils';

interface CategorySlice {
  name: string;
  amount: number;
  color: string;
}

interface Props {
  categories: CategorySlice[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  if (props.categories.length === 0) return;

  chartInstance = ChartUtils.buildCategoryDistributionPie(
    canvasRef.value,
    props.categories.map((c) => c.name),
    props.categories.map((c) => c.amount),
    props.categories.map((c) => c.color),
  );
};

onMounted(() => buildChart());

watch(
  () => props.categories,
  () => buildChart(),
  { deep: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Expense Distribution</h3>
      <p class="text-xs text-slate-500">Percentage distribution of expenses by category</p>
    </header>

    <div v-if="categories.length === 0" class="py-8 text-center text-sm text-slate-400">
      No expense data available.
    </div>

    <div v-else class="h-72">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
