import type { GoalInterface } from '@/interfaces/GoalInterface';
import { GoalStatusHelper } from '@/utils/GoalStatusHelper';

const now = new Date();

export const goalSeeder: GoalInterface[] = [
  {
    id: 1,
    name: 'Emergency fund',
    description: 'Save 3 months of living expenses.',
    targetAmount: 3000,
    currentAmount: 1200,
    startDate: new Date(now.getFullYear(), now.getMonth() - 5, 1),
    endDate: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    status: GoalStatusHelper.compute(1200, 3000),
    createdAt: now,
    updatedAt: now,
    userId: 2,
    transactionIds: [8, 10],
  },
  {
    id: 2,
    name: 'New laptop',
    description: 'Save for a new work laptop.',
    targetAmount: 1500,
    currentAmount: 800,
    startDate: new Date(now.getFullYear(), now.getMonth() - 3, 15),
    endDate: new Date(now.getFullYear(), now.getMonth() + 3, 15),
    status: GoalStatusHelper.compute(800, 1500),
    createdAt: now,
    updatedAt: now,
    userId: 3,
    transactionIds: [11],
  },
  {
    id: 3,
    name: 'Vacation trip',
    description: 'Save for a summer vacation.',
    targetAmount: 2000,
    currentAmount: 1500,
    startDate: new Date(now.getFullYear(), now.getMonth() - 6, 10),
    endDate: new Date(now.getFullYear(), now.getMonth() + 2, 10),
    status: GoalStatusHelper.compute(1500, 2000),
    createdAt: now,
    updatedAt: now,
    userId: 4,
    transactionIds: [12],
  },
];
