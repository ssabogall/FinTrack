<!-- Author: Santiago Gómez Ospina -->

<script setup lang="ts">
// external imports
import { computed } from 'vue';

// internal imports
import AdminIncomeExpensesChart from '@/components/admin/AdminIncomeExpensesChart.vue';
import AdminOverviewCards from '@/components/admin/AdminOverviewCards.vue';
import AdminUserGrowthChart from '@/components/admin/AdminUserGrowthChart.vue';
import { AdminService } from '@/services/AdminService';

const overview = computed(() => AdminService.getGlobalOverview());

const monthlyTrend = computed(() => AdminService.getMonthlyTrend(7));

const userGrowth = computed(() => AdminService.getUserGrowthTrend(7));
</script>

<template>
  <section class="space-y-6">
    <header>
      <h2 class="text-lg font-semibold text-[#0B2C3D]">Platform Overview</h2>
      <p class="text-sm text-slate-500">Global financial and user metrics</p>
    </header>

    <AdminOverviewCards
      :total-income="overview.totalIncome"
      :total-expenses="overview.totalExpenses"
      :net-savings="overview.netSavings"
      :total-users="overview.totalUsers"
    />

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminIncomeExpensesChart
        :labels="monthlyTrend.labels"
        :income-data="monthlyTrend.income"
        :expense-data="monthlyTrend.expenses"
      />
      <AdminUserGrowthChart :labels="userGrowth.labels" :counts="userGrowth.counts" />
    </div>
  </section>
</template>
