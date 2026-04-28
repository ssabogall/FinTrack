// author: Lucas Higuita
export interface CreateTransactionDTO {
  amount: number;
  description: string;
  date: string;
  categoryId?: number | null;
  goalId?: number | null;
}
