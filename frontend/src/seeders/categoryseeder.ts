import type { CategoryInterface } from '@/interfaces/CategoryInterface';

const now = new Date();

export const categorySeeder: CategoryInterface[] = [
  {
    id: 1,
    name: 'Salary',
    color: '#16A34A',
    type: 'income',
    createdAt: now,
    updatedAt: now,
    transactionIds: [1, 5],
  },
  {
    id: 2,
    name: 'Groceries',
    color: '#F97316',
    type: 'expense',
    createdAt: now,
    updatedAt: now,
    transactionIds: [2, 6, 9],
  },
  {
    id: 3,
    name: 'Rent',
    color: '#0EA5E9',
    type: 'expense',
    createdAt: now,
    updatedAt: now,
    transactionIds: [3],
  },
  {
    id: 4,
    name: 'Subscriptions',
    color: '#6366F1',
    type: 'expense',
    createdAt: now,
    updatedAt: now,
    transactionIds: [4, 7],
  },
  {
    id: 5,
    name: 'Savings',
    color: '#22C55E',
    type: 'transfer',
    createdAt: now,
    updatedAt: now,
    transactionIds: [8, 10, 11, 12],
  },
];

