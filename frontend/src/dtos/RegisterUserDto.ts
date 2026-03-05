import type { UserInterface } from '@/interfaces/UserInterface';

export type RegisterUserDto = Omit<
  UserInterface,
  'id' | 'role' | 'createdAt' | 'updatedAt' | 'transactionIds' | 'goalIds'
> & {
  passwordConfirmation: string;
};
