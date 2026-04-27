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
 * Input contract for PATCH /api/goals/:id.
 *
 * All editable fields are optional (partial update). `userId` is required
 * and used as a temporary ownership check until the auth module lands:
 * the service rejects the request with 403 if it does not match the
 * persisted goal's userId. Once AuthGuard is in place, this field MUST be
 * removed and replaced with a @CurrentUser() decorator.
 *
 * `currentAmount` and `status` are intentionally NOT editable here:
 *   - currentAmount changes only via transactions linked to the goal.
 *   - status is derived (recomputed from currentAmount and targetAmount).
 */
export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  targetAmount?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsInt()
  @IsPositive()
  userId: number;
}
