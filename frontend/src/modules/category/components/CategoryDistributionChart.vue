<!-- author: Lucas Higuita -->
<script setup lang="ts">
// internal imports
import DonutMetricChart from '@/shared/components/charts/DonutMetricChart.vue';

interface CategorySlice {
  name: string;
  amount: number;
  color: string;
}

interface Props {
  categories: CategorySlice[];
}

const props = defineProps<Props>();
</script>

<template>
  <DonutMetricChart
    title="Expense Distribution"
    subtitle="Percentage distribution of expenses by category"
    :labels="props.categories.map((c) => c.name)"
    :values="props.categories.map((c) => c.amount)"
    :colors="props.categories.map((c) => c.color)"
    empty-message="No expense data available."
  />
</template>
