// author: Santiago Gómez Ospina

// internal imports
import type { CreateUserDto } from '@/modules/user/dtos/CreateUserDto';
import type { UpdateUserDto } from '@/modules/user/dtos/UpdateUserDto';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { useAuthStore } from '@/modules/auth/stores/authstore';
import { useUserStore } from '@/modules/user/stores/userstore';

export class UserService {
  public static getAllUsers(): UserInterface[] {
    return useUserStore().users;
  }

  public static getUserById(id: number): UserInterface | null {
    return useUserStore().users.find((u) => u.id === id) ?? null;
  }

  public static createUser(dto: CreateUserDto): UserInterface {
    const userStore = useUserStore();
    const normalizedEmail = dto.email.trim();
    const existing = userStore.users.find((u) => u.email === normalizedEmail);
    if (existing) throw new Error('Email already registered.');

    if (dto.password.length < 6) throw new Error('Password must be at least 6 characters.');

    const id = Date.now();
    const now = new Date();
    const newUser: UserInterface = {
      id,
      name: dto.name.trim(),
      email: normalizedEmail,
      password: dto.password,
      role: dto.role ?? 'user',
      createdAt: now,
      updatedAt: now,
      categoryIds: [],
      goalIds: null,
      transactionIds: [],
    };
    userStore.users.push(newUser);
    return newUser;
  }

  public static updateUser(id: number, dto: UpdateUserDto): void {
    const authStore = useAuthStore();
    const userStore = useUserStore();
    const index = userStore.users.findIndex((u) => u.id === id);
    const existing = index !== -1 ? userStore.users[index] : null;
    if (!existing) throw new Error('User not found.');

    const updated = UserService.buildUpdatedUser(existing, {
      name: dto.name ?? existing.name,
      email: dto.email ?? existing.email,
      password: dto.password ?? existing.password,
      role: dto.role ?? existing.role,
    });
    userStore.users[index] = updated;
    if (authStore.currentUser?.id === id) {
      authStore.currentUser = updated;
    }
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
