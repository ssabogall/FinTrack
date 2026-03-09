<script setup lang="ts">
interface Props {
  total: number;
  expense: number;
  income: number;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Total Categories -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Categories</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-tags text-[#0B2C3D]" />
        <span class="text-2xl font-bold text-[#0B2C3D]">{{ total }}</span>
      </div>
    </div>

    <!-- Expense Categories -->
    <div class="rounded-2xl border border-red-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Expense Categories</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-down text-red-500" />
        <span class="text-2xl font-bold text-red-500">{{ expense }}</span>
      </div>
    </div>

    <!-- Income Categories -->
    <div class="rounded-2xl border border-green-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Income Categories</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-up text-green-500" />
        <span class="text-2xl font-bold text-green-600">{{ income }}</span>
      </div>
    </div>
  </div>
</template>
