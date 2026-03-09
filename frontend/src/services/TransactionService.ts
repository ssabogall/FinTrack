// internal imports
import type { CreateTransactionDTO } from '@/dtos/transaction/CreateTransactionDTO';
import type { TransactionFilterDTO } from '@/dtos/transaction/TransactionFilterDTO';
import type { UpdateTransactionDTO } from '@/dtos/transaction/UpdateTransactionDTO';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import { useAuthStore } from '@/stores/authstore';
import { useCategoryStore } from '@/stores/categorystore';
import { useTransactionStore } from '@/stores/transactionstore';

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

    transactionStore.transactions[index] = {
      id: current.id,
      amount: dto.amount ?? current.amount,
      description: dto.description ?? current.description,
      date: dto.date ? new Date(dto.date) : current.date,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      userId: current.userId,
      categoryId: newCategoryId,
      goalId: dto.goalId !== undefined ? dto.goalId : current.goalId,
    } as TransactionInterface;
  }

  public static delete(id: number): void {
    const transactionStore = useTransactionStore();
    const authStore = useAuthStore();
    const categoryStore = useCategoryStore();

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
}
