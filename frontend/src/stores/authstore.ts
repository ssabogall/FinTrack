// author: Santiago Gómez Ospina

// external imports
import { defineStore } from 'pinia';

// internal imports
import { AuthService } from '@/services/AuthService';
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as UserInterface | null,
    isAuthenticated: false,
    status: 'idle' as 'idle' | 'loading' | 'authenticated' | 'error',
    errorMessage: null as string | null,
  }),

  actions: {
    login(email: string, password: string): boolean {
      this.status = 'loading';
      this.errorMessage = null;

      const user = AuthService.login(email, password);

      if (user) {
        this.user = user;
        this.isAuthenticated = true;
        this.status = 'authenticated';
        return true;
      }

      this.status = 'error';
      this.errorMessage = 'Invalid credentials';
      return false;
    },

    logout(): void {
      this.user = null;
      this.isAuthenticated = false;
      this.status = 'idle';
      this.errorMessage = null;
    },
  },
});
