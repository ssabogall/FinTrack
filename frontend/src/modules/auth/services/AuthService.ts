// author: Santiago Gómez Ospina

// external imports
import axios, { AxiosError } from 'axios';

// internal imports
import type { RegisterUserDto } from '@/modules/user/dtos/RegisterUserDto';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';
import { useAuthStore } from '@/modules/auth/stores/authstore';

const ACCESS_TOKEN_KEY = 'fintrack_access_token';

export class AuthService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly AUTH_API_URL = `${this.API_BASE_URL}/api/auth`;

  public static isAuthenticated(): boolean {
    return useAuthStore().isAuthenticated;
  }

  public static getCurrentUser(): UserInterface | null {
    return useAuthStore().currentUser;
  }

  public static isAdmin(): boolean {
    return useAuthStore().currentUser?.role === 'admin';
  }

  public static async login(email: string, password: string): Promise<void> {
    try {
      const { data } = await axios.post<{ access_token: string }>(`${this.AUTH_API_URL}/login`, {
        email,
        password,
      });
      AuthService.applyAccessToken(data.access_token);
      await AuthService.loadCurrentUser();
    } catch (error) {
      AuthService.clearSession();
      throw AuthService.toUserError(error, 'Invalid email or password.');
    }
  }

  public static async register(dto: RegisterUserDto): Promise<void> {
    if (dto.password !== dto.passwordConfirmation) {
      throw new Error('Passwords do not match.');
    }

    try {
      const { data } = await axios.post<{ access_token: string }>(`${this.AUTH_API_URL}/register`, {
        name: dto.name,
        email: dto.email,
        password: dto.password,
      });
      AuthService.applyAccessToken(data.access_token);
      await AuthService.loadCurrentUser();
    } catch (error) {
      AuthService.clearSession();
      throw AuthService.toUserError(error, 'There was a problem creating your account.');
    }
  }

  public static logout(): void {
    AuthService.clearSession();
  }

  public static async bootstrap(): Promise<void> {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!token) {
      AuthService.clearSession();
      return;
    }

    AuthService.applyAccessToken(token);
    try {
      await AuthService.loadCurrentUser();
    } catch {
      AuthService.clearSession();
    }
  }

  // ---------------------------
  // Private helpers
  // ---------------------------

  private static async loadCurrentUser(): Promise<void> {
    const { data } = await axios.get<MeResponse>(`${this.AUTH_API_URL}/me`);
    useAuthStore().currentUser = AuthService.toUser(data);
  }

  private static applyAccessToken(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  private static clearSession(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    delete axios.defaults.headers.common.Authorization;
    useAuthStore().currentUser = null;
  }

  private static toUser(response: MeResponse): UserInterface {
    return {
      id: response.id,
      name: response.name,
      email: response.email,
      password: '',
      role: response.role,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      categoryIds: [],
      goalIds: null,
      transactionIds: [],
    };
  }

  private static toUserError(error: unknown, fallback: string): Error {
    if (!(error instanceof AxiosError)) {
      return error instanceof Error ? error : new Error(fallback);
    }

    const message = error.response?.data?.message;
    if (Array.isArray(message)) return new Error(message.join(' '));
    if (typeof message === 'string') return new Error(message);
    return new Error(fallback);
  }
}

interface MeResponse {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}
