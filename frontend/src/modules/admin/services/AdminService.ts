// author: Santiago Gómez
// external imports
import axios from 'axios';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export interface GlobalOverview {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalUsers: number;
}

export interface MonthlyTrend {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface UserGrowthTrend {
  labels: string[];
  counts: number[];
}

export class AdminService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly API_URL = `${this.API_BASE_URL}/api/admin`;

  public static async getGlobalOverview(): Promise<GlobalOverview> {
    const { data } = await axios.get<GlobalOverview>(`${this.API_URL}/overview`);
    return data;
  }

  public static async getMonthlyTrend(months = 7): Promise<MonthlyTrend> {
    try {
      const { data } = await axios.get<unknown>(`${this.API_URL}/monthly-trend`, {
        params: { months },
      });
      const normalized = this.normalizeMonthlyTrend(data);
      if (normalized.labels.length > 0) return normalized;
    } catch {
      // Fallback below.
    }

    return this.buildMonthlyTrendFromSummaries(months);
  }

  public static async getUserGrowthTrend(months = 7): Promise<UserGrowthTrend> {
    try {
      const { data } = await axios.get<unknown>(`${this.API_URL}/user-growth`, {
        params: { months },
      });
      const normalized = this.normalizeUserGrowthTrend(data);
      if (normalized.labels.length > 0) return normalized;
    } catch {
      // Fallback below.
    }

    return this.buildUserGrowthFromUsers(months);
  }

  public static async getUsersWithStats(): Promise<
    (UserInterface & {
      balance: number;
      transactionCount: number;
    })[]
  > {
    const { data } = await axios.get<
      (UserInterface & { balance: number; transactionCount: number })[]
    >(`${this.API_URL}/users-with-stats`);
    return data.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      balance: Number(user.balance),
    }));
  }

  public static async getTransactionsForMonth(
    year: number,
    month: number,
  ): Promise<TransactionInterface[]> {
    const { data } = await axios.get<TransactionInterface[]>(`${this.API_URL}/transactions`, {
      params: { year, month },
    });
    return data.map((tx) => ({
      ...tx,
      amount: Number(tx.amount),
      date: new Date(tx.date),
      createdAt: new Date(tx.createdAt),
      updatedAt: new Date(tx.updatedAt),
    }));
  }

  public static async getMonthlySummary(
    year: number,
    month: number,
  ): Promise<{
    income: number;
    expenses: number;
    netSavings: number;
    transactionCount: number;
  }> {
    const { data } = await axios.get<{
      income: number;
      expenses: number;
      netSavings: number;
      transactionCount: number;
    }>(`${this.API_URL}/monthly-summary`, {
      params: { year, month },
    });
    return {
      ...data,
      income: Number(data.income),
      expenses: Number(data.expenses),
      netSavings: Number(data.netSavings),
    };
  }

  public static async getCategoryBreakdownForMonth(
    year: number,
    month: number,
  ): Promise<{ category: CategoryInterface; amount: number }[]> {
    const { data } = await axios.get<{ category: CategoryInterface; amount: number }[]>(
      `${this.API_URL}/category-breakdown`,
      {
        params: { year, month },
      },
    );
    return data.map((item) => ({
      category: {
        ...item.category,
        createdAt: new Date(item.category.createdAt),
        updatedAt: new Date(item.category.updatedAt),
      },
      amount: Number(item.amount),
    }));
  }

  public static getUserName(users: UserInterface[], userId: number): string {
    const user = users.find((u) => u.id === userId);
    return user?.name ?? `User #${userId}`;
  }

  private static normalizeMonthlyTrend(data: unknown): MonthlyTrend {
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

  private static normalizeUserGrowthTrend(data: unknown): UserGrowthTrend {
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

  private static async buildMonthlyTrendFromSummaries(months: number): Promise<MonthlyTrend> {
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];
    const today = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      try {
        const summary = await this.getMonthlySummary(d.getFullYear(), d.getMonth() + 1);
        income.push(Number.isFinite(summary.income) ? summary.income : 0);
        expenses.push(Number.isFinite(summary.expenses) ? summary.expenses : 0);
      } catch {
        income.push(0);
        expenses.push(0);
      }
    }

    return { labels, income, expenses };
  }

  private static async buildUserGrowthFromUsers(months: number): Promise<UserGrowthTrend> {
    const labels: string[] = [];
    const counts: number[] = [];
    const today = new Date();
    const users = await this.getUsersWithStats();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const count = users.filter((u) => new Date(u.createdAt).getTime() <= monthEnd).length;
      labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      counts.push(count);
    }

    return { labels, counts };
  }
}
