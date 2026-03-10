<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/utils/ChartUtils';
import { Formatters } from '@/utils/Formatters';

interface Props {
  title: string;
  subtitle?: string;
  labels: string[];
  values: number[];
  colors: string[];
  emptyMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  emptyMessage: 'No data available.',
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  if (!props.labels.length || !props.values.length) return;

  chartInstance = ChartUtils.buildExpensesByCategoryDoughnut(
    canvasRef.value,
    props.labels,
    props.values,
    props.colors,
  );
};

onMounted(() => buildChart());

watch(
  () => [props.labels, props.values, props.colors],
  () => buildChart(),
  { deep: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-slate-500">{{ subtitle }}</p>
    </header>

    <div v-if="!labels.length || !values.length" class="py-10 text-center text-sm text-slate-400">
      {{ emptyMessage }}
    </div>

    <div v-else class="flex flex-col lg:flex-row items-center gap-6">
      <div class="h-56 w-56">
        <canvas ref="canvasRef" />
      </div>

      <ul class="w-full lg:w-auto lg:min-w-[260px] lg:max-w-sm space-y-2">
        <li
          v-for="(label, idx) in labels"
          :key="label"
          class="grid grid-cols-[1fr_auto] items-center gap-6 text-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full inline-block"
              :style="{ backgroundColor: colors[idx] }"
            />
            <span class="text-slate-600 truncate max-w-[150px] lg:max-w-[220px]">
              {{ label }}
            </span>
          </div>
          <span class="font-medium text-[#0B2C3D] text-right tabular-nums">
            {{ Formatters.formatCurrency(values[idx] ?? 0) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
