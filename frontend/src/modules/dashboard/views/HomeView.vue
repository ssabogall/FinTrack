<!-- author: Lucas Higuita -->
<script setup lang="ts">
// external imports
import { computed } from 'vue';

// internal imports
import TransactionExpenseChart from '@/modules/transaction/components/TransactionExpenseChart.vue';
import TransactionMovementChart from '@/modules/transaction/components/TransactionMovementChart.vue';
import UserDashboardKpiCards from '@/modules/dashboard/components/UserDashboardKpiCards.vue';
import { AuthService } from '@/modules/auth/services/AuthService';
import { TransactionService } from '@/modules/transaction/services/TransactionService';
import AdminDashboardView from '@/modules/admin/views/AdminDashboardView.vue';

const isAdmin = computed(() => AuthService.isAdmin());

const currentUserId = computed((): number | null => AuthService.getCurrentUser()?.id ?? null);

const kpis = computed(() => {
  if (!currentUserId.value) return null;
  return TransactionService.getDashboardKpis(currentUserId.value);
});

const monthlyFlow = computed(() => {
  if (!currentUserId.value) {
    return { labels: [], income: [], expenses: [] };
  }
  return TransactionService.getMonthlyFlow(currentUserId.value, 6);
});

const monthlyFlowLabels = computed(() => monthlyFlow.value.labels);
const monthlyFlowIncome = computed(() => monthlyFlow.value.income);
const monthlyFlowExpenses = computed(() => monthlyFlow.value.expenses);

const expensesByCategory = computed(() => {
  if (!currentUserId.value) return [];
  return TransactionService.getExpensesByCategory(currentUserId.value);
});
</script>

<template>
  <AdminDashboardView v-if="isAdmin" />
  <section v-else class="space-y-6">
    <header>
      <h2 class="text-lg font-semibold text-[#0B2C3D]">Dashboard</h2>
      <p class="text-sm text-slate-500">Overview of your finances</p>
    </header>

    <UserDashboardKpiCards
      v-if="kpis"
      :balance="kpis.balance"
      :balance-change-pct="kpis.balanceChangePct"
      :monthly-income="kpis.monthlyIncome"
      :monthly-income-change-pct="kpis.monthlyIncomeChangePct"
      :monthly-expenses="kpis.monthlyExpenses"
      :monthly-expenses-change-pct="kpis.monthlyExpensesChangePct"
      :monthly-savings="kpis.monthlySavings"
      :monthly-savings-change-pct="kpis.monthlySavingsChangePct"
    />

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div class="xl:col-span-2">
        <TransactionMovementChart
          :labels="monthlyFlowLabels"
          :income-data="monthlyFlowIncome"
          :expense-data="monthlyFlowExpenses"
          title="Monthly Flow"
          subtitle="Income vs expenses for the last 6 months"
        />
      </div>
      <TransactionExpenseChart :categories="expensesByCategory" />
    </div>
  </section>
</template>
