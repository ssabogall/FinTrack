import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// internal imports
import { Category } from '../category/entities/category.entity';
import { Transaction } from '../transaction/entities/transaction.entity';
import { User } from '../user/entities/user.entity';

interface TrendPoint {
  labels: string[];
  income: number[];
  expenses: number[];
}

interface UserGrowthPoint {
  labels: string[];
  counts: number[];
}

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async getOverview(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    totalUsers: number;
  }> {
    const users = await this.userRepository.find();
    const transactions = await this.transactionRepository.find();

    const totalIncome = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      totalUsers: users.filter((u) => u.role === 'user').length,
    };
  }

  async getMonthlyTrend(months = 7): Promise<TrendPoint> {
    const transactions = await this.transactionRepository.find();
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
      income.push(
        transactions
          .filter((t) => {
            const ts = new Date(t.date).getTime();
            return t.amount > 0 && ts >= monthStart && ts <= monthEnd;
          })
          .reduce((sum, t) => sum + t.amount, 0),
      );
      expenses.push(
        transactions
          .filter((t) => {
            const ts = new Date(t.date).getTime();
            return t.amount < 0 && ts >= monthStart && ts <= monthEnd;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      );
    }

    return { labels, income, expenses };
  }

  async getUserGrowthTrend(months = 7): Promise<UserGrowthPoint> {
    const users = (await this.userRepository.find()).filter((u) => u.role === 'user');
    const today = new Date();
    const labels: string[] = [];
    const counts: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime();
      const count = users.filter((u) => new Date(u.createdAt).getTime() <= monthEnd).length;
      labels.push(label);
      counts.push(count);
    }

    return { labels, counts };
  }

  async getUsersWithStats(): Promise<
    (Omit<User, 'password'> & { balance: number; transactionCount: number })[]
  > {
    const users = await this.userRepository.find();
    const transactions = await this.transactionRepository.find();

    return users
      .filter((u) => u.role === 'user')
      .map((user) => {
        const userTransactions = transactions.filter((t) => t.userId === user.id);
        const balance = userTransactions.reduce((sum, t) => sum + t.amount, 0);
        const { password: _password, ...safeUser } = user;
        return {
          ...safeUser,
          balance,
          transactionCount: userTransactions.length,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTransactionsForMonth(year: number, month: number): Promise<Transaction[]> {
    this.validateYearMonth(year, month);
    const transactions = await this.transactionRepository.find();
    const monthStart = new Date(year, month - 1, 1).getTime();
    const monthEnd = new Date(year, month, 0, 23, 59, 59).getTime();
    return transactions
      .filter((t) => {
        const ts = new Date(t.date).getTime();
        return ts >= monthStart && ts <= monthEnd;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getMonthlySummary(
    year: number,
    month: number,
  ): Promise<{
    income: number;
    expenses: number;
    netSavings: number;
    transactionCount: number;
  }> {
    const transactions = await this.getTransactionsForMonth(year, month);
    const income = transactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
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

  async getCategoryBreakdownForMonth(
    year: number,
    month: number,
  ): Promise<{ category: Category; amount: number }[]> {
    const transactions = await this.getTransactionsForMonth(year, month);
    const categories = await this.categoryRepository.find();
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
      .filter((x): x is { category: Category; amount: number } => x != null)
      .sort((a, b) => b.amount - a.amount);
  }

  private validateYearMonth(year: number, month: number): void {
    if (!Number.isInteger(year) || year < 1970 || year > 3000) {
      throw new BadRequestException('Invalid year');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('Invalid month');
    }
  }
}
