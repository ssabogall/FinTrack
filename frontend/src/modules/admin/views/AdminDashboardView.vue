<!-- Author: Santiago Gómez Ospina -->

<script setup lang="ts">
// external imports
import { computed, onMounted, ref } from 'vue';

// internal imports
import AdminIncomeExpensesChart from '@/modules/admin/components/AdminIncomeExpensesChart.vue';
import AdminOverviewCards from '@/modules/admin/components/AdminOverviewCards.vue';
import AdminUserGrowthChart from '@/modules/admin/components/AdminUserGrowthChart.vue';
import type {
  GlobalOverview,
  MonthlyTrend,
  UserGrowthTrend,
} from '@/modules/admin/services/AdminService';
import { AdminService } from '@/modules/admin/services/AdminService';

const overview = ref<GlobalOverview>({
  totalIncome: 0,
  totalExpenses: 0,
  netSavings: 0,
  totalUsers: 0,
});
const monthlyTrend = ref<MonthlyTrend>({ labels: [], income: [], expenses: [] });
const userGrowth = ref<UserGrowthTrend>({ labels: [], counts: [] });

const hasData = computed(
  () => monthlyTrend.value.labels.length > 0 || userGrowth.value.labels.length > 0,
);

onMounted(async () => {
  overview.value = await AdminService.getGlobalOverview();
  monthlyTrend.value = await AdminService.getMonthlyTrend(7);
  userGrowth.value = await AdminService.getUserGrowthTrend(7);
});
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

    <div v-if="hasData" class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminIncomeExpensesChart
        :labels="monthlyTrend.labels"
        :income-data="monthlyTrend.income"
        :expense-data="monthlyTrend.expenses"
      />
      <AdminUserGrowthChart :labels="userGrowth.labels" :counts="userGrowth.counts" />
    </div>
  </section>
</template>
