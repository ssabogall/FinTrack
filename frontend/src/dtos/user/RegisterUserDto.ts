import type { UserInterface } from '@/interfaces/UserInterface';

export type RegisterUserDto = Omit<
  UserInterface,
  'id' | 'role' | 'createdAt' | 'updatedAt' | 'categoryIds' | 'goalIds' | 'transactionIds'
> & {
  passwordConfirmation: string;
};
