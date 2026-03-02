import type { UserInterface } from '@/interfaces/UserInterface';

export const userSeeder: UserInterface[] = [
  {
    id: 1,
    name: 'Admin',
    email: 'admin@fintrack.local',
    password: 'admin123',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
    transactionIds: [],
    goalIds: [],
  },
];
