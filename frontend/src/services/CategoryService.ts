// internal imports
import type { CreateCategoryDTO } from '@/dtos/category/CreateCategoryDTO';
import type { UpdateCategoryDTO } from '@/dtos/category/UpdateCategoryDTO';
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import { AuthService } from '@/services/AuthService';
import { useAuthStore } from '@/stores/authstore';
import { useCategoryStore } from '@/stores/categorystore';
import { useTransactionStore } from '@/stores/transactionstore';
import { useUserStore } from '@/stores/userstore';

export class CategoryService {
  public static getAll(): CategoryInterface[] {
    return useCategoryStore().categories;
  }

  public static getByUser(userId: number): CategoryInterface[] {
    return useCategoryStore().categories.filter((c) => c.userId === userId);
  }

  public static getForCurrentUser(includeAdminGlobal = false): CategoryInterface[] {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];
    if (includeAdminGlobal && AuthService.isAdmin()) {
      return CategoryService.getAll();
    }
    return CategoryService.getByUser(currentUser.id);
  }

  public static getById(id: number): CategoryInterface | undefined {
    return useCategoryStore().categories.find((c) => c.id === id);
  }

  public static create(dto: CreateCategoryDTO): void {
    if (!dto.name.trim()) {
      throw new Error('Category name cannot be empty.');
    }

    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error('You must be logged in to create a category.');
    }

    const categoryStore = useCategoryStore();

    const duplicate = categoryStore.categories.find(
      (c) => c.userId === currentUser.id && c.name.toLowerCase() === dto.name.trim().toLowerCase(),
    );

    if (duplicate) {
      throw new Error('A category with this name already exists.');
    }

    const now = new Date();
    const id = Date.now();

    const newCategory: CategoryInterface = {
      id,
      name: dto.name.trim(),
      color: dto.color,
      type: dto.type,
      createdAt: now,
      updatedAt: now,
      userId: currentUser.id,
      transactionIds: [],
    };

    categoryStore.categories.push(newCategory);

    const authStore = useAuthStore();
    if (authStore.currentUser && authStore.currentUser.id === currentUser.id) {
      authStore.currentUser.categoryIds = [...(authStore.currentUser.categoryIds ?? []), id];
    }
    const userStore = useUserStore();
    const userIndex = userStore.users.findIndex((u) => u.id === currentUser.id);
    if (userIndex !== -1) {
      const user = userStore.users[userIndex];
      if (user) {
        userStore.users[userIndex] = {
          ...user,
          categoryIds: [...(user.categoryIds ?? []), id],
        };
      }
    }
  }

  public static update(id: number, dto: UpdateCategoryDTO): void {
    if (dto.name !== undefined && !dto.name.trim()) {
      throw new Error('Category name cannot be empty.');
    }

    const categoryStore = useCategoryStore();
    const index = categoryStore.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Category not found.');
    }

    const current = categoryStore.categories[index];
    if (!current) {
      throw new Error('Category not found.');
    }

    if (dto.name !== undefined) {
      const duplicate = categoryStore.categories.find(
        (c) =>
          c.id !== id &&
          c.userId === current.userId &&
          c.name.toLowerCase() === dto.name!.trim().toLowerCase(),
      );
      if (duplicate) {
        throw new Error('A category with this name already exists.');
      }
    }

    categoryStore.categories[index] = {
      id: current.id,
      name: dto.name?.trim() ?? current.name,
      color: dto.color ?? current.color,
      type: dto.type ?? current.type,
      createdAt: current.createdAt,
      updatedAt: new Date(),
      userId: current.userId,
      transactionIds: current.transactionIds,
    } as CategoryInterface;
  }

  public static delete(id: number): void {
    const categoryStore = useCategoryStore();
    const transactionStore = useTransactionStore();
    const userStore = useUserStore();
    const authStore = useAuthStore();

    const index = categoryStore.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Category not found.');
    }

    const category = categoryStore.categories[index];
    if (!category) {
      throw new Error('Category not found.');
    }

    const hasTransactions = transactionStore.transactions.some((t) => t.categoryId === id);

    if (hasTransactions) {
      throw new Error('Cannot delete a category that has associated transactions.');
    }

    categoryStore.categories.splice(index, 1);

    const userId = category.userId;
    const userIndex = userStore.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      const user = userStore.users[userIndex];
      if (user) {
        const newCategoryIds = (user.categoryIds ?? []).filter((cid) => cid !== id);
        userStore.users[userIndex] = {
          ...user,
          categoryIds: newCategoryIds.length > 0 ? newCategoryIds : null,
        };
      }
    }
    if (authStore.currentUser?.id === userId) {
      const next = (authStore.currentUser.categoryIds ?? []).filter((cid) => cid !== id);
      authStore.currentUser.categoryIds = next.length > 0 ? next : null;
    }
  }

  public static getTransactionCount(categoryId: number, userId: number): number {
    const transactionStore = useTransactionStore();
    return transactionStore.transactions.filter(
      (t) => t.categoryId === categoryId && t.userId === userId,
    ).length;
  }

  public static getTotalAmount(categoryId: number, userId: number): number {
    const transactionStore = useTransactionStore();
    return transactionStore.transactions
      .filter((t) => t.categoryId === categoryId && t.userId === userId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  public static getSummary(categories: CategoryInterface[]): {
    total: number;
    expense: number;
    income: number;
  } {
    const total = categories.length;
    const expense = categories.filter((c) => c.type === 'expense').length;
    const income = categories.filter((c) => c.type === 'income').length;

    return { total, expense, income };
  }

  public static filter(
    categories: CategoryInterface[],
    search: string,
    type: string,
  ): CategoryInterface[] {
    let result = categories;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }

    if (type !== 'all') {
      result = result.filter((c) => c.type === type);
    }

    return result;
  }

  public static getExpenseDistribution(userId: number): {
    name: string;
    amount: number;
    color: string;
  }[] {
    const transactionStore = useTransactionStore();
    const categoryStore = useCategoryStore();

    const map = new Map<number, { name: string; amount: number; color: string }>();

    for (const tx of transactionStore.transactions) {
      if (tx.userId !== userId || tx.amount >= 0 || !tx.categoryId) continue;
      const cat = categoryStore.categories.find((c) => c.id === tx.categoryId);
      if (!cat || cat.type !== 'expense') continue;

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
