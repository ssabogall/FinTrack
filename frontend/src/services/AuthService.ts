// author: Santiago Gómez Ospina
// internal imports
import type { UserInterface } from '@/interfaces/UserInterface';

const USERS_KEY = 'users';

export class AuthService {
  public static register(user: UserInterface) {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  public static login(email: string, password: string): UserInterface | null {
    const users = this.getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      return user;
    }

    return null;
  }

  public static getAllUsers(): UserInterface[] {
    return this.getUsers();
  }

  private static getUsers(): UserInterface[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }
}
