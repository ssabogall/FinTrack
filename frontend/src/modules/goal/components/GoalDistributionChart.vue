<!-- author: Santiago Sabogal -->
<script setup lang="ts">
// internal imports
import DonutMetricChart from '@/components/charts/DonutMetricChart.vue';

interface Props {
  labels: string[];
  amounts: number[];
  colors: string[];
}

const props = defineProps<Props>();
</script>

<template>
  <DonutMetricChart
    title="Savings Distribution"
    subtitle="By current saved amount"
    :labels="props.labels"
    :values="props.amounts"
    :colors="props.colors"
    empty-message="No goals available."
  />
</template>
