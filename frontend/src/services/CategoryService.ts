// internal imports
import type { CreateCategoryDTO } from '@/dtos/category/CreateCategoryDTO';
import type { UpdateCategoryDTO } from '@/dtos/category/UpdateCategoryDTO';
import type { CategoryInterface } from '@/interfaces/CategoryInterface';
import { useCategoryStore } from '@/stores/categorystore';
import { useTransactionStore } from '@/stores/transactionstore';

export class CategoryService {
  public static getAll(): CategoryInterface[] {
    return useCategoryStore().categories;
  }

  public static getById(id: number): CategoryInterface | undefined {
    return useCategoryStore().categories.find((c) => c.id === id);
  }

  public static create(dto: CreateCategoryDTO): void {
    if (!dto.name.trim()) {
      throw new Error('Category name cannot be empty.');
    }

    const categoryStore = useCategoryStore();

    const duplicate = categoryStore.categories.find(
      (c) => c.name.toLowerCase() === dto.name.trim().toLowerCase(),
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
      transactionIds: [],
    };

    categoryStore.categories.push(newCategory);
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
        (c) => c.id !== id && c.name.toLowerCase() === dto.name!.trim().toLowerCase(),
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
      transactionIds: current.transactionIds,
    } as CategoryInterface;
  }

  public static delete(id: number): void {
    const categoryStore = useCategoryStore();
    const transactionStore = useTransactionStore();

    const index = categoryStore.categories.findIndex((c) => c.id === id);

    if (index === -1) {
      throw new Error('Category not found.');
    }

    const hasTransactions = transactionStore.transactions.some((t) => t.categoryId === id);

    if (hasTransactions) {
      throw new Error('Cannot delete a category that has associated transactions.');
    }

    categoryStore.categories.splice(index, 1);
  }

  public static getTransactionCount(categoryId: number): number {
    const transactionStore = useTransactionStore();
    return transactionStore.transactions.filter((t) => t.categoryId === categoryId).length;
  }

  public static getTotalAmount(categoryId: number): number {
    const transactionStore = useTransactionStore();
    return transactionStore.transactions
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  public static getSummary(): { total: number; expense: number; income: number } {
    const categories = CategoryService.getAll();
    const total = categories.length;
    const expense = categories.filter((c) => c.type === 'expense').length;
    const income = categories.filter((c) => c.type === 'income').length;

    return { total, expense, income };
  }

  public static filter(search: string, type: string): CategoryInterface[] {
    const categories = CategoryService.getAll();
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

  public static getExpenseDistribution(): { name: string; amount: number; color: string }[] {
    const transactionStore = useTransactionStore();
    const categoryStore = useCategoryStore();

    const map = new Map<number, { name: string; amount: number; color: string }>();

    for (const tx of transactionStore.transactions) {
      if (tx.amount >= 0 || !tx.categoryId) continue;
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
