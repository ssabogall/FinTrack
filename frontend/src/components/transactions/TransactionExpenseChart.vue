<script setup lang="ts">
// external imports
import { onMounted, ref, watch } from 'vue';
import type { Chart } from 'chart.js';

// internal imports
import { ChartUtils } from '@/utils/ChartUtils';
import { Formatters } from '@/utils/Formatters';

interface CategoryExpense {
  name: string;
  amount: number;
  color: string;
}

interface Props {
  categories: CategoryExpense[];
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const buildChart = (): void => {
  if (!canvasRef.value) return;
  if (chartInstance) chartInstance.destroy();

  chartInstance = ChartUtils.buildExpensesByCategoryDoughnut(
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
      <h3 class="text-base font-semibold text-[#0B2C3D]">Expenses by Category</h3>
      <p class="text-xs text-slate-500">Current distribution</p>
    </header>

    <div class="flex flex-col items-center gap-4">
      <div class="h-48 w-48">
        <canvas ref="canvasRef" />
      </div>

      <!-- Legend -->
      <ul class="w-full space-y-2">
        <li
          v-for="cat in categories"
          :key="cat.name"
          class="flex items-center justify-between text-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="w-3 h-3 rounded-full inline-block"
              :style="{ backgroundColor: cat.color }"
            />
            <span class="text-slate-600">{{ cat.name }}</span>
          </div>
          <span class="font-medium text-[#0B2C3D]">{{
            Formatters.formatCurrency(cat.amount)
          }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
