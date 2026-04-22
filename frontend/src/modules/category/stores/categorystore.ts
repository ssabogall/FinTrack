// author: Santiago Gómez
// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryInterface[]>([]);

  return { categories };
});
