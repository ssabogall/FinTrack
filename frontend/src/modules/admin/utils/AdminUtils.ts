// author: all of us
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export interface MonthlyTrend {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface UserGrowthTrend {
  labels: string[];
  counts: number[];
}

export class AdminUtils {
  public static normalizeMonthlyTrend(data: unknown): MonthlyTrend {
    if (
      data &&
      typeof data === 'object' &&
      'labels' in data &&
      'income' in data &&
      'expenses' in data
    ) {
      const raw = data as { labels?: unknown; income?: unknown; expenses?: unknown };
      const labels = Array.isArray(raw.labels) ? raw.labels.map((x) => String(x)) : [];
      const income = Array.isArray(raw.income)
        ? raw.income.map((x) => Number(x)).map((x) => (Number.isFinite(x) ? x : 0))
        : [];
      const expenses = Array.isArray(raw.expenses)
        ? raw.expenses.map((x) => Number(x)).map((x) => (Number.isFinite(x) ? x : 0))
        : [];
      const size = Math.min(labels.length, income.length, expenses.length);
      return {
        labels: labels.slice(0, size),
        income: income.slice(0, size),
        expenses: expenses.slice(0, size),
      };
    }

    if (Array.isArray(data)) {
      const rows = data as Array<{ label?: unknown; income?: unknown; expenses?: unknown }>;
      const labels: string[] = [];
      const income: number[] = [];
      const expenses: number[] = [];
      for (const row of rows) {
        labels.push(String(row.label ?? ''));
        const incomeValue = Number(row.income);
        const expenseValue = Number(row.expenses);
        income.push(Number.isFinite(incomeValue) ? incomeValue : 0);
        expenses.push(Number.isFinite(expenseValue) ? expenseValue : 0);
      }
      return { labels, income, expenses };
    }

    return { labels: [], income: [], expenses: [] };
  }

  public static normalizeUserGrowthTrend(data: unknown): UserGrowthTrend {
    if (data && typeof data === 'object' && 'labels' in data && 'counts' in data) {
      const raw = data as { labels?: unknown; counts?: unknown };
      const labels = Array.isArray(raw.labels) ? raw.labels.map((x) => String(x)) : [];
      const counts = Array.isArray(raw.counts)
        ? raw.counts.map((x) => Number(x)).map((x) => (Number.isFinite(x) ? x : 0))
        : [];
      const size = Math.min(labels.length, counts.length);
      return {
        labels: labels.slice(0, size),
        counts: counts.slice(0, size),
      };
    }

    if (Array.isArray(data)) {
      const rows = data as Array<{ label?: unknown; count?: unknown; counts?: unknown }>;
      const labels: string[] = [];
      const counts: number[] = [];
      for (const row of rows) {
        labels.push(String(row.label ?? ''));
        const countValue = Number(row.counts ?? row.count);
        counts.push(Number.isFinite(countValue) ? countValue : 0);
      }
      return { labels, counts };
    }

    return { labels: [], counts: [] };
  }

  public static async buildMonthlyTrendFromSummaries(
    months: number,
    getSummary: (year: number, month: number) => Promise<{ income: number; expenses: number }>,
  ): Promise<MonthlyTrend> {
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      try {
        const summary = await getSummary(d.getFullYear(), d.getMonth() + 1);
        income.push(Number.isFinite(summary.income) ? summary.income : 0);
        expenses.push(Number.isFinite(summary.expenses) ? summary.expenses : 0);
      } catch {
        income.push(0);
        expenses.push(0);
      }
    }

    return { labels, income, expenses };
  }

  public static buildUserGrowthFromUsers(
    months: number,
    users: Array<Pick<UserInterface, 'createdAt'>>,
  ): UserGrowthTrend {
    const labels: string[] = [];
    const counts: number[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const count = users.filter((u) => new Date(u.createdAt).getTime() <= monthEnd).length;
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      counts.push(count);
    }

    return { labels, counts };
  }

  public static getUserName(users: UserInterface[], userId: number): string {
    const user = users.find((u) => u.id === userId);
    return user?.name ?? `User #${userId}`;
  }
}
