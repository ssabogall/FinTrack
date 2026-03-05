// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { CategoryInterface } from '@/interfaces/CategoryInterface';

export const useCategoryStore = defineStore('category', () => {
  const categories = ref<CategoryInterface[]>([]);

  return { categories };
});
