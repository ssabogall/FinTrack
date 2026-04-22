// author: Lucas Higuita
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';

export type CreateCategoryDTO = Omit<
  CategoryInterface,
  'id' | 'createdAt' | 'updatedAt' | 'transactionIds' | 'userId'
>;
