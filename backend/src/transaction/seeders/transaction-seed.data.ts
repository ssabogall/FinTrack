export type SeedGoalRef = {
  userEmail: string;
  name: string;
};

export type SeedTransaction = {
  userEmail: string;
  amount: number;
  description: string;
  date: Date;
  categoryName: string | null;
  goalRef: SeedGoalRef | null;
};

const now = new Date();

export const TRANSACTION_SEED_DATA: SeedTransaction[] = [
  // Alex Johnson
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: 3200,
    description: 'Monthly salary',
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    categoryName: 'Salary',
    goalRef: null,
  },
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: -120,
    description: 'Groceries - supermarket',
    date: new Date(now.getFullYear(), now.getMonth(), 3),
    categoryName: 'Groceries',
    goalRef: null,
  },
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: -900,
    description: 'Monthly rent',
    date: new Date(now.getFullYear(), now.getMonth(), 5),
    categoryName: 'Rent',
    goalRef: null,
  },
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: -15,
    description: 'Music streaming subscription',
    date: new Date(now.getFullYear(), now.getMonth(), 7),
    categoryName: 'Subscriptions',
    goalRef: null,
  },

  // Maria Lopez
  {
    userEmail: 'maria.lopez@fintrack.local',
    amount: 2800,
    description: 'Monthly salary',
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    categoryName: 'Salary',
    goalRef: null,
  },
  {
    userEmail: 'maria.lopez@fintrack.local',
    amount: -90,
    description: 'Groceries - local market',
    date: new Date(now.getFullYear(), now.getMonth(), 4),
    categoryName: 'Groceries',
    goalRef: null,
  },
  {
    userEmail: 'maria.lopez@fintrack.local',
    amount: -20,
    description: 'Video streaming subscription',
    date: new Date(now.getFullYear(), now.getMonth(), 9),
    categoryName: 'Subscriptions',
    goalRef: null,
  },

  // Alex - savings transfers
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: -300,
    description: 'Transfer to savings - emergency fund',
    date: new Date(now.getFullYear(), now.getMonth(), 10),
    categoryName: 'Savings',
    goalRef: { userEmail: 'alex.johnson@fintrack.local', name: 'Emergency fund' },
  },

  // Daniel Kim
  {
    userEmail: 'daniel.kim@fintrack.local',
    amount: -150,
    description: 'Groceries - weekend shopping',
    date: new Date(now.getFullYear(), now.getMonth(), 12),
    categoryName: 'Groceries',
    goalRef: null,
  },

  // Alex - second emergency fund transfer
  {
    userEmail: 'alex.johnson@fintrack.local',
    amount: -200,
    description: 'Transfer to savings - emergency fund',
    date: new Date(now.getFullYear(), now.getMonth(), 15),
    categoryName: 'Savings',
    goalRef: { userEmail: 'alex.johnson@fintrack.local', name: 'Emergency fund' },
  },

  // NOTE: original frontend seeder pointed this transaction to Alex's
  // "Europe Vacation" goal, even though the transaction belongs to Maria.
  // We keep that exact behaviour to stay faithful to the source data.
  {
    userEmail: 'maria.lopez@fintrack.local',
    amount: -250,
    description: 'Transfer to savings - new laptop',
    date: new Date(now.getFullYear(), now.getMonth(), 18),
    categoryName: 'Savings',
    goalRef: { userEmail: 'alex.johnson@fintrack.local', name: 'Europe Vacation' },
  },

  // Same caveat: original seeder linked Daniel's transfer to Alex's "New Car".
  {
    userEmail: 'daniel.kim@fintrack.local',
    amount: -400,
    description: 'Transfer to savings - vacation trip',
    date: new Date(now.getFullYear(), now.getMonth(), 20),
    categoryName: 'Savings',
    goalRef: { userEmail: 'alex.johnson@fintrack.local', name: 'New Car' },
  },

  // John Doe
  {
    userEmail: 'john@email.com',
    amount: 3500,
    description: 'Monthly salary',
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    categoryName: 'Salary',
    goalRef: null,
  },
  {
    userEmail: 'john@email.com',
    amount: -140,
    description: 'Groceries - supermarket',
    date: new Date(now.getFullYear(), now.getMonth(), 2),
    categoryName: 'Groceries',
    goalRef: null,
  },
  {
    userEmail: 'john@email.com',
    amount: -18,
    description: 'Streaming subscription',
    date: new Date(now.getFullYear(), now.getMonth(), 8),
    categoryName: 'Subscriptions',
    goalRef: null,
  },

  // Same caveat: original seeder linked John's transfer to Alex's
  // "Emergency fund" rather than to John's own.
  {
    userEmail: 'john@email.com',
    amount: -250,
    description: 'Transfer to savings - emergency fund',
    date: new Date(now.getFullYear(), now.getMonth(), 11),
    categoryName: 'Savings',
    goalRef: { userEmail: 'alex.johnson@fintrack.local', name: 'Emergency fund' },
  },

  // Jane Smith
  {
    userEmail: 'jane@email.com',
    amount: 3100,
    description: 'Monthly salary',
    date: new Date(now.getFullYear(), now.getMonth(), 1),
    categoryName: 'Salary',
    goalRef: null,
  },
  {
    userEmail: 'jane@email.com',
    amount: -95,
    description: 'Groceries - local market',
    date: new Date(now.getFullYear(), now.getMonth(), 6),
    categoryName: 'Groceries',
    goalRef: null,
  },
  {
    userEmail: 'jane@email.com',
    amount: -220,
    description: 'Transfer to savings - wedding gift',
    date: new Date(now.getFullYear(), now.getMonth(), 16),
    categoryName: 'Savings',
    goalRef: { userEmail: 'jane@email.com', name: 'Wedding Gift' },
  },
];
