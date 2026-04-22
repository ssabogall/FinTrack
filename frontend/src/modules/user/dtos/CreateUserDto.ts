// author: Santiago Gómez

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}
