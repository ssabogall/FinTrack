// author: Santiago Gómez Ospina

// internal imports
import type { RegisterUserDto } from '@/dtos/RegisterUserDto';
import type { UserInterface } from '@/interfaces/UserInterface';
import { useAuthStore } from '@/stores/authstore';

export class AuthService {
  public static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  public static isAuthenticated(): boolean {
    return useAuthStore().isAuthenticated;
  }

  public static register(dto: RegisterUserDto): void {
    const authStore = useAuthStore();

    const existingUser = authStore.users.find((user) => user.email === dto.email);

    if (existingUser) {
      throw new Error('The email is already registered.');
    }

    if (dto.password !== dto.passwordConfirmation) {
      throw new Error('Passwords do not match.');
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
      transactionIds: [],
      goalIds: [],
    };

    authStore.users.push(newUser);
    authStore.currentUser = newUser;
  }

  public static login(email: string, password: string): void {
    const authStore = useAuthStore();

    const user = authStore.users.find((u) => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid credentials.');
    }

    authStore.currentUser = user;
  }

  public static isAdmin(): boolean {
    const user = useAuthStore().currentUser;
    return user?.role === 'admin';
  }

  public static logout(): void {
    const authStore = useAuthStore();
    authStore.currentUser = null;
  }
}
