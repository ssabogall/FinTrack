import type { UserInterface } from '@/interfaces/UserInterface';

// DTO for partial user updates, derived from the domain model using Omit
export type UpdateUserDto = Partial<
  Omit<UserInterface, 'id' | 'createdAt' | 'updatedAt' | 'transactionIds' | 'goalIds'>
>;
