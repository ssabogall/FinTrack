<!-- author: Lucas Higuita -->
<script setup lang="ts">
interface Props {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

defineProps<Props>();

const formatCurrency = (value: number): string => {
  return `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- Total Income -->
    <div class="rounded-2xl border border-green-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Income</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-up text-green-500" />
        <span class="text-2xl font-bold text-green-600">{{ formatCurrency(totalIncome) }}</span>
      </div>
    </div>

    <!-- Total Expenses -->
    <div class="rounded-2xl border border-red-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Expenses</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-down text-red-500" />
        <span class="text-2xl font-bold text-red-500">{{ formatCurrency(totalExpenses) }}</span>
      </div>
    </div>

    <!-- Balance -->
    <div class="rounded-2xl border border-blue-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Balance</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-wallet text-blue-600" />
        <span class="text-2xl font-bold text-[#0B2C3D]">{{ formatCurrency(balance) }}</span>
      </div>
    </div>
  </div>
</template>
