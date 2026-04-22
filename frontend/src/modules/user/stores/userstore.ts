// author: Santiago Gómez
// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export const useUserStore = defineStore('user', () => {
  const users = ref<UserInterface[]>([]);

  return { users };
});
