// author: Santiago Gómez
// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { GoalInterface } from '@/modules/goal/interfaces/GoalInterface';

export const useGoalStore = defineStore('goal', () => {
  const goals = ref<GoalInterface[]>([]);

  return { goals };
});
