// External imports
import { IsNumber, IsString, IsOptional, IsDateString, Length, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNumber()
  amount!: number;

  @IsString()
  @Length(1, 255)
  description!: string;

  @IsDateString()
  @Type(() => Date)
  date!: Date;

  @IsString()
  @IsIn(['income', 'expense'])
  type!: 'income' | 'expense';

  @IsOptional()
  @IsNumber()
  categoryId?: number | null;

  @IsOptional()
  @IsNumber()
  goalId?: number | null;
}
