// author: Lucas Higuita
// internal imports
import type { CreateTransactionDTO } from '@/modules/transaction/dtos/CreateTransactionDTO';
import type { TransactionFilterDTO } from '@/modules/transaction/dtos/TransactionFilterDTO';
import type { UpdateTransactionDTO } from '@/modules/transaction/dtos/UpdateTransactionDTO';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';
import { useAuthStore } from '@/modules/auth/stores/authstore';
import { useCategoryStore } from '@/modules/category/stores/categorystore';
import { useGoalStore } from '@/modules/goal/stores/goalstore';
import { useTransactionStore } from '@/modules/transaction/stores/transactionstore';
import { GoalStatusUtils } from '@/modules/goal/utils/GoalUtils';
import { MathUtils } from '@/shared/utils/MathUtils';

export class TransactionService {
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

    const newTransaction = TransactionService.buildNewTransaction(dto);
    const { id } = newTransaction;

    transactionStore.transactions.push(newTransaction);

    // Update user's transactionIds
    if (authStore.currentUser && authStore.currentUser.id === dto.userId) {
      authStore.currentUser.transactionIds = [...(authStore.currentUser.transactionIds ?? []), id];
    }

    // Update category's transactionIds
    TransactionService.addTransactionToCategory(categoryStore, dto.categoryId, id);
    // Update goal's progress
    TransactionService.addTransactionToGoal(goalStore, dto.goalId, dto.amount, id, new Date());
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
      TransactionService.removeTransactionFromCategory(categoryStore, oldCategoryId, id);
      TransactionService.addTransactionToCategory(categoryStore, newCategoryId, id);
    }

    // Update goal references if goal changed or amount changed
    if (oldGoalId && oldGoalId !== newGoalId) {
      TransactionService.removeTransactionFromGoal(goalStore, oldGoalId, oldContribution, id);
    } else if (oldGoalId && oldGoalId === newGoalId && dto.amount !== undefined) {
      TransactionService.recalculateGoalContribution(
        goalStore,
        oldGoalId,
        oldContribution,
        newContribution,
      );
    }

    if (newGoalId && oldGoalId !== newGoalId) {
      TransactionService.addTransactionToGoal(goalStore, newGoalId, newContribution, id);
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
    TransactionService.removeTransactionFromCategory(categoryStore, transaction.categoryId, id);
    // Remove from goal's progress
    TransactionService.removeTransactionFromGoal(
      goalStore,
      transaction.goalId,
      Math.abs(transaction.amount),
      id,
    );
  }

  // ---------------------------
  // Aggregations and dashboard
  // ---------------------------

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

    const currentMonthly = TransactionService.getMonthlyIncomeAndExpenses(userId, year, monthIndex);

    const prevDate = new Date(year, monthIndex - 1, 1);
    const prevMonthly = TransactionService.getMonthlyIncomeAndExpenses(
      userId,
      prevDate.getFullYear(),
      prevDate.getMonth(),
    );

    const monthlySavings = currentMonthly.income - currentMonthly.expenses;
    const prevMonthlySavings = prevMonthly.income - prevMonthly.expenses;

    const balance = TransactionService.getBalance(userId);
    const prevBalanceCutoff = new Date(year, monthIndex, 0, 23, 59, 59);
    const prevBalance = TransactionService.getBalanceUntilDate(userId, prevBalanceCutoff);

    return {
      balance,
      balanceChangePct: MathUtils.calculatePercentageChange(balance, prevBalance),
      monthlyIncome: currentMonthly.income,
      monthlyIncomeChangePct: MathUtils.calculatePercentageChange(
        currentMonthly.income,
        prevMonthly.income,
      ),
      monthlyExpenses: currentMonthly.expenses,
      monthlyExpensesChangePct: MathUtils.calculatePercentageChange(
        currentMonthly.expenses,
        prevMonthly.expenses,
      ),
      monthlySavings,
      monthlySavingsChangePct: MathUtils.calculatePercentageChange(
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
        TransactionService.getMonthlyIncomeAndExpenses(userId, d.getFullYear(), d.getMonth());

      labels.push(label);
      income.push(monthIncome);
      expenses.push(monthExpenses);
    }

    return { labels, income, expenses };
  }

  // ---------------------------
  // Private helpers
  // ---------------------------

  private static buildNewTransaction(dto: CreateTransactionDTO): TransactionInterface {
    const now = new Date();
    return {
      id: Date.now(),
      amount: dto.amount,
      description: dto.description,
      date: new Date(dto.date),
      createdAt: now,
      updatedAt: now,
      userId: dto.userId,
      categoryId: dto.categoryId,
      goalId: dto.goalId,
    };
  }

  private static addTransactionToCategory(
    categoryStore: ReturnType<typeof useCategoryStore>,
    categoryId: number | null | undefined,
    transactionId: number,
  ): void {
    if (!categoryId) return;

    const category = categoryStore.categories.find((c) => c.id === categoryId);
    if (!category) return;

    category.transactionIds = [...(category.transactionIds ?? []), transactionId];
  }

  private static removeTransactionFromCategory(
    categoryStore: ReturnType<typeof useCategoryStore>,
    categoryId: number | null | undefined,
    transactionId: number,
  ): void {
    if (!categoryId) return;

    const category = categoryStore.categories.find((c) => c.id === categoryId);
    if (!category) return;

    category.transactionIds = (category.transactionIds ?? []).filter(
      (tid) => tid !== transactionId,
    );
  }

  private static addTransactionToGoal(
    goalStore: ReturnType<typeof useGoalStore>,
    goalId: number | null | undefined,
    amount: number,
    transactionId: number,
    updatedAt: Date = new Date(),
  ): void {
    if (!goalId) return;

    const goal = goalStore.goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.currentAmount += Math.abs(amount);
    goal.updatedAt = updatedAt;
    goal.transactionIds = [...(goal.transactionIds ?? []), transactionId];
    goal.status = new GoalStatusUtils({
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
    }).getStatus();
  }

  private static removeTransactionFromGoal(
    goalStore: ReturnType<typeof useGoalStore>,
    goalId: number | null | undefined,
    amountToDiscount: number,
    transactionId: number,
  ): void {
    if (!goalId) return;

    const goal = goalStore.goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.currentAmount = Math.max(goal.currentAmount - amountToDiscount, 0);
    goal.transactionIds = (goal.transactionIds ?? []).filter((tid) => tid !== transactionId);
    goal.status = new GoalStatusUtils({
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
    }).getStatus();
  }

  private static recalculateGoalContribution(
    goalStore: ReturnType<typeof useGoalStore>,
    goalId: number,
    oldContribution: number,
    newContribution: number,
  ): void {
    const goal = goalStore.goals.find((g) => g.id === goalId);
    if (!goal) return;

    goal.currentAmount = Math.max(goal.currentAmount - oldContribution + newContribution, 0);
    goal.status = new GoalStatusUtils({
      currentAmount: goal.currentAmount,
      targetAmount: goal.targetAmount,
    }).getStatus();
  }

  private static getMonthlyIncomeAndExpenses(
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

  private static getBalanceUntilDate(userId: number, until: Date): number {
    const ts = until.getTime();
    return TransactionService.getByUser(userId)
      .filter((t) => new Date(t.date).getTime() <= ts)
      .reduce((sum, t) => sum + t.amount, 0);
  }
}
