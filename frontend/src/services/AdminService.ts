// internal imports
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import type { UserInterface } from '@/interfaces/UserInterface';
import { useCategoryStore } from '@/stores/categorystore';
import { useTransactionStore } from '@/stores/transactionstore';
import { useUserStore } from '@/stores/userstore';

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
  public static getGlobalOverview(): GlobalOverview {
    const transactions = useTransactionStore().transactions;
    const users = useUserStore().users.filter((u) => u.role === 'user');

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;

    return {
      totalIncome,
      totalExpenses,
      netSavings,
      totalUsers: users.length,
    };
  }

  public static getMonthlyTrend(months = 7): MonthlyTrend {
    const transactions = useTransactionStore().transactions;
    const today = new Date();

    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();

      labels.push(label);

      const incomeForMonth = transactions
        .filter((t) => {
          const ts = new Date(t.date).getTime();
          return t.amount > 0 && ts >= monthStart && ts <= monthEnd;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const expensesForMonth = transactions
        .filter((t) => {
          const ts = new Date(t.date).getTime();
          return t.amount < 0 && ts >= monthStart && ts <= monthEnd;
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      income.push(incomeForMonth);
      expenses.push(expensesForMonth);
    }

    return { labels, income, expenses };
  }

  public static getUserGrowthTrend(months = 7): UserGrowthTrend {
    const users = useUserStore().users.filter((u) => u.role === 'user');
    const today = new Date();

    const labels: string[] = [];
    const counts: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();

      const count = users.filter((u) => {
        const created = new Date(u.createdAt).getTime();
        return created <= monthEnd;
      }).length;

      labels.push(label);
      counts.push(count);
    }

    return { labels, counts };
  }

  public static getUsersWithStats(): (UserInterface & {
    balance: number;
    transactionCount: number;
  })[] {
    const userStore = useUserStore();
    const transactionStore = useTransactionStore();

    return userStore.users
      .filter((u) => u.role === 'user')
      .map((user) => {
        const userTransactions = transactionStore.transactions.filter((t) => t.userId === user.id);
        const balance = userTransactions.reduce((sum, t) => sum + t.amount, 0);
        return {
          ...user,
          balance,
          transactionCount: userTransactions.length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public static getAllTransactions(): TransactionInterface[] {
    return useTransactionStore().transactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  public static getTransactionsForMonth(year: number, month: number): TransactionInterface[] {
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 0, 23, 59, 59).getTime();

    return AdminService.getAllTransactions().filter((t) => {
      const ts = new Date(t.date).getTime();
      return ts >= monthStart && ts <= monthEnd;
    });
  }

  public static getMonthlySummary(
    year: number,
    month: number,
  ): {
    income: number;
    expenses: number;
    netSavings: number;
    transactionCount: number;
  } {
    const transactions = AdminService.getTransactionsForMonth(year, month);

    const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      income,
      expenses,
      netSavings: income - expenses,
      transactionCount: transactions.length,
    };
  }

  public static getCategoryBreakdownForMonth(
    year: number,
    month: number,
  ): { category: CategoryInterface; amount: number }[] {
    const transactions = AdminService.getTransactionsForMonth(year, month);
    const categories = useCategoryStore().categories;

    const expenseByCategory = new Map<number, number>();

    for (const t of transactions) {
      if (t.amount < 0 && t.categoryId != null) {
        const current = expenseByCategory.get(t.categoryId) ?? 0;
        expenseByCategory.set(t.categoryId, current + Math.abs(t.amount));
      }
    }

    return Array.from(expenseByCategory.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return category ? { category, amount } : null;
      })
      .filter((x): x is { category: CategoryInterface; amount: number } => x != null)
      .sort((a, b) => b.amount - a.amount);
  }

  public static getUserName(userId: number): string {
    const user = useUserStore().users.find((u) => u.id === userId);
    return user?.name ?? `User #${userId}`;
  }
}
