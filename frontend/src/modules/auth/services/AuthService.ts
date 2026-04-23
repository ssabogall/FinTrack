// author: Santiago Gómez Ospina

// internal imports
import type { RegisterUserDto } from '@/modules/user/dtos/RegisterUserDto';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { useAuthStore } from '@/modules/auth/stores/authstore';
import { useUserStore } from '@/modules/user/stores/userstore';

export class AuthService {
  public static isAuthenticated(): boolean {
    return useAuthStore().isAuthenticated;
  }

  public static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  public static isAdmin(): boolean {
    return useAuthStore().currentUser?.role === 'admin';
  }

  public static register(dto: RegisterUserDto): void {
    if (dto.password !== dto.passwordConfirmation) {
      throw new Error('Passwords do not match.');
    }

    const authStore = useAuthStore();
    const userStore = useUserStore();

    const existingUser = userStore.users.find((user) => user.email === dto.email);

    if (existingUser) {
      throw new Error('The email is already registered.');
    }

    const id = Date.now();
    const now = new Date();

    const newUser: UserInterface = {
      id,
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: 'user',
      createdAt: now,
      updatedAt: now,
      categoryIds: [],
      goalIds: null,
      transactionIds: [],
    };

    userStore.users.push(newUser);
    authStore.currentUser = newUser;
  }

  public static login(email: string, password: string): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();

    const user = userStore.users.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    authStore.currentUser = user;
  }

  public static logout(): void {
    const authStore = useAuthStore();
    authStore.currentUser = null;
  }
}
