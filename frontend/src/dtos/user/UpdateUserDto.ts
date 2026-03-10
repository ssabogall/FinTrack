// author: Santiago Gómez
import type { UserInterface } from '@/interfaces/UserInterface';

export type UpdateUserDto = Partial<
  Omit<
    UserInterface,
    'id' | 'createdAt' | 'updatedAt' | 'categoryIds' | 'goalIds' | 'transactionIds'
  >
>;
