// author: Santiago Gómez Ospina

// external imports
import { defineStore } from 'pinia';
import { ref } from 'vue';

// internal imports
import { AuthService } from '@/services/AuthService';
import type { UserInterface } from '@/interfaces/UserInterface';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInterface | null>(null);
  const isAuthenticated = ref(false);
  const status = ref<AuthStatus>('idle');
  const errorMessage = ref<string | null>(null);

  function login(email: string, password: string): boolean {
    status.value = 'loading';
    errorMessage.value = null;

    const foundUser = AuthService.login(email, password);

    if (foundUser) {
      user.value = foundUser;
      isAuthenticated.value = true;
      status.value = 'authenticated';
      return true;
    }

    status.value = 'error';
    errorMessage.value = 'Invalid credentials';
    return false;
  }

  function logout(): void {
    user.value = null;
    isAuthenticated.value = false;
    status.value = 'idle';
    errorMessage.value = null;
  }

  return {
    user,
    isAuthenticated,
    status,
    errorMessage,
    login,
    logout,
  };
});
