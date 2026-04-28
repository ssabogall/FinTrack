// author: Lucas Higuita
// external imports
import axios from 'axios';

// internal imports
import type { CreateCategoryDTO } from '@/modules/category/dtos/CreateCategoryDTO';
import type { UpdateCategoryDTO } from '@/modules/category/dtos/UpdateCategoryDTO';
import type { CategoryInterface } from '@/modules/category/interfaces/CategoryInterface';

export class CategoryService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly API_URL = `${this.API_BASE_URL}/api/categories`;

  public static async getAll(): Promise<CategoryInterface[]> {
    const { data } = await axios.get<CategoryInterface[]>(this.API_URL);
    return data;
  }

  public static async getById(id: number): Promise<CategoryInterface> {
    const { data } = await axios.get<CategoryInterface>(`${this.API_URL}/${id}`);
    return data;
  }

  public static async create(dto: CreateCategoryDTO): Promise<CategoryInterface> {
    const { data } = await axios.post<CategoryInterface>(this.API_URL, {
      ...dto,
      name: dto.name.trim(),
      type: dto.type.trim().toLowerCase(),
      color: dto.color.trim(),
    });
    return data;
  }

  public static async update(id: number, dto: UpdateCategoryDTO): Promise<CategoryInterface> {
    const payload = {
      ...dto,
      name: dto.name?.trim(),
      type: dto.type?.trim().toLowerCase(),
      color: dto.color?.trim(),
    };
    const { data } = await axios.patch<CategoryInterface>(`${this.API_URL}/${id}`, payload);
    return data;
  }

  public static async delete(id: number): Promise<void> {
    await axios.delete(`${this.API_URL}/${id}`);
  }
}
