export type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
};

export const USER_SEED_DATA: SeedUser[] = [
  {
    name: 'Admin User',
    email: 'admin@fintrack.local',
    password: 'admin123',
    role: 'admin',
  },
  {
    name: 'Alex Johnson',
    email: 'alex.johnson@fintrack.local',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Maria Lopez',
    email: 'maria.lopez@fintrack.local',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Daniel Kim',
    email: 'daniel.kim@fintrack.local',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'John Doe',
    email: 'john@email.com',
    password: 'password123',
    role: 'user',
  },
  {
    name: 'Jane Smith',
    email: 'jane@email.com',
    password: 'password123',
    role: 'user',
  },
];
