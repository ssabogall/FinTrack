<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/utils/ChartUtils';
import { Formatters } from '@/utils/Formatters';

interface Props {
  labels: string[];
  amounts: number[];
  colors: string[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  if (props.labels.length === 0) return;

  chartInstance = ChartUtils.buildExpensesByCategoryDoughnut(
    canvasRef.value,
    props.labels,
    props.amounts,
    props.colors,
  );
};

onMounted(() => buildChart());

watch(
  () => [props.labels, props.amounts, props.colors],
  () => buildChart(),
  { deep: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Savings Distribution</h3>
      <p class="text-xs text-slate-500">By current saved amount</p>
    </header>

    <div v-if="labels.length === 0" class="py-10 text-center text-sm text-slate-400">
      No goals available.
    </div>

    <div v-else class="flex flex-col lg:flex-row items-center gap-6">
      <div class="h-56 w-56">
        <canvas ref="canvasRef" />
      </div>

      <ul class="w-full space-y-2">
        <li v-for="(label, idx) in labels" :key="label" class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-sm">
            <span
              class="w-3 h-3 rounded-full inline-block"
              :style="{ backgroundColor: colors[idx] }"
            />
            <span class="text-slate-600">{{ label }}</span>
          </div>
          <span class="font-medium text-[#0B2C3D]">
            {{ Formatters.formatCurrency(amounts[idx] ?? 0) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

