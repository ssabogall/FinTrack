// author: Santiago Gómez Ospina
// external imports
import axios from 'axios';

// internal imports
import type { CreateUserDto } from '@/modules/user/dtos/CreateUserDto';
import type { UpdateUserDto } from '@/modules/user/dtos/UpdateUserDto';
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export class UserService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
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

  public static async updateProfile(
    id: number,
    name: string,
    email: string,
  ): Promise<UserInterface> {
    return UserService.updateUser(id, { name: name.trim(), email: email.trim() });
  }

  public static async changePassword(id: number, newPassword: string): Promise<UserInterface> {
    return UserService.updateUser(id, { password: newPassword });
  }
}
