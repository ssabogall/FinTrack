// author: Lucas Higuita
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';

export class CategoryUtils {
  private readonly categories: CategoryInterface[];
  private readonly transactions: TransactionInterface[];

  constructor({
    categories,
    transactions,
  }: {
    categories: CategoryInterface[];
    transactions: TransactionInterface[];
  }) {
    this.categories = categories;
    this.transactions = transactions;
  }

  public filter(search: string, type: string): CategoryInterface[] {
    let result = this.categories;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (type !== 'all') {
      result = result.filter((c) => c.type === type);
    }
    return result;
  }

  public getSummary(): { total: number; expense: number; income: number } {
    return {
      total: this.categories.length,
      expense: this.categories.filter((c) => c.type === 'expense').length,
      income: this.categories.filter((c) => c.type === 'income').length,
    };
  }

  public getTransactionCount(categoryId: number): number {
    return this.transactions.filter((t) => t.categoryId === categoryId).length;
  }

  public getTotalAmount(categoryId: number): number {
    return this.transactions
      .filter((t) => t.categoryId === categoryId)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }

  public getExpenseDistribution(): { name: string; amount: number; color: string }[] {
    const map = new Map<number, { name: string; amount: number; color: string }>();

    for (const tx of this.transactions) {
      if (tx.amount >= 0 || !tx.categoryId) continue;
      const category = this.categories.find((c) => c.id === tx.categoryId);
      if (!category || category.type !== 'expense') continue;

      const existing = map.get(category.id);
      if (existing) {
        existing.amount += Math.abs(tx.amount);
      } else {
        map.set(category.id, {
          name: category.name,
          amount: Math.abs(tx.amount),
          color: category.color,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }
}
