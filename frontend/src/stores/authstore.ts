// author: Santiago Gómez Ospina

// external imports
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserInterface | null>(null);

  const isAuthenticated = computed(() => currentUser.value !== null);

  return {
    currentUser,
    isAuthenticated,
  };
});
