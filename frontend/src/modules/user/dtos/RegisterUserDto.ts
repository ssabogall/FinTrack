// author: Santiago Gómez
import type { UserInterface } from '@/modules/user/interfaces/UserInterface';

export type RegisterUserDto = Omit<
  UserInterface,
  'id' | 'role' | 'createdAt' | 'updatedAt' | 'categoryIds' | 'goalIds' | 'transactionIds'
> & {
  passwordConfirmation: string;
};
