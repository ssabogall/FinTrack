export class UpdateGoalDto {
  name?: string;
  description?: string;
  targetAmount?: number;
  startDate?: string;
  endDate?: string;
  userId!: number;
}
