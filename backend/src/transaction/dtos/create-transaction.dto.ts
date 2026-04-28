export class CreateTransactionDto {
  amount!: number;
  description!: string;
  date!: string;
  categoryId?: number | null;
  goalId?: number | null;
}
