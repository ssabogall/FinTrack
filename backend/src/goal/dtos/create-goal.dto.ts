// external imports
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Input contract for POST /api/goals.
 *
 * NOTE: `userId` is accepted in the body as a temporary measure while the
 * authentication module is being implemented in a separate branch. Once
 * AuthGuard is in place, `userId` MUST be removed from this DTO and read
 * from the JWT payload via a @CurrentUser() decorator instead.
 */
export class CreateGoalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetAmount: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @IsPositive()
  userId: number;
}
