// author: Lucas Higuita
import type { CategoryInterface } from '@/interfaces/CategoryInterface';

export type UpdateCategoryDTO = Partial<Pick<CategoryInterface, 'name' | 'color' | 'type'>>;
