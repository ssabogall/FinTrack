// author: Lucas Higuita
// external imports
import axios from 'axios';

// internal imports
import type { CreateTransactionDTO } from '@/modules/transaction/dtos/CreateTransactionDTO';
import type { UpdateTransactionDTO } from '@/modules/transaction/dtos/UpdateTransactionDTO';
import type { TransactionInterface } from '@/modules/transaction/interfaces/TransactionInterface';

export class TransactionService {
  private static readonly API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  private static readonly API_URL = `${this.API_BASE_URL}/api/transactions`;

  public static async getTransactions(): Promise<TransactionInterface[]> {
    const { data } = await axios.get<TransactionInterface[]>(this.API_URL);
    return data;
  }

  public static async getTransactionById(id: number): Promise<TransactionInterface> {
    const { data } = await axios.get<TransactionInterface>(`${this.API_URL}/${id}`);
    return data;
  }

  public static async create(dto: CreateTransactionDTO): Promise<TransactionInterface> {
    const { data } = await axios.post<TransactionInterface>(this.API_URL, {
      ...dto,
      description: dto.description.trim(),
    });
    return data;
  }

  public static async update(id: number, dto: UpdateTransactionDTO): Promise<TransactionInterface> {
    if (dto.description !== undefined && !dto.description.trim()) {
      throw new Error('Description cannot be empty.');
    }
    if (dto.amount !== undefined && dto.amount === 0) {
      throw new Error('Amount cannot be zero.');
    }

    const payload = {
      ...dto,
      description: dto.description?.trim(),
    };

    const { data } = await axios.patch<TransactionInterface>(`${this.API_URL}/${id}`, payload);
    return data;
  }

  public static async delete(id: number): Promise<void> {
    await axios.delete(`${this.API_URL}/${id}`);
  }
}
