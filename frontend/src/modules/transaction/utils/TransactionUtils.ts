// author: Lucas Higuita
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionFilterDTO } from '@/modules/transaction/dtos/TransactionFilterDTO';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import { MathUtils } from '@/shared/utils/MathUtils';

export class TransactionUtils {
  private readonly transactions: TransactionInterface[];
  private readonly categories: CategoryInterface[];

  constructor({
    transactions,
    categories,
  }: {
    transactions: TransactionInterface[];
    categories: CategoryInterface[];
  }) {
    this.transactions = transactions;
    this.categories = categories;
  }

  public getFiltered(filters: TransactionFilterDTO): TransactionInterface[] {
    let result = [...this.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }
    if (filters.type === 'income') result = result.filter((t) => t.amount > 0);
    if (filters.type === 'expense') result = result.filter((t) => t.amount < 0);
    if (filters.categoryId !== null) {
      result = result.filter((t) => t.categoryId === filters.categoryId);
    }
    return result;
  }

  public getTotalIncome(): number {
    return this.transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public getTotalExpenses(): number {
    return this.transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  public getBalance(): number {
    return this.transactions.reduce((sum, t) => sum + t.amount, 0);
  }

  public getMovementTrend(days = 10): {
    labels: string[];
    income: number[];
    expenses: number[];
  } {
    const today = new Date();
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStr = d.toDateString();

      labels.push(label);
      income.push(
        this.transactions
          .filter((t) => t.amount > 0 && new Date(t.date).toDateString() === dayStr)
          .reduce((sum, t) => sum + t.amount, 0),
      );
      expenses.push(
        this.transactions
          .filter((t) => t.amount < 0 && new Date(t.date).toDateString() === dayStr)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      );
    }

    return { labels, income, expenses };
  }

  public getExpensesByCategory(): { name: string; amount: number; color: string }[] {
    const map = new Map<number, { name: string; amount: number; color: string }>();
    const UNCATEGORIZED_ID = -1;
    const categoriesById = new Map(this.categories.map((category) => [Number(category.id), category]));

    for (const tx of this.transactions) {
      const amount = Number(tx.amount);
      if (!Number.isFinite(amount)) continue;

      const rawCategoryId = tx.categoryId;
      const normalizedCategoryId =
        rawCategoryId === null || rawCategoryId === undefined ? UNCATEGORIZED_ID : Number(rawCategoryId);
      const category = categoriesById.get(normalizedCategoryId);
      const categoryType = category?.type?.toLowerCase();
      const isExpense = amount < 0 || (amount > 0 && categoryType === 'expense');
      if (!isExpense) continue;

      const bucketId = category ? normalizedCategoryId : UNCATEGORIZED_ID;
      const existing = map.get(bucketId);
      if (existing) {
        existing.amount += Math.abs(amount);
      } else {
        map.set(bucketId, {
          name: category?.name ?? 'Uncategorized',
          amount: Math.abs(amount),
          color: category?.color ?? '#94A3B8',
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }

  public getDashboardKpis(referenceDate: Date = new Date()): {
    balance: number;
    balanceChangePct: number;
    monthlyIncome: number;
    monthlyIncomeChangePct: number;
    monthlyExpenses: number;
    monthlyExpensesChangePct: number;
    monthlySavings: number;
    monthlySavingsChangePct: number;
  } {
    const year = referenceDate.getFullYear();
    const monthIndex = referenceDate.getMonth();
    const current = this.getMonthlyIncomeAndExpenses(year, monthIndex);
    const prevDate = new Date(year, monthIndex - 1, 1);
    const previous = this.getMonthlyIncomeAndExpenses(
      prevDate.getFullYear(),
      prevDate.getMonth(),
    );

    const monthlySavings = current.income - current.expenses;
    const prevMonthlySavings = previous.income - previous.expenses;
    const balance = this.getBalance();
    const prevBalanceCutoff = new Date(year, monthIndex, 0, 23, 59, 59);
    const prevBalance = this.getBalanceUntilDate(prevBalanceCutoff);

    return {
      balance,
      balanceChangePct: MathUtils.calculatePercentageChange(balance, prevBalance),
      monthlyIncome: current.income,
      monthlyIncomeChangePct: MathUtils.calculatePercentageChange(
        current.income,
        previous.income,
      ),
      monthlyExpenses: current.expenses,
      monthlyExpensesChangePct: MathUtils.calculatePercentageChange(
        current.expenses,
        previous.expenses,
      ),
      monthlySavings,
      monthlySavingsChangePct: MathUtils.calculatePercentageChange(
        monthlySavings,
        prevMonthlySavings,
      ),
    };
  }

  public getMonthlyFlow(months = 6, referenceDate: Date = new Date()): {
    labels: string[];
    income: number[];
    expenses: number[];
  } {
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];
    const baseYear = referenceDate.getFullYear();
    const baseMonth = referenceDate.getMonth();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(baseYear, baseMonth - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const monthData = this.getMonthlyIncomeAndExpenses(d.getFullYear(), d.getMonth());
      labels.push(label);
      income.push(monthData.income);
      expenses.push(monthData.expenses);
    }

    return { labels, income, expenses };
  }

  private getMonthlyIncomeAndExpenses(
    year: number,
    monthIndex: number,
  ): { income: number; expenses: number } {
    const monthStart = new Date(year, monthIndex, 1).getTime();
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59).getTime();

    const income = this.transactions
      .filter((t) => {
        const ts = new Date(t.date).getTime();
        return t.amount > 0 && ts >= monthStart && ts <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = this.transactions
      .filter((t) => {
        const ts = new Date(t.date).getTime();
        return t.amount < 0 && ts >= monthStart && ts <= monthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses };
  }

  private getBalanceUntilDate(until: Date): number {
    const ts = until.getTime();
    return this.transactions
      .filter((t) => new Date(t.date).getTime() <= ts)
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
