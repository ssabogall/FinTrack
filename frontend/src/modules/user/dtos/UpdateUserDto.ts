// author: Santiago Gómez
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export type UpdateUserDto = Partial<
  Omit<
    UserInterface,
    'id' | 'createdAt' | 'updatedAt' | 'categoryIds' | 'goalIds' | 'transactionIds'
  >
>;
