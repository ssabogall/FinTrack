// internal imports
import type { CreateTransactionDTO } from '@/dtos/transaction/CreateTransactionDTO';
import type { TransactionInterface } from '@/interfaces/TransactionInterface';
import type { UpdateTransactionDTO } from '@/dtos/transaction/UpdateTransactionDTO';
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
}
