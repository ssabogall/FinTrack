// author: Lucas Higuita
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';

export type UpdateCategoryDTO = Partial<Pick<CategoryInterface, 'name' | 'color' | 'type'>>;
