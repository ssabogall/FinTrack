// author: Santiago Gómez
// external imports
import axios from 'axios';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { AdminUtils } from '@/modules/admin/utils/AdminUtils';
import type { MonthlyTrend, UserGrowthTrend } from '@/modules/admin/utils/AdminUtils';

export interface GlobalOverview {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  totalUsers: number;
}

export type { MonthlyTrend, UserGrowthTrend } from '@/modules/admin/utils/AdminUtils';

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
      const normalized = AdminUtils.normalizeMonthlyTrend(data);
      if (normalized.labels.length > 0) return normalized;
    } catch {
      // Fallback below.
    }

    return AdminUtils.buildMonthlyTrendFromSummaries(months, async (year, month) => {
      const summary = await this.getMonthlySummary(year, month);
      return { income: summary.income, expenses: summary.expenses };
    });
  }

  public static async getUserGrowthTrend(months = 7): Promise<UserGrowthTrend> {
    try {
      const { data } = await axios.get<unknown>(`${this.API_URL}/user-growth`, {
        params: { months },
      });
      const normalized = AdminUtils.normalizeUserGrowthTrend(data);
      if (normalized.labels.length > 0) return normalized;
    } catch {
      // Fallback below.
    }

    const users = await this.getUsersWithStats();
    return AdminUtils.buildUserGrowthFromUsers(months, users);
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
    return AdminUtils.getUserName(users, userId);
  }
}
