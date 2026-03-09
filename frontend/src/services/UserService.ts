// author: Santiago Gómez Ospina

// internal imports
import type { UpdateUserDto } from '@/dtos/user/UpdateUserDto';
import type { UserInterface } from '@/interfaces/UserInterface';
import { useAuthStore } from '@/stores/authstore';
import { useUserStore } from '@/stores/userstore';

export class UserService {
  public static updateProfile(name: string, email: string): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const user = authStore.currentUser;
    if (!user) return;

    const index = userStore.users.findIndex((u) => u.id === user.id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) return;

    const updated: UserInterface = {
      id: existing.id,
      name: name.trim(),
      email: email.trim(),
      password: existing.password,
      role: existing.role,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      categoryIds: existing.categoryIds ?? null,
      goalIds: existing.goalIds ?? null,
      transactionIds: existing.transactionIds ?? null,
    };
    userStore.users[index] = updated;
    authStore.currentUser = updated;
  }

  public static changePassword(currentPassword: string, newPassword: string): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const user = authStore.currentUser;
    if (!user) throw new Error('Not authenticated.');

    if (user.password !== currentPassword) {
      throw new Error('Current password is incorrect.');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }

    const index = userStore.users.findIndex((u) => u.id === user.id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) return;

    const updated: UserInterface = {
      ...existing,
      password: newPassword,
      updatedAt: new Date(),
    };
    userStore.users[index] = updated;
    authStore.currentUser = updated;
  }

  public static getAllUsers(): UserInterface[] {
    return useUserStore().users;
  }

  public static getUserById(id: number): UserInterface | null {
    return useUserStore().users.find((u) => u.id === id) ?? null;
  }

  public static updateUser(id: number, dto: UpdateUserDto): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const index = userStore.users.findIndex((u) => u.id === id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) throw new Error('User not found.');

    const updated: UserInterface = {
      id: existing.id,
      name: dto.name ?? existing.name,
      email: dto.email ?? existing.email,
      password: dto.password ?? existing.password,
      role: dto.role ?? existing.role,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
      categoryIds: existing.categoryIds ?? null,
      goalIds: existing.goalIds ?? null,
      transactionIds: existing.transactionIds ?? null,
    };
    userStore.users[index] = updated;
    if (authStore.currentUser?.id === id) {
      authStore.currentUser = updated;
    }
  }
}
