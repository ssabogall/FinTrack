export interface UserInterface {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;

  // relations
  transactionIds: number[] | null;
  goalIds: number[] | null;
}