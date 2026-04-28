// author: Lucas Higuita
export interface UpdateTransactionDTO {
  amount?: number;
  description?: string;
  date?: string;
  categoryId?: number | null;
  goalId?: number | null;
}
