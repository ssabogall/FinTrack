<!-- author: Santiago Sabogal -->
<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/shared/utils/ChartUtils';

interface Props {
  labels: string[];
  saved: number[];
  remaining: number[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  if (props.labels.length === 0) return;

  chartInstance = ChartUtils.buildGoalsProgressStackedBar(
    canvasRef.value,
    props.labels,
    props.saved,
    props.remaining,
  );
};

onMounted(() => buildChart());

watch(
  () => [props.labels, props.saved, props.remaining],
  () => buildChart(),
  { deep: true },
);
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
    <header>
      <h3 class="text-base font-semibold text-[#0B2C3D]">Progress by Goal</h3>
      <p class="text-xs text-slate-500">Saved vs remaining for each objective</p>
    </header>

    <div v-if="labels.length === 0" class="py-10 text-center text-sm text-slate-400">
      No goals available.
    </div>

    <div v-else class="h-72">
      <canvas ref="canvasRef" />
    </div>
  </div>
</template>
