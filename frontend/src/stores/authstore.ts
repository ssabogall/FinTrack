// author: Santiago Gómez Ospina

// external imports
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<UserInterface | null>(null);
  const users = ref<UserInterface[]>([]);

  const isAuthenticated = computed(() => currentUser.value !== null);

  function register(name: string, email: string, password: string): void {
    const existingUser = users.value.find((user) => user.email === email);

    if (existingUser) {
      throw new Error('The email is already registered.');
    }

    const id = Date.now();
    const now = new Date();

    const newUser: UserInterface = {
      id,
      name,
      email,
      password,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      transactionIds: [],
      goalIds: [],
    };

    users.value.push(newUser);
    currentUser.value = newUser;
  }

  function login(email: string, password: string): void {
    const user = users.value.find(
      (u) => u.email === email && u.password === password,
    );

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    currentUser.value = user;
  }

  function logout(): void {
    currentUser.value = null;
  }

  return {
    currentUser,
    users,
    isAuthenticated,
    register,
    login,
    logout,
  };
});
