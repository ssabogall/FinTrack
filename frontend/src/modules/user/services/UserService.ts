// author: Santiago Gómez Ospina
// external imports
import axios from 'axios';

// internal imports
import type { CreateUserDto } from '@/modules/user/dtos/CreateUserDto';
import type { UpdateUserDto } from '@/modules/user/dtos/UpdateUserDto';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { useAuthStore } from '@/modules/auth/stores/authstore';
import { useUserStore } from '@/modules/user/stores/userstore';

export class UserService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly API_URL = `${this.API_BASE_URL}/api/users`;

  public static async getAllUsers(): Promise<UserInterface[]> {
    const { data } = await axios.get<UserInterface[]>(this.API_URL);
    return data;
  }

  public static async getUserById(id: number): Promise<UserInterface | null> {
    const { data } = await axios.get<UserInterface>(`${this.API_URL}/${id}`);
    return data;
  }

  public static async createUser(dto: CreateUserDto): Promise<UserInterface> {
    const { data } = await axios.post<UserInterface>(this.API_URL, dto);
    return data;
  }

  public static async updateUser(id: number, dto: UpdateUserDto): Promise<UserInterface> {
    const { data } = await axios.put<UserInterface>(`${this.API_URL}/${id}`, dto);
    return data;
  }

  public static updateProfile(name: string, email: string): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const currentUser = authStore.currentUser;
    if (!currentUser) return;

    const index = userStore.users.findIndex((u) => u.id === currentUser.id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) return;

    const updated = UserService.buildUpdatedUser(existing, {
      name: name.trim(),
      email: email.trim(),
      password: existing.password,
      role: existing.role,
    });
    userStore.users[index] = updated;
    authStore.currentUser = updated;
  }

  public static changePassword(currentPassword: string, newPassword: string): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const currentUser = authStore.currentUser;
    if (!currentUser) throw new Error('Not authenticated.');

    if (currentUser.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const index = userStore.users.findIndex((u) => u.id === currentUser.id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) return;

    const updated = UserService.buildUpdatedUser(existing, {
      name: existing.name,
      email: existing.email,
      password: newPassword,
      role: existing.role,
    });
    userStore.users[index] = updated;
    authStore.currentUser = updated;
  }

  // ---------------------------
  // Private helpers
  // ---------------------------

  private static buildUpdatedUser(
    baseUser: UserInterface,
    nextValues: Pick<UserInterface, 'name' | 'email' | 'password' | 'role'>,
  ): UserInterface {
    return {
      id: baseUser.id,
      name: nextValues.name,
      email: nextValues.email,
      password: nextValues.password,
      role: nextValues.role,
      createdAt: baseUser.createdAt,
      updatedAt: new Date(),
      categoryIds: baseUser.categoryIds ?? null,
      goalIds: baseUser.goalIds ?? null,
      transactionIds: baseUser.transactionIds ?? null,
    };
  }
}
