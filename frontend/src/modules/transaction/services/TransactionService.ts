// author: Lucas Higuita
// internal imports
import type { CreateTransactionDTO } from '@/modules/transaction/dtos/CreateTransactionDTO';
import type { TransactionFilterDTO } from '@/modules/transaction/dtos/TransactionFilterDTO';
import type { UpdateTransactionDTO } from '@/modules/transaction/dtos/UpdateTransactionDTO';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import { useAuthStore } from '@/stores/authstore';
import { useCategoryStore } from '@/stores/categorystore';
import { useGoalStore } from '@/modules/goal/stores/goalstore';
import { useTransactionStore } from '@/modules/transaction/stores/transactionstore';
import { GoalStatusHelper } from '@/modules/goal/utils/GoalStatusHelper';

export class TransactionService {
  private static computeChangePct(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  private static getMonthlyIncomeExpenses(
    userId: number,
    year: number,
    monthIndex: number,
  ): { income: number; expenses: number } {
    const transactions = TransactionService.getByUser(userId);
    const monthStart = new Date(year, monthIndex, 1).getTime();
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59).getTime();

    const income = transactions
      .filter((t) => {
        const ts = new Date(t.date).getTime();
        return t.amount > 0 && ts >= monthStart && ts <= monthEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => {
        const ts = new Date(t.date).getTime();
        return t.amount < 0 && ts >= monthStart && ts <= monthEnd;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return { income, expenses };
  }

  private static getBalanceUntil(userId: number, until: Date): number {
    const ts = until.getTime();
    return TransactionService.getByUser(userId)
      .filter((t) => new Date(t.date).getTime() <= ts)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public static getAll(): TransactionInterface[] {
    return useTransactionStore().transactions;
  }

  public static getById(id: number): TransactionInterface | undefined {
    return useTransactionStore().transactions.find((t) => t.id === id);
  }

  public static getByUser(userId: number): TransactionInterface[] {
    return useTransactionStore().transactions.filter((t) => t.userId === userId);
  }

  public static getFilteredByUser(
    userId: number,
    filters: TransactionFilterDTO,
  ): TransactionInterface[] {
    const all = TransactionService.getByUser(userId).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    let result = all;
    const { search, type, categoryId } = filters;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.description.toLowerCase().includes(q));
    }

    if (type === 'income') {
      result = result.filter((t) => t.amount > 0);
    } else if (type === 'expense') {
      result = result.filter((t) => t.amount < 0);
    }

    if (categoryId !== null) {
      result = result.filter((t) => t.categoryId === categoryId);
    }

    return result;
  }

  public static create(dto: CreateTransactionDTO): void {
    if (!dto.description.trim()) {
      throw new Error('Description cannot be empty.');
    }

    if (dto.amount === 0) {
      throw new Error('Amount cannot be zero.');
    }

    const transactionStore = useTransactionStore();
    const authStore = useAuthStore();
    const categoryStore = useCategoryStore();
    const goalStore = useGoalStore();

    const now = new Date();
    const id = Date.now();

    const newTransaction: TransactionInterface = {
      id,
      amount: dto.amount,
      description: dto.description,
      date: new Date(dto.date),
      createdAt: now,
      updatedAt: now,
      userId: dto.userId,
      categoryId: dto.categoryId,
      goalId: dto.goalId,
    };

    transactionStore.transactions.push(newTransaction);

    // Update user's transactionIds
    if (authStore.currentUser && authStore.currentUser.id === dto.userId) {
      authStore.currentUser.transactionIds = [...(authStore.currentUser.transactionIds ?? []), id];
    }

    // Update category's transactionIds
    if (dto.categoryId) {
      const category = categoryStore.categories.find((c) => c.id === dto.categoryId);
      if (category) {
        category.transactionIds = [...(category.transactionIds ?? []), id];
      }
    }

    // Update goal's progress
    if (dto.goalId) {
      const goal = goalStore.goals.find((g) => g.id === dto.goalId);
      if (goal) {
        const contribution = Math.abs(dto.amount);
        goal.currentAmount += contribution;
        goal.updatedAt = now;
        goal.status = GoalStatusHelper.compute(goal.currentAmount, goal.targetAmount);
        goal.transactionIds = [...(goal.transactionIds ?? []), id];
      }
    }
  }

  public static update(id: number, dto: UpdateTransactionDTO): void {
    if (dto.description !== undefined && !dto.description.trim()) {
      throw new Error('Description cannot be empty.');
    }

    if (dto.amount !== undefined && dto.amount === 0) {
      throw new Error('Amount cannot be zero.');
    }

    const transactionStore = useTransactionStore();
    const categoryStore = useCategoryStore();
    const goalStore = useGoalStore();
    const index = transactionStore.transactions.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Transaction not found.');
    }

    const current = transactionStore.transactions[index];
    if (!current) {
      throw new Error('Transaction not found.');
    }

    const oldCategoryId = current.categoryId;
    const newCategoryId = dto.categoryId !== undefined ? dto.categoryId : oldCategoryId;

    const oldGoalId = current.goalId;
    const newGoalId = dto.goalId !== undefined ? dto.goalId : oldGoalId;

    const oldContribution = Math.abs(current.amount);
    const newContribution = Math.abs(dto.amount ?? current.amount);

    // Update category references if category changed
    if (newCategoryId !== oldCategoryId) {
      if (oldCategoryId) {
        const oldCategory = categoryStore.categories.find((c) => c.id === oldCategoryId);
        if (oldCategory) {
          oldCategory.transactionIds = (oldCategory.transactionIds ?? []).filter(
            (tid) => tid !== id,
          );
        }
      }
      if (newCategoryId) {
        const newCategory = categoryStore.categories.find((c) => c.id === newCategoryId);
        if (newCategory) {
          newCategory.transactionIds = [...(newCategory.transactionIds ?? []), id];
        }
      }
    }

    // Update goal references if goal changed or amount changed
    if (oldGoalId && oldGoalId !== newGoalId) {
      const oldGoal = goalStore.goals.find((g) => g.id === oldGoalId);
      if (oldGoal) {
        oldGoal.currentAmount = Math.max(oldGoal.currentAmount - oldContribution, 0);
        oldGoal.transactionIds = (oldGoal.transactionIds ?? []).filter((tid) => tid !== id);
        oldGoal.status = GoalStatusHelper.compute(oldGoal.currentAmount, oldGoal.targetAmount);
      }
    } else if (oldGoalId && oldGoalId === newGoalId && dto.amount !== undefined) {
      const goal = goalStore.goals.find((g) => g.id === oldGoalId);
      if (goal) {
        goal.currentAmount = Math.max(goal.currentAmount - oldContribution + newContribution, 0);
        goal.status = GoalStatusHelper.compute(goal.currentAmount, goal.targetAmount);
      }
    }

    if (newGoalId && oldGoalId !== newGoalId) {
      const newGoal = goalStore.goals.find((g) => g.id === newGoalId);
      if (newGoal) {
        newGoal.currentAmount += newContribution;
        newGoal.transactionIds = [...(newGoal.transactionIds ?? []), id];
        newGoal.status = GoalStatusHelper.compute(newGoal.currentAmount, newGoal.targetAmount);
      }
    }

    transactionStore.transactions[index] = {
      id: current.id,
      amount: dto.amount ?? current.amount,
      description: dto.description ?? current.description,
      date: dto.date ? new Date(dto.date) : current.date,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      userId: current.userId,
      categoryId: newCategoryId,
      goalId: newGoalId,
    } as TransactionInterface;
  }

  public static delete(id: number): void {
    const transactionStore = useTransactionStore();
    const authStore = useAuthStore();
    const categoryStore = useCategoryStore();
    const goalStore = useGoalStore();

    const index = transactionStore.transactions.findIndex((t) => t.id === id);

    if (index === -1) {
      throw new Error('Transaction not found.');
    }

    const transaction = transactionStore.transactions[index];
    if (!transaction) {
      throw new Error('Transaction not found.');
    }

    transactionStore.transactions.splice(index, 1);

    // Remove from user's transactionIds
    if (authStore.currentUser) {
      authStore.currentUser.transactionIds = (authStore.currentUser.transactionIds ?? []).filter(
        (tid) => tid !== id,
      );
    }

    // Remove from category's transactionIds
    if (transaction.categoryId) {
      const category = categoryStore.categories.find((c) => c.id === transaction.categoryId);
      if (category) {
        category.transactionIds = (category.transactionIds ?? []).filter((tid) => tid !== id);
      }
    }

    // Remove from goal's progress
    if (transaction.goalId) {
      const goal = goalStore.goals.find((g) => g.id === transaction.goalId);
      if (goal) {
        goal.currentAmount = Math.max(goal.currentAmount - Math.abs(transaction.amount), 0);
        goal.transactionIds = (goal.transactionIds ?? []).filter((tid) => tid !== id);
        goal.status = GoalStatusHelper.compute(goal.currentAmount, goal.targetAmount);
      }
    }
  }

  public static getTotalIncome(userId: number): number {
    return TransactionService.getByUser(userId)
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  }

  public static getTotalExpenses(userId: number): number {
    return TransactionService.getByUser(userId)
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  public static getBalance(userId: number): number {
    return TransactionService.getByUser(userId).reduce((sum, t) => sum + t.amount, 0);
  }

  public static getDashboardKpis(
    userId: number,
    referenceDate: Date = new Date(),
  ): {
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

    const currentMonthly = TransactionService.getMonthlyIncomeExpenses(userId, year, monthIndex);

    const prevDate = new Date(year, monthIndex - 1, 1);
    const prevMonthly = TransactionService.getMonthlyIncomeExpenses(
      userId,
      prevDate.getFullYear(),
      prevDate.getMonth(),
    );

    const monthlySavings = currentMonthly.income - currentMonthly.expenses;
    const prevMonthlySavings = prevMonthly.income - prevMonthly.expenses;

    const balance = TransactionService.getBalance(userId);
    const prevBalanceCutoff = new Date(year, monthIndex, 0, 23, 59, 59);
    const prevBalance = TransactionService.getBalanceUntil(userId, prevBalanceCutoff);

    return {
      balance,
      balanceChangePct: TransactionService.computeChangePct(balance, prevBalance),
      monthlyIncome: currentMonthly.income,
      monthlyIncomeChangePct: TransactionService.computeChangePct(
        currentMonthly.income,
        prevMonthly.income,
      ),
      monthlyExpenses: currentMonthly.expenses,
      monthlyExpensesChangePct: TransactionService.computeChangePct(
        currentMonthly.expenses,
        prevMonthly.expenses,
      ),
      monthlySavings,
      monthlySavingsChangePct: TransactionService.computeChangePct(
        monthlySavings,
        prevMonthlySavings,
      ),
    };
  }

  public static getMovementTrend(
    userId: number,
    days = 10,
  ): { labels: string[]; income: number[]; expenses: number[] } {
    const transactions = TransactionService.getByUser(userId);
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

      const incomeForDay = transactions
        .filter((t) => t.amount > 0 && new Date(t.date).toDateString() === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);

      const expensesForDay = transactions
        .filter((t) => t.amount < 0 && new Date(t.date).toDateString() === dayStr)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      income.push(incomeForDay);
      expenses.push(expensesForDay);
    }

    return { labels, income, expenses };
  }

  public static getExpensesByCategory(
    userId: number,
  ): { name: string; amount: number; color: string }[] {
    const transactions = TransactionService.getByUser(userId);
    const categoryStore = useCategoryStore();

    const map = new Map<number, { name: string; amount: number; color: string }>();

    for (const tx of transactions) {
      if (tx.amount >= 0 || !tx.categoryId) continue;
      const cat = categoryStore.categories.find((c) => c.id === tx.categoryId);
      if (!cat) continue;
      const existing = map.get(cat.id);
      if (existing) {
        existing.amount += Math.abs(tx.amount);
      } else {
        map.set(cat.id, { name: cat.name, amount: Math.abs(tx.amount), color: cat.color });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }

  public static getMonthlyFlow(
    userId: number,
    months = 6,
    referenceDate: Date = new Date(),
  ): { labels: string[]; income: number[]; expenses: number[] } {
    const labels: string[] = [];
    const income: number[] = [];
    const expenses: number[] = [];

    const baseYear = referenceDate.getFullYear();
    const baseMonth = referenceDate.getMonth();

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(baseYear, baseMonth - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const { income: monthIncome, expenses: monthExpenses } =
        TransactionService.getMonthlyIncomeExpenses(userId, d.getFullYear(), d.getMonth());

      labels.push(label);
      income.push(monthIncome);
      expenses.push(monthExpenses);
    }

    return { labels, income, expenses };
  }
}
