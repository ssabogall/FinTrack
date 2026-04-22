<!-- author: Santiago Gómez -->
<script setup lang="ts">
// external imports
import { computed, ref } from 'vue';

// internal imports
import AdminIncomeExpensesChart from '@/modules/admin/components/AdminIncomeExpensesChart.vue';
import AdminOverviewCards from '@/modules/admin/components/AdminOverviewCards.vue';
import AdminUserGrowthChart from '@/modules/admin/components/AdminUserGrowthChart.vue';
import { AdminService } from '@/modules/admin/services/AdminService';
import { ReportUtils } from '@/shared/utils/ReportUtils';

const selectedYear = ref(new Date().getFullYear());
const selectedMonth = ref(new Date().getMonth() + 1);

const selectedDateLabel = computed((): string =>
  new Date(selectedYear.value, selectedMonth.value - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  }),
);

const overview = computed(() => AdminService.getGlobalOverview());

const monthlyTrend = computed(() => AdminService.getMonthlyTrend(7));

const userGrowth = computed(() => AdminService.getUserGrowthTrend(7));

const monthlySummary = computed(() =>
  AdminService.getMonthlySummary(selectedYear.value, selectedMonth.value),
);

const transactionsForMonth = computed(() =>
  AdminService.getTransactionsForMonth(selectedYear.value, selectedMonth.value),
);

const usersWithStats = computed(() => AdminService.getUsersWithStats());

const categoryBreakdown = computed(() =>
  AdminService.getCategoryBreakdownForMonth(selectedYear.value, selectedMonth.value),
);

const handleGenerateMonthlySummary = (): void => {
  const { income, expenses, netSavings, transactionCount } = monthlySummary.value;
  ReportUtils.downloadMonthlyFinancialSummary(
    selectedYear.value,
    selectedMonth.value,
    income,
    expenses,
    netSavings,
    transactionCount,
  );
};

const handleGenerateTransactionReport = (): void => {
  ReportUtils.downloadTransactionReport(
    transactionsForMonth.value,
    selectedYear.value,
    selectedMonth.value,
    AdminService.getUserName,
  );
};

const handleGenerateUserActivityReport = (): void => {
  ReportUtils.downloadUserActivityReport(
    usersWithStats.value,
    selectedYear.value,
    selectedMonth.value,
  );
};

const handleGenerateCategoryAnalysis = (): void => {
  ReportUtils.downloadCategoryAnalysisReport(
    categoryBreakdown.value,
    selectedYear.value,
    selectedMonth.value,
  );
};
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-[#0B2C3D]">Reports</h2>
        <p class="text-sm text-slate-500">Generate and analyze financial reports</p>
      </div>
      <div class="flex items-center gap-2">
        <i class="fas fa-calendar-alt text-slate-400" />
        <select
          v-model="selectedMonth"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        >
          <option v-for="m in 12" :key="m" :value="m">
            {{ new Date(2000, m - 1).toLocaleDateString('en-US', { month: 'long' }) }}
          </option>
        </select>
        <select
          v-model="selectedYear"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2C3D] focus:border-transparent"
        >
          <option v-for="y in 5" :key="y" :value="new Date().getFullYear() - 5 + y">
            {{ new Date().getFullYear() - 5 + y }}
          </option>
        </select>
      </div>
    </header>

    <!-- Report cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-[#0B2C3D]/10 flex items-center justify-center text-[#0B2C3D]"
          >
            <i class="fas fa-file-invoice-dollar" />
          </div>
          <div>
            <h3 class="font-semibold text-[#0B2C3D]">Monthly Financial Summary</h3>
            <p class="text-xs text-slate-500">Complete overview of income and expenses</p>
          </div>
        </div>
        <button
          type="button"
          class="mt-auto flex items-center justify-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium py-2.5 hover:bg-[#0d3a52] transition"
          @click="handleGenerateMonthlySummary"
        >
          <i class="fas fa-download text-xs" />
          Generate
        </button>
      </article>

      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-[#16A34A]/10 flex items-center justify-center text-green-600"
          >
            <i class="fas fa-chart-bar" />
          </div>
          <div>
            <h3 class="font-semibold text-[#0B2C3D]">Transaction Report</h3>
            <p class="text-xs text-slate-500">Detailed list of all transactions</p>
          </div>
        </div>
        <button
          type="button"
          class="mt-auto flex items-center justify-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium py-2.5 hover:bg-[#0d3a52] transition"
          @click="handleGenerateTransactionReport"
        >
          <i class="fas fa-download text-xs" />
          Generate
        </button>
      </article>

      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-sky-600"
          >
            <i class="fas fa-chart-line" />
          </div>
          <div>
            <h3 class="font-semibold text-[#0B2C3D]">User Activity Report</h3>
            <p class="text-xs text-slate-500">User engagement and activity metrics</p>
          </div>
        </div>
        <button
          type="button"
          class="mt-auto flex items-center justify-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium py-2.5 hover:bg-[#0d3a52] transition"
          @click="handleGenerateUserActivityReport"
        >
          <i class="fas fa-download text-xs" />
          Generate
        </button>
      </article>

      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl bg-[#E5A00D]/10 flex items-center justify-center text-[#E5A00D]"
          >
            <i class="fas fa-chart-pie" />
          </div>
          <div>
            <h3 class="font-semibold text-[#0B2C3D]">Category Analysis</h3>
            <p class="text-xs text-slate-500">Breakdown by expense categories</p>
          </div>
        </div>
        <button
          type="button"
          class="mt-auto flex items-center justify-center gap-2 rounded-lg bg-[#0B2C3D] text-white text-sm font-medium py-2.5 hover:bg-[#0d3a52] transition"
          @click="handleGenerateCategoryAnalysis"
        >
          <i class="fas fa-download text-xs" />
          Generate
        </button>
      </article>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminIncomeExpensesChart
        :labels="monthlyTrend.labels"
        :income-data="monthlyTrend.income"
        :expense-data="monthlyTrend.expenses"
      />
      <AdminUserGrowthChart :labels="userGrowth.labels" :counts="userGrowth.counts" />
    </div>

    <!-- Platform Summary -->
    <div>
      <h3 class="text-base font-semibold text-[#0B2C3D] mb-3">
        Platform Summary — {{ selectedDateLabel }}
      </h3>
      <AdminOverviewCards
        :total-income="monthlySummary.income"
        :total-expenses="monthlySummary.expenses"
        :net-savings="monthlySummary.netSavings"
        :total-users="overview.totalUsers"
      />
    </div>
  </section>
</template>
