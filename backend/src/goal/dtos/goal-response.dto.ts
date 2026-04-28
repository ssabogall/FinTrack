import type { Goal } from '../entities/goal.entity';

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
  progressPercentage: number;
  remaining: number;
}

export class GoalResponseMapper {
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
