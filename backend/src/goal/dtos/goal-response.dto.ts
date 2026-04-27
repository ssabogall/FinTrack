// internal imports
import type { Goal } from '../entities/goal.entity';

/**
 * Public-facing shape of a Goal.
 *
 * Adds two derived fields that the entity does NOT persist:
 *   - progressPercentage: how close the goal is to completion (0..100).
 *   - remaining: amount still needed to reach the target (>= 0).
 *
 * Both values are recomputed on every read from currentAmount and
 * targetAmount, so they cannot drift out of sync with the underlying
 * data. Keeping them out of the database also avoids the classic
 * derived-field-stale bug.
 */
export interface GoalResponseDto {
  id: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;

  // derived
  progressPercentage: number;
  remaining: number;
}

export class GoalResponseMapper {
  /**
   * Maps a Goal entity to its public DTO.
   *
   * SQLite returns `decimal` columns as strings via TypeORM, so we coerce
   * to number defensively before doing any arithmetic. Without this, both
   * progressPercentage and remaining would silently break with values
   * like "1500" / "3000" producing NaN or string concatenation.
   */
  public static fromEntity(goal: Goal): GoalResponseDto {
    const targetAmount = Number(goal.targetAmount);
    const currentAmount = Number(goal.currentAmount);

    return {
      id: goal.id,
      name: goal.name,
      description: goal.description,
      targetAmount,
      currentAmount,
      startDate: goal.startDate,
      endDate: goal.endDate,
      status: goal.status,
      createdAt: goal.createdAt,
      updatedAt: goal.updatedAt,
      userId: goal.userId,
      progressPercentage: GoalResponseMapper.computeProgress(currentAmount, targetAmount),
      remaining: GoalResponseMapper.computeRemaining(currentAmount, targetAmount),
    };
  }

  public static fromEntities(goals: Goal[]): GoalResponseDto[] {
    return goals.map((goal) => GoalResponseMapper.fromEntity(goal));
  }

  /**
   * Returns a percentage in the range [0, 100], rounded to 2 decimals.
   * Defensive against targetAmount === 0 (which the DTO already rejects
   * via @IsPositive, but the mapper is the last line of defense).
   */
  private static computeProgress(currentAmount: number, targetAmount: number): number {
    if (targetAmount <= 0) {
      return 0;
    }
    const raw = (currentAmount / targetAmount) * 100;
    const capped = Math.min(Math.max(raw, 0), 100);
    return Math.round(capped * 100) / 100;
  }

  private static computeRemaining(currentAmount: number, targetAmount: number): number {
    return Math.max(targetAmount - currentAmount, 0);
  }
}
