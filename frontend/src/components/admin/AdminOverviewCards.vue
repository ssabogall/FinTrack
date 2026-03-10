<!-- author: Santiago Gómez -->
<script setup lang="ts">
interface Props {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalUsers: number;
}

defineProps<Props>();
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <div
      class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
      style="border-top-color: #16a34a"
    >
      <p class="text-sm font-medium text-slate-500">Total Income</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-up text-green-600" />
        <span class="text-2xl font-bold text-green-600">
          ${{ totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
    </div>

    <div
      class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
      style="border-top-color: #ef4444"
    >
      <p class="text-sm font-medium text-slate-500">Total Expenses</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-arrow-trend-down text-red-500" />
        <span class="text-2xl font-bold text-red-500">
          ${{ totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
    </div>

    <div
      class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
      style="border-top-color: #0ea5e9"
    >
      <p class="text-sm font-medium text-slate-500">Net Savings</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-piggy-bank text-sky-500" />
        <span class="text-2xl font-bold text-sky-600">
          ${{ netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 }) }}
        </span>
      </div>
    </div>

    <div
      class="rounded-2xl border-t-4 border border-slate-200 bg-white px-6 py-5 space-y-2"
      style="border-top-color: #0b2c3d"
    >
      <p class="text-sm font-medium text-slate-500">Total Users</p>
      <div class="flex items-center gap-2">
        <i class="fas fa-users text-[#0B2C3D]" />
        <span class="text-2xl font-bold text-[#0B2C3D]">{{ totalUsers }}</span>
      </div>
    </div>
  </div>
</template>
