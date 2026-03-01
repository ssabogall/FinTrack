// author: Santiago Gómez Ospina

// internal imports
import { useAuthStore } from '@/stores/authstore';
import type { UserInterface } from '@/interfaces/UserInterface';

export class AuthService {
  static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  static isAuthenticated(): boolean {
    return useAuthStore().isAuthenticated;
  }

  static register(name: string, email: string, password: string): void {
    useAuthStore().register(name, email, password);
  }

  static login(email: string, password: string): void {
    useAuthStore().login(email, password);
  }

  static logout(): void {
    useAuthStore().logout();
  }
}
