<!-- author: Santiago Gómez -->
<script setup lang="ts">
import { Formatters } from '@/utils/Formatters';

interface Props {
  balance: number;
  balanceChangePct: number;
  monthlyIncome: number;
  monthlyIncomeChangePct: number;
  monthlyExpenses: number;
  monthlyExpensesChangePct: number;
  monthlySavings: number;
  monthlySavingsChangePct: number;
}

const props = defineProps<Props>();

const isPositive = (value: number): boolean => value >= 0;
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    <!-- Total Balance -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Total Balance</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-[#0B2C3D]">
          {{ Formatters.formatCurrency(balance) }}
        </span>
        <span
          class="text-xs font-medium px-2 py-1 rounded-full"
          :class="
            isPositive(balanceChangePct)
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          "
        >
          {{ isPositive(balanceChangePct) ? '+' : '' }}{{ balanceChangePct.toFixed(1) }}% vs last
          month
        </span>
      </div>
    </div>

    <!-- Monthly Income -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Monthly Income</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-emerald-600">
          {{ Formatters.formatCurrency(monthlyIncome) }}
        </span>
        <span
          class="text-xs font-medium px-2 py-1 rounded-full"
          :class="
            isPositive(monthlyIncomeChangePct)
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          "
        >
          {{ isPositive(monthlyIncomeChangePct) ? '+' : '' }}{{
            monthlyIncomeChangePct.toFixed(1)
          }}% vs last month
        </span>
      </div>
    </div>

    <!-- Monthly Expenses -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Monthly Expenses</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-red-500">
          {{ Formatters.formatCurrency(monthlyExpenses) }}
        </span>
        <span
          class="text-xs font-medium px-2 py-1 rounded-full"
          :class="
            isPositive(-monthlyExpensesChangePct)
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          "
        >
          {{ monthlyExpensesChangePct.toFixed(1) }}% vs last month
        </span>
      </div>
    </div>

    <!-- Monthly Savings -->
    <div class="rounded-2xl border border-slate-200 bg-white px-6 py-5 space-y-2">
      <p class="text-sm font-medium text-slate-500">Monthly Savings</p>
      <div class="flex items-center justify-between">
        <span class="text-2xl font-bold text-sky-600">
          {{ Formatters.formatCurrency(monthlySavings) }}
        </span>
        <span
          class="text-xs font-medium px-2 py-1 rounded-full"
          :class="
            isPositive(monthlySavingsChangePct)
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-red-600'
          "
        >
          {{ isPositive(monthlySavingsChangePct) ? '+' : '' }}{{
            monthlySavingsChangePct.toFixed(1)
          }}% vs last month
        </span>
      </div>
    </div>
  </div>
</template>

