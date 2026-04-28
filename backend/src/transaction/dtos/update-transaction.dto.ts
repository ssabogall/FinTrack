export class UpdateTransactionDto {
	amount?: number;
	description?: string;
	date?: Date;
	type?: 'income' | 'expense';
	categoryId?: number | null;
	goalId?: number | null;
}
